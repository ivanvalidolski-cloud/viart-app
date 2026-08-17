/**
 * Scene 04 — the TURBO G8 dissolve (`#turbo`).
 *
 * Adapted from "Second Skin — Scroll-Scrubbed WebGL Dissolve Hero"
 * https://motionprompts.dev/component/ironhill-scroll-animation/
 *
 * This is the page's one heavy scene, and the only WebGL on it. Three coupled
 * systems, all the source's:
 *
 *   (A) a Three.js fullscreen clip-space quad on a transparent canvas that
 *       paints over the photograph
 *   (B) an fbm-noise fragment shader whose `uProgress` is the whole effect
 *   (C) `uProgress` driven by Lenis scroll position — not by ScrollTrigger —
 *       clamped at 1.1 and multiplied by `speed`, so the near-black sweeps up
 *       and over the frame within the first half of the section's range
 *
 *   (D) plus one ScrollTrigger that lights the paragraph word by word, each
 *       word owning an equal slice of that trigger's progress
 *
 * Adapted for this page: `three` is imported lazily so the hero never waits on
 * it; the scroll→progress formula is measured from the section's own top
 * instead of from document zero (the source's hero is the first thing on its
 * page, ours is not); the fill colour is the ViART ground; and the renderer
 * only draws while the section is on screen. Nothing about the sweep, the
 * noise, the clamp or the word fade changes.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type Lenis from 'lenis';
import { DISSOLVE } from '../tokens';
import { fragmentShader, vertexShader } from './dissolveShaders';

/** `#100905` → `[0.063, 0.035, 0.020]` for the shader's `uColor`. */
function normalizedRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export function createTurboDissolveScene(root: HTMLElement, lenis: Lenis) {
  const section = root.querySelector<HTMLElement>('.dissolve-scene');
  if (!section) return;

  const canvas = section.querySelector<HTMLCanvasElement>('.dissolve-canvas');
  const content = section.querySelector<HTMLElement>('.dissolve-content');
  const paragraph = content?.querySelector<HTMLElement>('.dissolve-copy');
  if (!canvas || !content || !paragraph) return;

  let cancelled = false;
  const teardowns: Array<() => void> = [];

  // --- (D) word-by-word fade ------------------------------------------------
  // Cheap, no GPU, and it must be alive whether or not WebGL ever comes up.
  const split = SplitText.create(paragraph, { type: 'words' });
  const words = split.words;
  gsap.set(words, { opacity: 0 });

  ScrollTrigger.create({
    trigger: content,
    start: 'top 25%',
    end: 'bottom 100%',
    onUpdate: ({ progress }) => {
      const count = words.length;
      words.forEach((word, index) => {
        const from = index / count;
        const to = (index + 1) / count;
        let opacity = 0;
        if (progress >= to) opacity = 1;
        else if (progress >= from) opacity = (progress - from) / (to - from);
        gsap.to(word, { opacity, duration: 0.1, overwrite: true });
      });
    },
  });

  teardowns.push(() => {
    gsap.killTweensOf(words);
    split.revert();
  });

  // --- (C) scroll → progress ------------------------------------------------
  let scrollProgress = 0;
  let sceneTop = 0;
  let maxScroll = 1;

  // Re-measured on `refresh` rather than `refreshInit`: the pinned scenes above
  // this one insert spacers, and only after a refresh has completed is this
  // section's document offset the one the user will actually scroll to.
  const measureRange = () => {
    sceneTop = section.getBoundingClientRect().top + window.scrollY;
    maxScroll = Math.max(1, section.offsetHeight - window.innerHeight);
  };

  const readScroll = (scroll: number) => {
    const local = (scroll - sceneTop) / maxScroll;
    scrollProgress = Math.max(0, Math.min(local * DISSOLVE.speed, DISSOLVE.clamp));
  };

  const onLenisScroll = ({ scroll }: { scroll: number }) => readScroll(scroll);

  measureRange();
  readScroll(window.scrollY);
  lenis.on('scroll', onLenisScroll);
  ScrollTrigger.addEventListener('refresh', measureRange);
  teardowns.push(() => {
    lenis.off('scroll', onLenisScroll);
    ScrollTrigger.removeEventListener('refresh', measureRange);
  });

  // The renderer is idle whenever the section is off screen. Frames nobody can
  // see are the only thing this skips — the uniform still tracks scroll.
  let onScreen = false;
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: ({ isActive }) => {
      onScreen = isActive;
    },
  });

  // --- (A) + (B) the WebGL layer, loaded lazily ----------------------------
  import('three')
    .then((THREE) => {
      if (cancelled) return;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        uniforms: {
          uProgress: { value: 0 },
          uResolution: {
            value: new THREE.Vector2(section.offsetWidth, section.offsetHeight),
          },
          uColor: { value: new THREE.Vector3(...normalizedRgb(DISSOLVE.color)) },
          uSpread: { value: DISSOLVE.spread },
        },
      });

      scene.add(new THREE.Mesh(geometry, material));

      const resize = () => {
        renderer.setSize(section.offsetWidth, section.offsetHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        material.uniforms.uResolution.value.set(section.offsetWidth, section.offsetHeight);
      };

      resize();
      window.addEventListener('resize', resize);

      let frame = 0;
      const animate = () => {
        material.uniforms.uProgress.value = scrollProgress;
        if (onScreen) renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };
      animate();

      // Stop the loop before disposing anything it touches, then give the GPU
      // resources back — a leaked context is a hard per-page limit, and the
      // page eventually stops being able to create one at all.
      teardowns.push(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', resize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      });
    })
    .catch(() => {
      // No WebGL, no dissolve: the photograph underneath is rendered
      // unconditionally, so the scene degrades to a still frame.
    });

  return () => {
    cancelled = true;
    teardowns.forEach((teardown) => teardown());
  };
}
