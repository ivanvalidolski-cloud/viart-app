/**
 * The `cn` helper the imported Magic UI components expect.
 *
 * Upstream this is `clsx` + `tailwind-merge`. Here the components are only ever
 * handed a ViART class to sit alongside their own utilities — never a competing
 * Tailwind utility — so joining the truthy values is enough, and the project
 * stays at two runtime dependencies fewer.
 *
 * Project rules land on top regardless of order: Tailwind v4 emits its
 * utilities inside `@layer utilities`, and unlayered author styles — everything
 * in `globals.css` after the import — outrank a layered rule of the same
 * specificity.
 */
export type ClassValue = string | number | null | undefined | false;

export function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(' ');
}
