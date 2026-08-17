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

  // One reusable tween per word instead of a fresh `gsap.to` per word per tick.
  // At any scroll position exactly one word is mid-fade and the rest are already
  // at 0 or 1, so the source's loop was allocating a full set of tweens sixty
  // times a second to move a single value — the same 0.1s catch-up, at a
  // fraction of the cost, and no stack of overlapping tweens on one word.
  const fadeTo = words.map((word) =>
    gsap.quickTo(word, 'opacity', { duration: 0.1, ease: 'power1.out', overwrite: true }),
  );
  const lastOpacity = words.map(() => 0);

  ScrollTrigger.create({
    trigger: content,
    start: 'top 25%',
    end: 'bottom 100%',
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      const count = words.length;
      for (let index = 0; index < count; index += 1) {
        const from = index / count;
        const to = (index + 1) / count;
        let opacity = 0;
        if (progress >= to) opacity = 1;
        else if (progress >= from) opacity = (progress - from) / (to - from);
        if (Math.abs(opacity - lastOpacity[index]) < 0.001) continue;
        lastOpacity[index] = opacity;
        fadeTo[index](opacity);
      }
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

  // The renderer is idle whenever the section is off screen — and so is its rAF
  // loop, which would otherwise keep a frame callback alive for the whole page.
  // The uniform still tracks scroll through the Lenis listener above, so
  // re-entering draws the correct frame immediately.
  let onScreen = false;
  let startRenderLoop: (() => void) | null = null;
  let stopRenderLoop: (() => void) | null = null;

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: ({ isActive }) => {
      onScreen = isActive;
      if (isActive) startRenderLoop?.();
      else stopRenderLoop?.();
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

      // Reallocating the drawing buffer is the most expensive thing this scene
      // can do, and on a phone the address bar sliding away fires `resize` for
      // a height change the canvas has no reason to care about — the section is
      // sized in `svh`, which does not move with the browser chrome. Only a
      // genuine change in the section's box reaches the renderer, and the pixel
      // ratio is set first so the very first buffer is already the right one.
      let lastWidth = 0;
      let lastHeight = 0;
      const resize = () => {
        const width = section.offsetWidth;
        const height = section.offsetHeight;
        if (width === lastWidth && height === lastHeight) return;
        lastWidth = width;
        lastHeight = height;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        material.uniforms.uResolution.value.set(width, height);
      };

      resize();
      window.addEventListener('resize', resize);

      let frame = 0;
      const animate = () => {
        material.uniforms.uProgress.value = scrollProgress;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };

      stopRenderLoop = () => {
        if (!frame) return;
        cancelAnimationFrame(frame);
        frame = 0;
      };
      startRenderLoop = () => {
        if (frame) return;
        frame = requestAnimationFrame(animate);
      };

      // The section may already be on screen by the time `three` finishes
      // loading, in which case the toggle that would have started the loop has
      // already fired.
      if (onScreen) startRenderLoop();

      // Stop the loop before disposing anything it touches, then give the GPU
      // resources back — a leaked context is a hard per-page limit, and the
      // page eventually stops being able to create one at all.
      teardowns.push(() => {
        stopRenderLoop?.();
        startRenderLoop = null;
        stopRenderLoop = null;
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
