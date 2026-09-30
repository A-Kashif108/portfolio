import { site } from "@/content/site";

// Giant wordmark with a faded reflection underneath.
export default function Footer() {
  const word = site.shortName.toUpperCase();
  return (
    <footer className="fu-foot">
      <span className="fu-word" aria-hidden="true">
        {word}
      </span>
      <span className="fu-word mirror" aria-hidden="true">
        {word}
      </span>
      <div className="fu-base">
        <span>{site.name}</span>
        <span>{site.role}</span>
        <span>{site.location}</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
