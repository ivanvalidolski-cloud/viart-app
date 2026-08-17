'use client';

/**
 * ViART motion primitives (Framer Motion / `motion` package).
 *
 * Rules of use:
 * - Never wrap an element in an extra <div>. Pass `as` and reuse the element's
 *   own className so grid/flex placement in globals.css stays intact.
 * - Motion here owns `opacity` + `y` only. Elements that already animate via
 *   CSS keyframes (`.price-content`, `.active-review`, `.gallery-media`,
 *   `.media-continuity`) must NOT be wrapped in these primitives.
 * - Reduced motion is respected: the reveal degrades to an instant appearance.
 */

import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const DURATION = 0.7;
const DISTANCE = 26;

type MotionTag =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'figure'
  | 'header'
  | 'footer'
  | 'ul'
  | 'ol'
  | 'li'
  | 'p'
  | 'h2'
  | 'h3'
  | 'span';

type RevealProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  as?: MotionTag;
  children?: ReactNode;
  /** Seconds of delay before the reveal starts. */
  delay?: number;
  /** Travel distance in px. Use 0 for pure fades on large media. */
  distance?: number;
  /** Share of the element that must be visible before it reveals. */
  amount?: number;
};

/** Single scroll-triggered reveal: fade up, once, on enter. */
export function Reveal({
  as = 'div',
  children,
  delay = 0,
  distance = DISTANCE,
  amount = 0.25,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as] as ElementType;

  return (
    <Tag
      initial={{ opacity: 0, y: reduced ? 0 : distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: reduced ? 0 : DURATION,
        delay: reduced ? 0 : delay,
        ease: EASE,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type StaggerProps = Omit<RevealProps, 'distance'> & {
  /** Seconds between each child's reveal. */
  step?: number;
};

/**
 * Container for staggered children. It does not animate itself — it only
 * orchestrates every <RevealChild> beneath it.
 */
export function RevealGroup({
  as = 'div',
  children,
  delay = 0,
  step = 0.08,
  amount = 0.2,
  ...rest
}: StaggerProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as] as ElementType;

  const variants: Variants = {
    hidden: {},
    shown: {
      transition: {
        staggerChildren: reduced ? 0 : step,
        delayChildren: reduced ? 0 : delay,
      },
    },
  };

  return (
    <Tag initial="hidden" whileInView="shown" viewport={{ once: true, amount }} variants={variants} {...rest}>
      {children}
    </Tag>
  );
}

type ChildProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  as?: MotionTag;
  children?: ReactNode;
  distance?: number;
};

/** Direct child of <RevealGroup>. Inherits the group's stagger timeline. */
export function RevealChild({ as = 'div', children, distance = 18, ...rest }: ChildProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as] as ElementType;

  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : distance },
    shown: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : DURATION, ease: EASE },
    },
  };

  return (
    <Tag variants={variants} {...rest}>
      {children}
    </Tag>
  );
}
