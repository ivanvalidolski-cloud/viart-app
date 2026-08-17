This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Design & animation stack

| Layer | Where |
|---|---|
| Visual system (CSS) | `app/globals.css` |
| Animation layer | `app/lib/motion/` — see its `README.md` |
| Design & review skills | `.claude/skills/` (6 skills, see `AGENTS.md`) |
| Tool permissions for Claude Code | `.claude/settings.json` |
| 21st.dev Magic MCP server | `.mcp.json` (needs `TWENTY_FIRST_API_KEY`) |

Animation is [GSAP](https://gsap.com) (ScrollTrigger + SplitText) with
[Lenis](https://lenis.darkroom.engineering) as the scroll driver, started once from
`useViartMotion`. Adding an entrance to a section is a markup change — put
`data-reveal` on the element; see `app/lib/motion/README.md`.

Two cautions when editing:

- `globals.css` contains a second styling pass appended at the end that re-declares
  about half of its rules. The later declaration wins — grep the whole file and edit
  the last occurrence.
- There is deliberately no `scroll-behavior: smooth`; Lenis owns the scroll position.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
