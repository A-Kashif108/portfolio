import { site } from "@/content/site";

function Roll({ text }: { text: string }) {
  return (
    <span className="roll">
      <span data-text={text}>{text}</span>
    </span>
  );
}

// Fixed layers shared by the whole page: the WebGL views canvas, film grain, scroll progress and the nav.
export default function Chrome() {
  return (
    <>
      <canvas className="fu-views" aria-hidden="true" />
      <div className="fu-grain" aria-hidden="true" />
      <div className="fu-progress" aria-hidden="true" />
      <header className="fu-nav">
        <a className="fu-brand" href="#top" data-go=".fu-hero">
          {site.name}
        </a>
        <nav aria-label="Primary">
          <ul>
            <li>
              <a href="#work" data-go=".fu-work">
                <Roll text="Work" />
              </a>
            </li>
            <li>
              <a href="#about" data-go=".fu-name">
                <Roll text="About" />
              </a>
            </li>
            <li>
              <a href="#contact" data-go=".fu-contact">
                <Roll text="Contact" />
              </a>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
