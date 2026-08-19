'use client';

/**
 * Magic UI — Number Ticker
 * https://magicui.design/docs/components/number-ticker
 *
 * The official implementation, unchanged: a spring driving the value once the
 * span comes into view, written straight to `textContent` so the count never
 * re-renders the tree.
 *
 * It carries the two review counts that were already on the page. The 5,0 rating
 * stays plain text on purpose — the upstream formatter is `en-US`, so a decimal
 * would render with a point and change the number as printed.
 */

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/app/lib/cn';

interface NumberTickerProps extends ComponentPropsWithoutRef<'span'> {
  value: number;
  startValue?: number;
  direction?: 'up' | 'down';
  delay?: number;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = 'up',
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isInView) {
      timer = setTimeout(() => {
        motionValue.set(direction === 'down' ? startValue : value);
      }, delay * 1000);
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [motionValue, isInView, delay, value, direction, startValue]);

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
        }
      }),
    [springValue, decimalPlaces],
  );

  return (
    <span
      ref={ref}
      className={cn('inline-block tracking-wider text-black tabular-nums dark:text-white', className)}
      {...props}
    >
      {startValue}
    </span>
  );
}
