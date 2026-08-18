import Image from 'next/image';

/**
 * One media frame for the ABL prototype, in either of two states.
 *
 * No ABL photography exists in the project yet, so every frame currently
 * renders an annotated placeholder: the frame's proportions, the marked focal
 * point, and the regions no text or UI may cover. That keeps the composition
 * verifiable now and makes the swap a one-line change later — add `src` and the
 * real asset takes over, using `focal` as its `object-position` so the subject
 * lands exactly where the layout was designed around it.
 *
 * The placeholder carries `role="img"` and the brief as its accessible name, so
 * the section still reads correctly to a screen reader in prototype state.
 */

export type SafeZone = {
  /** Printed inside the region on the placeholder. */
  label: string;
  /** CSS `inset` shorthand in per-cent: top right bottom left. */
  inset: string;
};

type AblMediaProps = {
  /** Point this at a real asset and the placeholder disappears. */
  src?: string;
  /** Alt text for the real asset. */
  alt: string;
  /** Short slot id, printed on the placeholder frame. */
  slot: string;
  /** What the frame has to contain. Also the placeholder's accessible name. */
  brief: string;
  /** Subject position, as `object-position` — e.g. `'68% 30%'`. */
  focal: string;
  /** Regions that overlaying text, CTA or UI must never cover. */
  safe: SafeZone[];
  /** Layout hint for the real asset. */
  sizes?: string;
  /**
   * Reveal attribute for the frame itself, when it is not already wrapped in a
   * revealing element. Large media fades and never slides, so this is `media`.
   */
  reveal?: 'media';
  className?: string;
  priority?: boolean;
};

/**
 * The frame's proportions are not a prop. They are set in `abl.css` through
 * `--abl-ratio`, because both sections change the crop between breakpoints —
 * an inline style would win over the media query and freeze the mobile ratio on
 * desktop.
 */
export function AblMedia({
  src,
  alt,
  slot,
  brief,
  focal,
  safe,
  sizes = '100vw',
  reveal,
  className,
  priority,
}: AblMediaProps) {
  const [focalX, focalY] = focal.split(/\s+/);

  return (
    <div
      className={className ? `abl-media ${className}` : 'abl-media'}
      data-reveal={reveal}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: 'cover', objectPosition: focal }}
        />
      ) : (
        <div className="abl-media-ph" role="img" aria-label={brief}>
          <span className="abl-media-ph-slot" aria-hidden="true">
            {slot}
          </span>

          {safe.map((zone) => (
            <span
              key={zone.label}
              className="abl-media-ph-safe"
              style={{ inset: zone.inset }}
              aria-hidden="true"
            >
              <i>{zone.label}</i>
            </span>
          ))}

          <span
            className="abl-media-ph-focal"
            style={{ left: focalX, top: focalY }}
            aria-hidden="true"
          />

          <span className="abl-media-ph-brief" aria-hidden="true">
            {brief}
          </span>
          <span className="abl-media-ph-meta" aria-hidden="true">
            focal {focal}
          </span>
        </div>
      )}
    </div>
  );
}
