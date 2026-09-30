@AGENTS.md

# Portfolio

Portfolio site for Asadullah Kashif, who goes by Kashif. The design references, decisions and page flow are in `reference.md`; read it before any design work.

## Stack
- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind v4 (tokens in `src/app/globals.css`).
- Motion: GSAP 3 (ScrollTrigger, SplitText) via `@/lib/gsap` only, with Lenis smooth scroll in `SmoothScroll`. Do not add Motion/Framer Motion (don't mix it with GSAP).
- 3D: plain three.js, imperative, in `src/experience/gl/` (loaded as a separate chunk). One shared views canvas renders the phone, ribbons and card with scissor viewports; the hero has its own canvas.

## Structure
- `src/components/xp/*`: server-rendered sections (the content is readable without JS).
- `src/experience/`: the client engine. `choreo.ts` holds the GSAP scroll scenes and writes progress into `state.ts`; `gl/` holds the WebGL scenes that read it. `Experience.tsx` mounts it on the `.xp` root.
- `src/styles/experience.css`: section styles, ported from the approved Fusion prototype.
- `/work/[slug]`: static case-study pages generated from `site.projects`.

## Conventions
- All copy lives in `src/content/site.ts` and must be public-safe. Internal research notes stay in the git-ignored `private/` folder.
- Sections render readable static content first; motion and WebGL enhance it. Every effect must respect `prefers-reduced-motion`.
- One accent colour: orange #FF5B14 (`--accent` in globals.css, `--acc` in experience.css, `ACCENT` in experience/config.ts). No em dashes in UI copy.
- Pins use ScrollTrigger `start: "top top"`. Never use `window.addEventListener("scroll")`.
- The GitHub repo is `A-Kashif108/portfolio`. The active `gh` account is a different one, so use `GH_TOKEN=$(gh auth token --user A-Kashif108)` per command.
