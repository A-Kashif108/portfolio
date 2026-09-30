# Portfolio References

Design and tech references for the portfolio site, with notes on what each one is for.

## Primary references

### ThreeUI
- **URL:** https://threeui.com
- **What it is:** Three.js / WebGL components, templates and interactive shaders, made by Design+Code.
- **Stack:** Three.js, WebGL2/WebGPU, GSAP, Lenis, EffectComposer post-processing.
- **Install:** `@designcodeio/threeui` package. There's also an MCP integration (https://threeui.com/mcp).
- **Pricing:** Pro is $199/year or $299 lifetime. Free tier is unclear.
- **Worth a look:**
  - Heroes: Cortexa (point-cloud bust), Anima, Betawise Particle, Meridian (Earth from orbit), Advanced Glass Material, Skyfield (terrain).
  - Backgrounds: Liquid Form (ray-marched metal), Tideform Phase Field, Orbital Dust, Energy Orb.
  - Buttons: Liquid Glass, Water Ripple, Holographic Foil.
  - Text: Semantic Bloom, Typography Vortex, Gallery Heading variants (halftone, riso, glitch).
- **Use for:** the 3D hero centrepiece and one or two shader details.

### StringTune (Fiddle.Digital)
- **URL:** https://string-tune.fiddle.digital/
- **What it is:** A CSS-first, JS-light library for smooth scrolling and web animation. You turn effects on with HTML attributes, for example `string="progress"`, `string="split"`, `string="parallax"`, `string="spotlight|cursor"`, `string="impulse"`, `string="lazy"`.
- **Install:** `npm i @fiddle-digital/string-tune` (v1.2.5, MIT).
- **Design lessons from the site:**
  - One story runs through the whole page (katana and samurai), with a guide character in a dialogue box.
  - A single 3D object leads the page: a grainy, noise-textured katana that is drawn from its sheath as you scroll.
  - Giant grotesk type, with words blurring into focus on scroll ("Concentrate", "Keep Scrolling").
  - The theme switches mid-scroll (dark, then light lavender-grey, then dark) through curved clip-path and pixel-block transitions.
  - A pinned section swaps words (Native / Lightweight / Attributes / Flexibility) while four columns highlight in turn.
  - A bento feature grid, illustrated art bands, and a mirrored giant wordmark with an octagon-masked image in the footer.
  - Small details: a scroll-percent readout, a top progress bar in the accent colour, and a vertical FPS and scroll-position readout.
- **Use for:** the quality bar, story structure and scroll choreography. The library itself is an option for attribute-driven effects.

### GSAP
- **URL:** https://gsap.com
- **What it is:** A professional JavaScript animation library.
- **Licensing:** 100% free for commercial use since the Webflow acquisition, including SplitText, ScrollSmoother, MorphSVG, DrawSVG, Flip, Draggable and Inertia.
- **Install:** `npm i gsap @gsap/react`, then import plugins from `gsap/ScrollTrigger`, `gsap/SplitText`, and so on.
- **Key plugins:** ScrollTrigger (pin and scrub), SplitText (text reveals), Flip (layout transitions), Draggable, Observer, ScrollSmoother, DrawSVG.
- **React:** the `useGSAP()` hook from `@gsap/react`.
- **Official AI skills:** https://github.com/greensock/gsap-skills. Install with `/plugin marketplace add greensock/gsap-skills` or `npx skills add https://github.com/greensock/gsap-skills`.
- **Use for:** all scroll choreography: pinned sequences, horizontal pans, sticky stacks and text reveals.

### 21st.dev
- **URL:** https://21st.dev
- **What it is:** A community registry of React, Tailwind and shadcn components: heroes, shaders, backgrounds, text effects, navbars, pricing and more.
- **Install:** through the shadcn CLI (registry format), or `npx @21st-dev/cli@latest init --client claude` for the agent / MCP workflow.
- **Worth a look:** Dither Prism Hero, Shader Background (Plasma, Mesh drift, Smoke), Portfolio Banner (dithering), and Paper Design shaders (Paper Texture, Dithering, Mesh Gradient).
- **Use for:** UI building blocks, restyled to our tokens. Never ship them in their default look.

