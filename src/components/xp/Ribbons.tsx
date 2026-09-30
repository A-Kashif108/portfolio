import { site } from "@/content/site";

// Light. Riso-printed cloth ribbons, one per technology (WebGL). The list is kept for screen readers.
export default function Ribbons() {
  return (
    <section className="fu-ribbons" aria-label="Tech stack">
      <div className="fu-view" data-view="ribbons" />
      <ul className="sr-only">
        {site.stack.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
      <div className="fu-rib-head fu-z">
        <h2 className="cond">Six tools I reach for</h2>
        <p>Move through the fabric. Click to send a ripple.</p>
      </div>
    </section>
  );
}
