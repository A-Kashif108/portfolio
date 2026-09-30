import Link from "next/link";
import { site, type Project } from "@/content/site";

function Poster({ project }: { project: Project }) {
  const links = [
    ...(project.links ?? []),
    ...(project.href ? [{ label: "Source on GitHub", href: project.href }] : []),
  ];
  return (
    <article className="fu-card" data-art={project.riso}>
      <div className="fu-card-in">
        <div className="fu-card-copy">
          <div className="fu-card-head">
            {project.status && (
              <span className="fu-status">
                <i aria-hidden="true" />
                {project.status}
              </span>
            )}
            <h3 className="fu-card-title cond">
              <span>{project.name}</span>
            </h3>
            {project.summary && <p className="fu-card-sum">{project.summary}</p>}
            {/* Links sit high in the card: the next poster slides over the bottom of this one first. */}
            <div className="fu-card-links">
              <Link className="fu-link solid" href={`/work/${project.slug}`}>
                Case study <span aria-hidden="true">&rarr;</span>
              </Link>
              {links.map((link) => (
                <a key={link.href} className="fu-link" href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label} <span aria-hidden="true">&#8599;</span>
                </a>
              ))}
            </div>
          </div>
          <div className="fu-card-meta">
            {project.stats && (
              <dl className="fu-stats">
                {project.stats.slice(0, 4).map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <dl>
              <div>
                <dt>Stack</dt>
                <dd>{project.stack.slice(0, 3).join(", ")}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{project.period ?? project.year}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="fu-card-art">
          <canvas aria-hidden="true" />
        </div>
        <div className="fu-dim" aria-hidden="true" />
      </div>
    </article>
  );
}

// Light. Sticky-stacking project posters with generated riso artwork on frosted cards.
export default function Work() {
  const years = site.projects.map((p) => p.year);
  return (
    <section className="fu-work" id="work" aria-label="Selected work">
      <div className="fu-work-head">
        <h2 className="cond">Selected work</h2>
        <p>
          {site.projects.length === 3 ? "Three" : site.projects.length} projects, {Math.min(...years)} to now.
        </p>
      </div>
      {site.projects.map((project) => (
        <Poster key={project.slug} project={project} />
      ))}
    </section>
  );
}