### Taste skill (design-taste-frontend)
- **Location:** `~/.claude/skills/design-taste-frontend/SKILL.md`
- **What it is:** Rules against "AI slop" for landing pages and portfolios.
- **Key rules:**
  - Keep to one accent colour, with no AI-purple glow.
  - Don't use Inter or a serif as the default font.
  - Don't use three identical cards in a row.
  - Allow at most one marquee per page.
  - No em dashes anywhere.
  - Use eyebrows (small labels above headings) sparingly: at most one per three sections.
  - Every animation needs a stated reason.
  - Support `prefers-reduced-motion` and design both dark and light themes.
  - Pin with `start: "top top"`, and never use `window.addEventListener('scroll')`.
- **Dials for this project:** DESIGN_VARIANCE 8, MOTION_INTENSITY 8, VISUAL_DENSITY 3. These fit a cinematic developer portfolio.

## UI libraries for premium feel (researched 2026-09-30)

**Summary:**
- **Vengeance UI** is the main source: MIT, and much of it is already GSAP.
- **Skiper UI** is a pattern library. Take its free GSAP and CSS pieces only. **Pro was skipped (decided 2026-09-30).**
- **Animmaster** is a visual reference only.

Screenshots are in the session scratchpad under `ui-libs/`.

| Library | What it is | Tech | Note |
|---|---|---|---|
| Animmaster | https://animmasterlib.dev/ : 300 components delivered as a zip after paying on Telegram or WhatsApp. PRO $4.99, Premium $8. No npm package or docs; previews are video only | Mostly vanilla JS + GSAP + three.js / WebGL | The license forbids redistribution, so its code can't go in a public repo. Many pieces are rebuilt Codrops demos. **Visual reference only.** Ideas worth borrowing: webgl-4 (lens distortion), physic-5 (draggable physics words), hover-4 (hovered row turns into a marquee), mouse-12 (reactive point cloud) |
| Skiper UI | https://skiper-ui.com : 107 components (skiper1–107), about 38 free. **Pro is $129 one-time.** Free components need a credit to Skiper UI; Pro components can't be redistributed, so Pro source can't go in a public repo | Install with `npx shadcn add @skiper-ui/skiperNN` (Pro needs `SKIPER_LICENSE_KEY` and a registry entry in `components.json`). Motion-first: every registry item lists framer-motion as a dependency, and many demos wrap themselves in their own `<ReactLenis>`, which would clash with our global Lenis. Only skiper17 and skiper39 use GSAP | **Pattern library; port to GSAP by hand, don't run `shadcn add` blind.** Free and no Motion needed: skiper17 (GSAP card stack with rotate, for posters), skiper40 (CSS link underlines), skiper66 (SVG clip-path mask, for the intro), skiper41 (progressive blur). Free and a small port: skiper19 (scroll-drawn SVG line, for callouts), skiper31 (tech-stack text scroll), skiper58 (text-roll nav), skiper61 (mouse follow), skiper16 (card stack). Pro candidates, if you buy it: skiper70 (word-fill box), skiper71 (image reveal), skiper5 (drag stickers), skiper12 (Vercel liquid-sim shader, for the lens), skiper9/10 (stairs preloader) |
| Vengeance UI | https://www.vengeanceui.com/ , **MIT, all free**. About 70 effects plus about 100 blocks ([GitHub](https://github.com/Ashutoshx7/VengeanceUI)) | Install: shadcn registry `@vengeanceui` → `https://raw.githubusercontent.com/Ashutoshx7/VengeanceUI/main/public/r/{name}.json`. Tech is mixed: framer-motion, GSAP 3.15, R3F and CSS. It targets our exact stack | **Best fit.** Already GSAP or CSS, so no port needed: reveal-loader, gooey-text-reveal, staggered-grid, image-scatter, line-hover-link, pixelated-image-trail, awwwards-nav, animated-footer, kinetic-text-loader. A small port: twisting-ribbon, stagger-text, animated-number. Avoid the spring-heavy Motion items. Check each component before adopting it, since quality varies |

