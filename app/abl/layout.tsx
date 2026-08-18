import type { Metadata } from 'next';
import { Oswald } from 'next/font/google';
import './abl.css';

/**
 * Display face for the ABL route only.
 *
 * The global type system stays untouched: Onest still carries body copy and
 * Martian Mono still carries the labels, both inherited from the root layout.
 * What the site does not have is a display face that can hold a headline at
 * 10rem — the global `h1,h2,h3` rule points at a Playfair serif, which belongs
 * to a beauty studio and cannot carry a sports composition. Oswald is condensed,
 * heavy and covers Cyrillic, and it is scoped to this subtree by the variable
 * below rather than added to the root layout.
 */
const oswald = Oswald({
  variable: '--font-abl-display',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'ABL Basketball School',
  description:
    'Баскетбольная школа ABL. Группы по 7–15 человек, две-три тренировки в неделю.',
};

export default function AblLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={oswald.variable}>{children}</div>;
}
