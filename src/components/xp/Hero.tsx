import { site } from "@/content/site";

// Dark. Full-bleed hero loop (frosted glass and dots through caustic light) that shrinks into a card on scroll.
export default function Hero() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <section className="fu-hero" id="top">
      <div className="fu-media">
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