Rule: the site stays on GSAP, and Motion (Framer Motion) is not added. Library components are used as design references or ported.

## Supporting libraries

| Library | Purpose | Notes |
|---|---|---|
| Three.js / React Three Fiber | 3D hero scenes, particles, shaders | `three`, `@react-three/fiber`, `@react-three/drei` |
| Lenis | Smooth scrolling synced with ScrollTrigger | `lenis`. Already used by ThreeUI |
| Paper Design shaders | Free shader backgrounds (dithering, mesh gradient) | `@paper-design/shaders-react`. Also on 21st.dev |
| Next.js + Tailwind v4 | App framework and styling | Proposed stack. Hosting on Vercel |

Taste-skill rule: don't mix GSAP or Three.js with Motion (Framer Motion) in the same component tree. Pick GSAP as the main motion engine.

## Concept explorations

- **Round 1: five colour themes** (Signal, Chrome, Halftone, Field, Blueprint). Rejected as too basic: they were colour swaps on a static layout, with no story or scroll choreography.
  https://claude.ai/artifact/JG8piVM7yHs1BNZib8nLwG
- **Round 2: four story-driven concepts.** Each is a full scroll-driven page modelled on StringTune.
  https://claude.ai/artifact/1dTqHbx2hNiB58b4NX3NML
  - **A. Exploded View:** a grainy point-cloud phone that splits into its tech layers.
  - **B. Flow:** particles that morph between shapes as you scroll.
  - **C. Source:** ASCII code that compiles into a product.
  - **D. Poster:** kinetic condensed type, draggable stickers and sticky-stack project posters.

## Round 4: five full-flow options (2026-09-30)

All five implement the decided flow: intro, video-style hero, exploded phone, the Poster half with ribbons and posters, and the steel-card contact. They differ in visual world.
https://claude.ai/artifact/BRn2NGStmYeJgu6Z4VKgGH

- **Grain:** point clouds, film grain and riso posters. Orange. Pixel-block dissolve transitions.
- **Forge:** machined brushed metal and industrial condensed type. Hazard yellow. Diagonal blade-cut transitions.
- **Glass:** frosted glass layers with glowing UI. Electric blue. Liquid-lens transitions.
- **Draft:** technical drawing, with the wireframe phone plotted as you scroll and blueprint posters. Signal red. Plotter-sweep transitions.
- **Arcade:** voxel phone, a pixel mascot guide and a holographic foil card. Hot pink. Pixel-mosaic transitions.

**Round 4 pick:** Grain and Glass. Merge as "dots inside glass":
- Frosted glass slabs with the grainy point-cloud UI suspended inside.
- A glass hero with film grain.
- Liquid-lens transitions.
- Riso ribbons and posters in the light half.

Round 5 Fusion page: https://claude.ai/artifact/DUjU9zSCFrsVcYRpcG6s43

**Accent decided (2026-09-30): orange #FF5B14.** The blue option and the accent toggle are dropped from the final site.

## Round 3 references (researched 2026-09-30)

Screenshots, recordings and downloaded source are in the session scratchpad under `round3/`.

