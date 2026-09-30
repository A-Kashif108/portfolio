@AGENTS.md

# Portfolio

Kashif Asadullah's portfolio site. The design references, decisions and page flow are in `reference.md`; read it before any design work.

## Stack
- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind v4 (tokens in `src/app/globals.css`).
- Motion: GSAP 3 (ScrollTrigger, SplitText) via `@/lib/gsap` only, with Lenis smooth scroll in `SmoothScroll`. Do not add Motion/Framer Motion (don't mix it with GSAP).
- 3D: three, @react-three/fiber, @react-three/drei. Keep canvases in client-leaf components.

## Conventions
- Content lives in `src/content/site.ts`. It is placeholder until the user supplies real copy.
- Sections render readable static content first; motion and WebGL enhance it. Every effect must respect `prefers-reduced-motion`.
- Use one accent colour (`--accent`, switched with `html[data-accent]`) and no em dashes in UI copy.
- Pins use ScrollTrigger `start: "top top"`. Never use `window.addEventListener("scroll")`.
- The GitHub repo is `A-Kashif108/portfolio`. The active `gh` account is a different one, so use `GH_TOKEN=$(gh auth token --user A-Kashif108)` per command.
