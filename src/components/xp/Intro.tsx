import { site } from "@/content/site";

// Era-style welcome: the name flips in, then a phone-shaped glass window rises and swells to reveal the hero.
// Hidden unless the head script sets html.intro (JS on, not reduced motion, first visit this session).
export default function Intro() {
  return (
    <div className="fu-intro" aria-hidden="true">
      <div className="fu-window">
        <span className="fu-notch" />
      </div>
      <p className="fu-intro-name">{site.name}</p>
      <div className="fu-intro-meta">
        <span>Loading</span>
        <span className="fu-intro-bar">
          <i />
        </span>
        <span className="fu-intro-pct">000</span>
      </div>
    </div>
  );
}