### Era Residence: welcome animation
- **URL:** https://era-residence.com
- **Stack:** Webflow, GSAP 3.15 (ScrollTrigger, SplitText, CustomEase), Lenis, Barba. No WebGL.
- **Sequence (about 10s on first visit, about 3s on repeat visits via a `sessionStorage` flag):**
  1. A burgundy overlay locks scroll.
  2. SplitText letter flips run (`rotateY 90 → 0`, `yPercent 50 → 0`, 1.2s, 0.3s delay). A thin line draws in with `clip-path`, and a faint script watermark fades up.
  3. A fake loading bar runs for 4s.
  4. An **arch-shaped window** rises (`--arch-w 24vw → 36vw`, `--arch-y 104vh → 15vh`, 1.5s, ease `0.75,0,0.25,1`), then balloons past the screen edges (`→ 125vw / -100vh`, 2.4s, ease `0.6,0,0,1`). Meanwhile the hero image scales from 0.75 to 1 and the hero headline flips in.
- **How the window works:** a CSS `mask-image` stack (three gradient rectangles plus an SVG rectangle with an arch cut out), sized from two CSS variables that GSAP animates.
- **Our version:** keep it to 3–4s, run it once per session, and use a phone-screen shape (rounded rectangle) instead of an arch. Reduced motion skips it.

### Moto Card: 3D stainless-steel card
- **URL:** https://moto-card.com
- **Stack:** Webflow, GSAP 3.15, Lenis, and Three.js r181 through an importmap. The model was exported from Spline.
- **The hero card is a pre-rendered video.** The real 3D card appears in one section: 250vh tall with a sticky 100vh canvas. Scrubbed on scroll, it rises from y -1.69 to 0.31 and spins 270° (`rotation.y -1.5π → 0`), inside a ring of photo tiles (5 × 18), with a blur on the bottom 48% of the frame.
- **Material:** a custom shader with metalness 0.87 and roughness 0. The chrome sweep comes from a **matcap** (a studio-softbox image). A 1K atlas acts as both the bump map (engraving) and the print, plus a planar reflection updated every 3 frames. No HDR.
- **No cursor interaction.**
- **Our version:** in R3F, a drei `RoundedBox` with `meshPhysicalMaterial` (metalness 1, roughness about 0.18, anisotropy 0.8, clearcoat 0.4) and a bump map for engraving, lit by an `<Environment>` made of `<Lightformer>` strips. Scroll-scrubbed spin, plus a cursor tilt, which is an improvement on theirs.

