import { site } from "@/content/site";

// Light. Giant fit-width name with an offset accent dot print, the bio, and draggable frosted-glass stickers.
export default function NameSection() {
  return (
    <section className="fu-name" id="about" aria-label={`About ${site.shortName}`}>
      <h2 className="fu-giant cond" aria-label={site.shortName}>
        <span>{site.shortName}</span>
        <span className="fu-giant-acc" aria-hidden="true">
          {site.shortName}
        </span>
      </h2>
      <div className="fu-name-row">
        <p className="fu-bio">{site.bio}</p>
        <span className="fu-avail">
          <i aria-hidden="true" />
          {site.availability}
        </span>
      </div>
      {site.stickers.map((s) => (
        <span
          key={s.label}
          className={["fu-stk", s.accent && "acc", s.round && "round", s.key].filter(Boolean).join(" ")}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          data-rot={s.rot}
          aria-hidden="true"
        >
          {s.label}
        </span>
      ))}
    </section>
  );
}
