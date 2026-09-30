import type { RisoKind } from "@/content/site";
import { Draggable, gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { ACCENT, DROPS } from "./config";
import { fontsReady, readFonts } from "./fonts";
import { drawRiso } from "./riso";
import type { XpState } from "./state";

const INTRO_KEY = "xp-intro-seen";

type Melt = { sec: HTMLElement; svg: SVGSVGElement; rims: SVGCircleElement[]; fills: SVGCircleElement[]; diag: number };

/**
 * DOM and scroll choreography: fit-to-width type, riso poster art, the intro, pinned scenes,
 * liquid-lens transitions, stickers, nav and the copy button. Writes scroll progress into `state` for WebGL.
 */
export function initChoreo(root: HTMLElement, state: XpState): () => void {
  const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector<T & Element>(s);
  const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T & Element>(s));
  const R = state.reduced;
  const off: (() => void)[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  const drags: Draggable[] = [];
  let dead = false;
  if (R) root.classList.add("is-reduced");

  const heroEl = $(".fu-hero");
  const media = $(".fu-media");
  const explodeEl = $(".fu-explode");
  const nameEl = $(".fu-name");
  const giant = $(".fu-giant");
  const ribEl = $(".fu-ribbons");
  const contactEl = $(".fu-contact");
  if (!heroEl || !media || !explodeEl || !nameEl || !giant || !ribEl || !contactEl) return () => {};

  /* ---------- Layout: fit text, poster art, goo geometry ---------- */
  const natural = (box: HTMLElement, inner: Element) => {
    box.style.fontSize = "100px";
    return inner.getBoundingClientRect().width || 1;
  };
  const fitGiant = () => {
    const W = nameEl.clientWidth - 2 * parseFloat(getComputedStyle(nameEl).paddingLeft);
    const first = giant.firstElementChild;
    if (!first) return;
    giant.style.fontSize = `${Math.min(((100 * W) / natural(giant, first)) * 0.99, window.innerHeight * 0.64).toFixed(2)}px`;
  };
  const fitTitles = () => {
    $$(".fu-card").forEach((card) => {
      const span = card.querySelector(".fu-card-title span");
      const title = card.querySelector<HTMLElement>(".fu-card-title");
      const col = card.querySelector<HTMLElement>(".fu-card-copy");
      if (!span || !title || !col) return;
      const pad = parseFloat(getComputedStyle(col).paddingLeft) * 2;
      const W = col.clientWidth - pad;
      const maxH = window.innerHeight * (state.mobile ? 0.1 : 0.2);
      title.style.fontSize = `${Math.min(((100 * W) / natural(title, span)) * 0.98, maxH).toFixed(2)}px`;
    });
  };
  const inView = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  };
  const drawArts = (onlyVisible: boolean) => {
    $$<HTMLElement>(".fu-card").forEach((card, i) => {
      if (onlyVisible && !inView(card)) return;
      const cv = card.querySelector("canvas");
      if (cv) drawRiso(cv, (card.dataset.art ?? "code") as RisoKind, i, ACCENT);
    });
  };
  const melts: Melt[] = $$<HTMLElement>(".fu-melt").map((sec) => {
    const svg = sec.querySelector("svg") as SVGSVGElement;
    return {
      sec,
      svg,
      rims: Array.from(svg.querySelectorAll<SVGCircleElement>(".rim circle")),
      fills: Array.from(svg.querySelectorAll<SVGCircleElement>(".fill circle")),
      diag: 1000,
    };
  });
  const layoutMelts = () => {
    melts.forEach((m) => {
      const w = m.sec.clientWidth || window.innerWidth;
      const h = window.innerHeight;
      m.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      m.diag = Math.hypot(w, h);
      DROPS.forEach((d, i) => {
        [m.rims[i], m.fills[i]].forEach((c) => {
          c?.setAttribute("cx", (d[0] * w).toFixed(1));
          c?.setAttribute("cy", (d[1] * h).toFixed(1));
        });
      });
    });
  };
  const layout = () => {
    fitGiant();
    fitTitles();
    drawArts(false);
    layoutMelts();
  };
  layout();

  /* ---------- Jumps and copy ---------- */
  // Where to land for a section: its top, or the end of its pin so a pinned scene (the steel card) is complete.
  const landingY = (target: HTMLElement) => {
    const pinned = ScrollTrigger.getAll().find((st) => st.trigger === target && st.pin);
    if (pinned && target.classList.contains("fu-contact")) return pinned.end;
    return target.getBoundingClientRect().top + window.scrollY;
  };
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest<HTMLElement>("[data-go]");
    if (!a?.dataset.go) return;
    const t = $(a.dataset.go);
    if (!t) return;
    e.preventDefault();
    const y = landingY(t);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: R ? "auto" : "smooth" });
  };
  root.addEventListener("click", onClick);
  off.push(() => root.removeEventListener("click", onClick));

  const copyBtn = $<HTMLButtonElement>(".fu-copy");
  const mailEl = $("#fu-mail");
  if (copyBtn && mailEl) {
    const label = copyBtn.querySelector("span");
    const flash = (m: string) => {
      if (!label) return;
      label.textContent = m;
      timers.push(setTimeout(() => (label.textContent = "Copy email"), 1700));
    };
    const selectIt = () => {
      try {
        const s = window.getSelection();
        const rg = document.createRange();
        rg.selectNodeContents(mailEl);
        s?.removeAllRanges();
        s?.addRange(rg);
      } catch {}
      flash("Selected, press Cmd+C");
    };
    const onCopy = () => {
      const email = copyBtn.dataset.email ?? mailEl.textContent ?? "";
      try {
        navigator.clipboard.writeText(email).then(() => flash("Copied"), selectIt);
      } catch {
        selectIt();
      }
    };
    copyBtn.addEventListener("click", onCopy);
    off.push(() => copyBtn.removeEventListener("click", onCopy));
  }

  /* ---------- Choreography ---------- */
  const lenis = getLenis();
  let introStopped = false;
  const playIntro = !R && document.documentElement.classList.contains("intro");

  const ctx = gsap.context(() => {
    const nav = $(".fu-nav");
    const bar = $(".fu-progress");
    const words = $$(".fu-say .w");
    gsap.set(words, { "--f": R ? 1 : 0 });

    if (!R) {
      const heroIn = (tl: gsap.core.Timeline, at: number) => {
        // Split only when the intro plays; otherwise the server-rendered heading paints instantly (LCP).
        const h1Split = SplitText.create(".fu-h1", { type: "lines", mask: "lines" });
        tl.from(h1Split.lines, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09 }, at)
          // Slide only (no fade): the glass window already reveals them, and text is never mid-opacity (contrast).
          .from(".fu-role", { y: 26, duration: 0.9, ease: "power3.out" }, at + 0.25)
          .from(".fu-ctas", { y: 26, duration: 0.9, ease: "power3.out" }, at + 0.35)
          .from(nav, { autoAlpha: 0, duration: 0.6 }, at + 0.1);
      };

      if (playIntro) {
        // Intro: name flips in, a phone-shaped glass window rises and swells past the viewport to reveal the hero.
        const intro = $(".fu-intro");
        const win = $(".fu-window");
        const iname = $(".fu-intro-name");
        const pct = $(".fu-intro-pct");
        if (lenis) {
          lenis.stop();
          introStopped = true;
        }
        // Words then chars, so the name only ever wraps between words.
        const chars = SplitText.create(iname, { type: "words,chars" }).chars;
        const vw0 = window.innerWidth;
        const vh0 = window.innerHeight;
        const ph = Math.min(vh0 * 0.56, 540);
        const pw = ph * 0.49;
        gsap.set(win, { xPercent: -50, yPercent: -50, width: pw, height: ph, borderRadius: pw * 0.17, y: vh0 * 0.85 });
        gsap.set(iname, { yPercent: -50 });
        const cnt = { v: 0 };
        const tl = gsap.timeline({
          onComplete: () => {
            if (intro) intro.style.display = "none";
            document.documentElement.classList.remove("intro");
            try {
              sessionStorage.setItem(INTRO_KEY, "1");
            } catch {}
            if (lenis) lenis.start();
            introStopped = false;
            ScrollTrigger.refresh();
          },
        });
        tl.from(chars, { yPercent: 60, rotateX: -95, autoAlpha: 0, transformOrigin: "50% 100% -30px", duration: 0.9, ease: "expo.out", stagger: 0.032 }, 0.08)
          .to(".fu-intro-bar i", { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0.1)
          .to(cnt, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: () => { if (pct) pct.textContent = `00${Math.round(cnt.v)}`.slice(-3); } }, 0.1)
          .to(iname, { y: -vh0 * 0.34, scale: 0.42, duration: 0.95, ease: "expo.inOut" }, 1.4)
          .to(".fu-intro-meta", { autoAlpha: 0, duration: 0.35 }, 1.4)
          .to(win, { y: vh0 * 0.04, duration: 0.95, ease: "expo.out" }, 1.5)
          .to(".fu-notch", { autoAlpha: 0, duration: 0.3 }, 2.25)
          .to(win, { width: vw0 * 1.3, height: vh0 * 1.3, y: 0, borderRadius: 0, duration: 1.0, ease: "expo.inOut" }, 2.25)
          .to(iname, { autoAlpha: 0, y: -vh0 * 0.46, duration: 0.55, ease: "power2.in" }, 2.25);
        heroIn(tl, 2.72);
        // Phones get the same sequence at 1.75x (about 2s instead of 3.6s), so the hero arrives sooner.
        if (state.mobile) tl.timeScale(1.75);
      }
      // Without the intro the hero is already on screen from the server HTML, so it isn't re-animated.

      // Hero: the full-bleed loop shrinks into a rounded card as you leave.
      gsap
        .timeline({ scrollTrigger: { trigger: heroEl, start: "top top", end: "+=80%", pin: true, scrub: true } })
        .fromTo(media, { clipPath: "inset(0% 0% 0% 0% round 0px)" }, { clipPath: "inset(9% 13% 9% 13% round 28px)", ease: "none", duration: 1 }, 0)
        .to(".fu-hero-in", { y: -70, autoAlpha: 0, ease: "none", duration: 0.55 }, 0);

      // Exploded phone: dots assemble as the section arrives, then the slabs separate.
      ScrollTrigger.create({ trigger: explodeEl, start: "top bottom", end: "top top", onUpdate: (s) => (state.enter = s.progress) });
      ScrollTrigger.create({ trigger: explodeEl, start: "top top", end: "+=200%", pin: true, scrub: true, onUpdate: (s) => (state.phone = s.progress) });
      gsap.from([".fu-cap", ".fu-cap-sub"], { y: 40, autoAlpha: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: explodeEl, start: "top 60%" } });

      // Liquid-lens transitions: drops swell, merge through the goo filter, and flood the screen.
      const melt = (m: Melt) => {
        const tl2 = gsap.timeline({ scrollTrigger: { trigger: m.sec, start: "top top", end: "+=70%", pin: true, scrub: 0.4, invalidateOnRefresh: true } });
        DROPS.forEach((d, i) => {
          const dur = 1 - d[3];
          const ease = i === 0 ? "power3.in" : "power2.inOut";
          tl2.fromTo(m.fills[i], { attr: { r: 0 } }, { attr: { r: () => m.diag * d[2] }, ease, duration: dur }, d[3])
            .fromTo(m.rims[i], { attr: { r: 0 } }, { attr: { r: () => m.diag * d[2] + 14 }, ease, duration: dur }, d[3]);
        });
      };
      if (melts[0]) melt(melts[0]);

      // Poster half.
      const first = giant.firstElementChild;
      if (first) {
        // The h2 carries the accessible name; SplitText must not label the inner span.
        const gChars = SplitText.create(first, { type: "chars", mask: "chars", aria: "none" }).chars;
        gsap.from(gChars, { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: nameEl, start: "top 72%" } });
      }
      gsap.from(".fu-giant-acc", { autoAlpha: 0, x: -24, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: nameEl, start: "top 60%" } });
      gsap.from(".fu-name-row > *", { y: 24, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: nameEl, start: "top 50%" } });
      gsap.from(".fu-stk", { scale: 0, autoAlpha: 0, duration: 0.8, ease: "back.out(2)", stagger: 0.07, scrollTrigger: { trigger: nameEl, start: "top 55%" } });
      gsap.from(".fu-rib-head > *", { y: 30, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ribEl, start: "top 65%" } });
      gsap.from(".fu-work-head > *", { y: 40, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".fu-work", start: "top 70%" } });

      const cards = $$(".fu-card");
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const st = { trigger: next, start: "top bottom", end: "top top", scrub: true };
        gsap.to(c.querySelector(".fu-card-in"), { scale: 0.92, ease: "none", scrollTrigger: st });
        gsap.to(c.querySelector(".fu-dim"), { opacity: 0.5, ease: "none", scrollTrigger: { ...st } });
      });

      gsap
        .timeline({ scrollTrigger: { trigger: ".fu-stmt", start: "top top", end: "+=110%", pin: true, scrub: 0.5 } })
        .to(words, { "--f": 1, ease: "none", duration: 1, stagger: 0.55 });
      if (melts[1]) melt(melts[1]);

      // Contact: the steel card rises and spins 270 degrees into place.
      ScrollTrigger.create({ trigger: contactEl, start: "top top", end: "+=100%", pin: true, scrub: true, onUpdate: (s) => (state.card = s.progress) });
      gsap.from(".fu-contact-copy > *", { y: 36, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: contactEl, start: "top 55%" } });
      gsap.from(".fu-word", { yPercent: 30, autoAlpha: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".fu-foot", start: "top 80%" } });
    }

    // Draggable glass stickers.
    let z = 5;
    $$<HTMLElement>(".fu-stk").forEach((s) => {
      gsap.set(s, { rotation: Number(s.dataset.rot) || 0 });
      drags.push(
        Draggable.create(s, {
          type: "x,y",
          bounds: nameEl,
          onPress: () => {
            s.style.zIndex = String(++z);
            if (!R) gsap.to(s, { scale: 1.08, duration: 0.25, ease: "power3.out" });
          },
          onRelease: () => {
            if (!R) gsap.to(s, { scale: 1, duration: 0.6, ease: "elastic.out(1,0.4)" });
          },
        })[0],
      );
    });

    // Nav hides while scrolling down so page type never collides with it.
    let shown = true;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => {
        const want = s.direction < 0 || s.scroll() < 120;
        if (want !== shown) {
          shown = want;
          gsap.to(nav, { yPercent: want ? 0 : -110, duration: R ? 0 : 0.45, ease: "power3.out", overwrite: true });
        }
      },
    });
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => bar && (bar.style.transform = `scaleX(${s.progress.toFixed(4)})`) });
  }, root);

  // Deep links (/#work, or "All work" from a case study): the browser jumps before pins add their scroll length,
  // so re-align to the target once ScrollTrigger has measured everything. Absolute positions avoid stale Lenis state.
  const jumpToHash = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target || !root.contains(target)) return;
    ScrollTrigger.refresh();
    const y = landingY(target);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  };
  timers.push(setTimeout(jumpToHash, 60), setTimeout(jumpToHash, 450));

  // Fonts: re-fit type once the real faces are in.
  fontsReady(readFonts()).then(() => {
    if (dead) return;
    layout();
    ScrollTrigger.refresh();
    jumpToHash();
  });

  let roT: ReturnType<typeof setTimeout> | undefined;
  let lastW = root.clientWidth;
  const ro = new ResizeObserver(() => {
    if (root.clientWidth === lastW) return;
    lastW = root.clientWidth;
    clearTimeout(roT);
    roT = setTimeout(() => {
      if (dead) return;
      state.mobile = window.innerWidth <= 760;
      layout();
      ScrollTrigger.refresh();
    }, 140);
  });
  ro.observe(root);

  return () => {
    dead = true;
    if (introStopped) lenis?.start();
    drags.forEach((d) => d.kill());
    off.forEach((f) => f());
    timers.forEach(clearTimeout);
    clearTimeout(roT);
    ro.disconnect();
    ctx.revert();
  };
}