### Pensatori Irrazionali: ripple flags
- **URL:** https://pensatori-irrazionali.com
- **Stack:** Next.js (App Router), Tailwind, Lenis, GSAP (ScrollTrigger, SplitText), and Three.js r182 with WebGPU and TSL.
- **The cloth is not live 3D.** About 30 branded ribbons are a pre-rendered **looping video** (2560×1440, 5s, `mix-blend-multiply` over #F5F5F5). A fullscreen fragment shader (WebGPU WGSL, with a WebGL fallback) warps the video's UVs:
  - An ambient wobble.
  - Cursor drag, swirl and pressure, with a radius of about 0.21–0.5 UV, scaled by pointer speed.
  - Up to 4 click ripples (2.6s each).
  - Pinned edges.
- **Our version:** live R3F cloth, meaning segmented planes with a vertex shader, a pinned edge, layered sines plus noise, and amplitude tied to scroll speed. Add their cursor and click-ripple pass on top. Each ribbon is printed with a label.

### Hobro: video hero
- **URL:** https://hobro.digital
- **Stack:** a plain-JS single-page app with GSAP 3.12 (SplitText, CustomEase, MorphSVG, Draggable) and Lenis. The site uses Cloudflare bot protection.
- **Sequence:**
  1. A loader bar (at least 4.5s).
  2. Two black curtains collapse from the middle outwards (`scaleY → 0`, 1s) while the video scales from 0 to 1.
  3. The title letters rise one by one (stagger 0.1, ease `0,0,0.1,1`), and the video starts playing.
- **After the intro the video just scrolls with the page:** no pin or mask. It is self-hosted AV1/H.265 at 4K, iPad and mobile sizes, with a WebP poster.
- **Our version:** add a pinned exit, where the video shrinks into a rounded card (`inset(8% 12% round 24px)`) as you scroll away.
- **Asset needed:** an 8–15s seamless loop, muted and low-motion. Desktop at 1920×1080 in AV1 plus an H.264 fallback, no more than 4MB. Mobile at 720×1280, no more than 1.5MB. Poster as WebP, no more than 60KB.

## Decisions (2026-09-30)

- **Base story:** concept A, Exploded View, merged with concept D, Poster. Poster becomes the light half of the page, after the curved theme flip.
- **Steel card:** used as the contact business card, engraved with name, role and email. It spins into view in the contact section, can be tilted by dragging, and has a button that copies the email.
- **Hero video:** a 10s seamless loop rendered from our own 3D scene. The user doesn't need to supply footage.
- **Ribbons:** show the tech stack (Flutter, Dart, Go, C++, Python, JavaScript and tools), one coloured ribbon per technology.
- **Page flow:**
  1. **Dark:** Intro, Era-style, with a phone-screen window.
  2. **Dark:** Video hero, Hobro-style, that shrinks into a card on scroll.
  3. **Dark:** The Exploded View phone separating into 5 tech layers.
  4. **Curved flip to light**, into the Poster world:
     - A giant condensed "KASHIF".
     - Tech-stack ribbons with ripples.
     - Work shown as stacking posters.
     - The word-fill statement and draggable stickers.
  5. **Curved flip back to dark:** the steel business card and contact.
- **Visual system:** one orange accent across both halves. Geist for the dark half; Archivo condensed 900 for the Poster display type.

## Content decisions (2026-09-30)

- **Featured projects:** Curie Money work, Twine, FileCosmos.
- **Public email** (steel card and contact): asadullahkashif108@gmail.com.
- **Photo:** none.
- **Bio:** option B was chosen from 5 drafts: "I build apps layer by layer. The interface in Flutter, a BFF that shapes the data, payments over UPI. At Curie Money I work across all of it, and I care most about the layer you feel: the details. IIT Roorkee CSE graduate, based in Bengaluru, India."
  - Voice: confident and minimal.
  - Audience: recruiters, founders and clients, and engineers.
  - Values: all of them, but details and polish most.
- **Curie Money timeline:** intern from October 2024, full-time Software Engineer from 15 June 2025 (corrected from July). LinkedIn is https://www.linkedin.com/in/asadullah-kashif-9a3301208/ . The dates haven't been checked against LinkedIn yet (it returns HTTP 999 to automated reads). Project details come from a separate Claude session that has work access.
- **Projects** (details in `src/content/site.ts`):
  - **Curie Money:** researched by the Curie session. Notes are in the git-ignored `private/`.
  - **Twine:** researched from `~/project/twine`. Framed as "built for my partner and me", shown as "In private testing" with no link, and the poster uses the logo art only.
  - **FileCosmos:**
    - A 2023 five-person team project over about 3 weeks. Kashif set up and built the Flutter app (map, upload, app flow, backend wiring).
    - Shown as "Being rebuilt"; Kashif plans to rework it.
    - Security: the repo still contains a Firebase admin SDK key in `backend/`. Kashif was told to revoke it in Google Cloud.
- **Resume:** there isn't one, so the Resume link is removed (2026-09-30). The links are GitHub and LinkedIn only.
- **Step 1 (content) complete on 2026-09-30.**
- **Availability line** (kept separate from the bio): "Open to full-time roles and freelance projects."
- **Facts:**
  - Education: B.Tech CSE, IIT Roorkee, graduated 2025.
  - Location: Bengaluru.
  - Experience: 1–2 years including internships.
  - Background: started in mobile (Flutter), now works full stack including BFF and UPI at Curie Money.
- **Name:** the full name is **Asadullah Kashif** (first name Asadullah), and he goes by **Kashif**. Use the full name in the title, metadata and footer, and "Kashif" for the poster name, the greeting and the wordmark.
- **Domain: decide before launch.** Build on vercel.app until then.
  - Prices are Cloudflare at-cost, checked 2026-09-30. All options below were available.
  - Shortlist:
    - akashif.com ($10.46/yr flat, recommended: reads "A. Kashif" and matches GitHub A-Kashif108)
    - kashif.page ($10.20)
    - akashif.dev ($12.20)
    - kashif.work ($10.20)
    - kashif.fyi ($5.20)
    - akashif.in (about $6)
  - Avoid, because renewal jumps after year one: .site, .space, .tech. Expensive outright: .sh, .ink.
  - Taken: kashif.dev, .app, .in, .me, .co, .io.
  - Buy from Cloudflare or Vercel, not GoDaddy, which renews higher.

## Build status

**Step 2 (build) complete, 2026-09-30.** It's on `main`, merged from `step-2-build`.
- The approved Fusion design is ported into Next.js: `src/components/xp` (server sections) plus `src/experience` (engine).
- Hero: live WebGL on desktop. Phones get a pre-rendered seamless 10s loop (AV1/H.264) with WebP posters; see `scripts/hero-video/`.
- Static case-study pages at `/work/[slug]`.
- The accent is fixed to orange, and the accent toggle is removed.
- Content change: the stack ribbons and phone layers now reflect Curie Money work (Flutter, Dart, TypeScript BFF, UPI, Kotlin, Swift, Go) instead of the college stack. Needs Kashif's confirmation.
- Checked in the browser: desktop and mobile, reduced motion, production routes (the capture page 404s in production), and deep links and back navigation to `#work` and `#contact`.

**Step 3 (quality pass) complete, 2026-09-30.**

Lighthouse, on the production build:

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home, desktop | 100 | 100 | 100 | 100 |
| Home, mobile | 88–92 | 100 | 100 | 100 |
| Case study, desktop | 100 | 100 | 100 | 100 |
| Case study, mobile | 96 | 100 | 100 | 100 |

- Mobile home LCP is about 3.3s, which is the first-visit intro (a design choice). Repeat visits skip it.
- Performance: the 3D is split. The desktop hero starts immediately; the phone, ribbon and card scenes load lazily when one nears the viewport, set up over several frames. Mobile blocking time went from 3.9s to 0.1s.
- Accessibility: axe-core reports no violations. Added a skip link, keyboard focus order, contrast fixes on light surfaces, and SplitText labelling.
- SEO: metadata and Open Graph, share images in public/og (rendered at /dev/og), the AK icon, sitemap, robots.txt, and Person JSON-LD.
- iOS Safari (iPhone 16 Pro simulator): everything renders. Deep links and a sticker overlap were fixed.
- The Play Store link is verified as "Curie Money UPI: Grow & Pay".

**Live (2026-09-30):** https://portfolio-nu-sand-y0oqjn1arz.vercel.app (Vercel Hobby project `portfolio`, deploys from `main`; Deployment Protection is on for preview URLs).

Live Lighthouse:
- Desktop home: 100 across the board.
- Mobile case study: 99.
- Mobile home: 95 on a first visit with the intro (LCP 1.2–1.9s, warm CDN cache). The intro plays at 1.75x on phones, about 2s. Before that speed-up it scored 79.
- Accessibility, best practices and SEO: 100 everywhere.
- robots.txt, the sitemap, canonical and Open Graph URLs all resolve to the live domain automatically.

Next: step 4, going live. Kashif connects the repo to Vercel and chooses a domain; set NEXT_PUBLIC_SITE_URL once the domain is live.

## About the site owner (placeholder content)

- **Name:** Asadullah Kashif, who goes by Kashif. Software engineer at Curie Money.
- **GitHub:** https://github.com/A-Kashif108
- **Stack seen on GitHub:** Flutter/Dart, Go, C++, Python, JavaScript.
- **Candidate projects:** FileCosmos, game_space, Zoi, Network_Project, Codelog, Twine.
