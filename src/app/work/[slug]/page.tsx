import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = site.projects.find((p) => p.slug === slug);
  if (!project) return {};
  const image = `/og/${project.slug}.png`;
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      url: `/work/${project.slug}`,
      title: `${project.name} | ${site.name}`,
      description: project.summary,
      images: [{ url: image, width: 1200, height: 630, alt: project.name }],
    },
    twitter: { card: "summary_large_image", title: `${project.name} | ${site.name}`, description: project.summary, images: [image] },
  };
}

// Case study: poster-world page (light paper, condensed display type) for one featured project.
export default async function CaseStudy(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const index = site.projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = site.projects[index];
  const next = site.projects[(index + 1) % site.projects.length];
  const links = [
    ...(project.links ?? []),
    ...(project.href ? [{ label: "Source on GitHub", href: project.href }] : []),
  ];
  const logo = project.art?.[0];

  return (
    <div className="surface-light min-h-dvh">
      <header className="flex h-16 items-center justify-between px-5 text-sm md:px-10">
        <Link href="/#work" className="font-medium underline-offset-4 hover:underline">
          <span aria-hidden="true">&larr;</span> All work
        </Link>
        <Link href="/" className="font-medium">
          {site.name}
        </Link>
      </header>

      <main className="px-5 pb-24 md:px-10">
        <section className="grid gap-8 pt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:pt-20">
          <div className="grid min-w-0 gap-6">
            {project.status && (
              <span className="inline-flex items-center gap-2 justify-self-start rounded-full bg-white/60 px-3 py-2 font-mono text-xs ring-1 ring-ink/10">
                <i className="size-[7px] rounded-full bg-accent" aria-hidden="true" />
                {project.status}
              </span>
            )}
            <h1 className="poster-type text-[clamp(64px,14vw,220px)] leading-[0.82]">{project.name}</h1>
            {project.summary && <p className="max-w-[58ch] text-lg leading-relaxed text-ink/80 md:text-xl">{project.summary}</p>}
          </div>
          {logo && (
            <Image
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={160}
              className="rounded-[28px] shadow-[0_30px_60px_-30px_rgba(11,12,16,0.45)]"
            />
          )}
        </section>

        {project.stats && (
          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t-2 border-ink pt-8 md:grid-cols-4">
            {project.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-2">
                <dt className="font-mono text-xs leading-snug text-subtle">{stat.label}</dt>
                <dd className="text-4xl font-semibold tracking-[-0.04em] tabular-nums md:text-5xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <section className="mt-16 grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="grid content-start gap-6 font-mono text-sm">
            <div>
              <p className="text-subtle">Year</p>
              <p>{project.period ?? project.year}</p>
            </div>
            <div>
              <p className="text-subtle">Stack</p>
              <p>{project.stack.join(", ")}</p>
            </div>
            {links.length > 0 && (
              <ul className="grid gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/30 underline-offset-4 hover:decoration-accent">
                      {link.label} <span aria-hidden="true">&#8599;</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {project.highlights && (
            <div className="grid gap-4 sm:grid-cols-2">
              {project.highlights.map((h) => (
                <article key={h.title} className="rounded-3xl bg-white/60 p-6 sm:last:odd:col-span-2 ring-1 ring-ink/8 backdrop-blur-sm md:p-8">
                  <h2 className="text-xl font-semibold tracking-[-0.02em]">{h.title}</h2>
                  <p className="mt-3 leading-relaxed text-ink/75">{h.body}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {next.slug !== project.slug && (
          <Link href={`/work/${next.slug}`} className="group mt-24 block border-t-2 border-ink pt-6">
            <span className="font-mono text-xs text-subtle">Next project</span>
            <span className="poster-type mt-2 block text-[clamp(48px,9vw,140px)] transition-colors group-hover:text-accent">
              {next.name} <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>
        )}
      </main>
    </div>
  );
}
