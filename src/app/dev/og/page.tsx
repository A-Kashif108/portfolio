/* eslint-disable @next/next/no-img-element -- plain images keep the screenshot deterministic */
import { notFound } from "next/navigation";
import { site } from "@/content/site";

// Dev-only: lays out share images (1200x630) and the app icon (512x512) with the real site fonts,
// to be screenshotted into public/og and src/app. Query: ?slug=home|<project slug>&kind=og|icon
export default async function OgPage(props: PageProps<"/dev/og">) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await props.searchParams;
  const kind = q.kind === "icon" ? "icon" : "og";
  const slug = typeof q.slug === "string" ? q.slug : "home";
  const initials = site.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  if (kind === "icon") {
    return (
      <div className="fixed left-0 top-0 grid size-[512px] place-items-center bg-ink">
        <span className="poster-type text-[300px] leading-none text-paper" style={{ transform: "translateY(12px)" }}>
          {initials.slice(0, 1)}
          <span className="text-accent">{initials.slice(1)}</span>
        </span>
      </div>
    );
  }

  if (slug === "home") {
    return (
      <div className="fixed left-0 top-0 h-[630px] w-[1200px] overflow-hidden bg-ink text-paper">
        <img src="/media/hero-desktop-poster.webp" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,12,16,0.92)_0%,rgba(11,12,16,0.55)_55%,rgba(11,12,16,0.1)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[6px] bg-accent" />
        <div className="absolute bottom-[64px] left-[64px] grid gap-6">
          <p className="text-[112px] font-medium leading-[0.9] tracking-[-0.058em]">
            {site.name.split(" ")[0]}
            <br />
            {site.name.split(" ").slice(1).join(" ")}
          </p>
          <p className="text-[30px] leading-snug text-paper/80">
            <b className="font-medium text-white">{site.role}.</b> Flutter apps, a TypeScript BFF, UPI payments.
          </p>
        </div>
      </div>
    );
  }

  const project = site.projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <div className="surface-light fixed left-0 top-0 h-[630px] w-[1200px] overflow-hidden">
      <div
        className="absolute right-[-150px] top-[-170px] size-[520px] rounded-full opacity-90"
        style={{ background: "radial-gradient(circle, var(--accent) 38%, transparent 42%) 0 0 / 18px 18px" }}
      />
      <div className="absolute inset-x-0 top-0 h-[6px] bg-accent" />
      <div className="absolute inset-x-[64px] bottom-[60px] grid gap-6">
        {project.status && (
          <span className="justify-self-start rounded-full bg-white/70 px-4 py-2 font-mono text-[20px] ring-1 ring-ink/10">
            {project.status}
          </span>
        )}
        <p className="poster-type text-[170px] leading-[0.8]">{project.name}</p>
        <p className="max-w-[720px] text-[27px] leading-snug text-ink/80">{project.summary}</p>
        <p className="font-mono text-[20px] text-subtle">{site.name}</p>
      </div>
    </div>
  );
}
