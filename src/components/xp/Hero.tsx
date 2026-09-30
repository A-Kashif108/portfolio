import { site } from "@/content/site";

const AV1 = 'video/mp4; codecs="av01.0.08M.08"';

// Dark. Full-bleed hero loop (frosted glass and dots through caustic light) that shrinks into a card on scroll.
// Layers, bottom to top: poster image (instant paint), rendered loop video (phones, or no WebGL), live WebGL canvas (desktop).
export default function Hero() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <section className="fu-hero" id="top">
      <div className="fu-media">
        <picture className="fu-hero-poster">
          <source media="(max-width: 760px)" srcSet="/media/hero-mobile-poster.webp" />
          <img src="/media/hero-desktop-poster.webp" alt="" fetchPriority="high" />
        </picture>
        <video className="fu-hero-video" muted loop playsInline preload="none" aria-hidden="true">
          <source media="(max-width: 760px)" src="/media/hero-mobile.av1.mp4" type={AV1} />
          <source media="(max-width: 760px)" src="/media/hero-mobile.h264.mp4" type="video/mp4" />
          <source src="/media/hero-desktop.av1.mp4" type={AV1} />
          <source src="/media/hero-desktop.h264.mp4" type="video/mp4" />
        </video>
        <canvas
          className="fu-hero-cv"
          aria-label="Frosted glass shapes with drifting dots caught inside, moving through caustic light"
        />
      </div>
      <div className="fu-hero-in fu-z">
        <h1 className="fu-h1">
          {first}
          <br />
          {rest.join(" ")}
        </h1>
        <div className="fu-hero-row">
          <p className="fu-role">
            <b>{site.role}.</b> {site.tagline}
          </p>
          <div className="fu-ctas">
            <a className="fu-btn primary" href="#work" data-go=".fu-work">
              Selected work
            </a>
            <a className="fu-btn frost" href="#contact" data-go=".fu-contact">
              Contact
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
