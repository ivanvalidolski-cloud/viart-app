/**
 * Magic UI — Interactive Hover Button
 * https://magicui.design/docs/components/interactive-hover-button
 *
 * The official implementation, unchanged: a dot that scales to a hundred times
 * its size to become the fill, the resting label sliding out and fading, and the
 * second label arriving from the right — all three on the same 300ms group
 * transition.
 *
 * Two adaptations. The upstream trailing icon is lucide's `ArrowRight`; here it
 * is the site's own `↗` glyph, which is what every other booking control on the
 * page already carries. And `InteractiveHoverLink` is the same markup with an
 * anchor root, because most of ViART's primary calls to action are links to
 * YCLIENTS rather than buttons — labels and hrefs are untouched either way.
 */

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/app/lib/cn';

function HoverContent({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <div className="bg-primary h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]" />
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="text-primary-foreground absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <span aria-hidden="true">↗</span>
      </div>
    </>
  );
}

const SHELL =
  'group bg-background relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold';

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(SHELL, className)} {...props}>
      <HoverContent>{children}</HoverContent>
    </button>
  );
}

export function InteractiveHoverLink({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(SHELL, className)} {...props}>
      <HoverContent>{children}</HoverContent>
    </a>
  );
}
