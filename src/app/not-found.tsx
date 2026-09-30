import Link from "next/link";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <main className="surface-light grid min-h-dvh content-center gap-8 px-5 md:px-10">
      <p className="font-mono text-sm text-subtle">Error 404</p>
      <h1 className="poster-type text-[clamp(72px,16vw,240px)]">Lost a layer</h1>
      <p className="max-w-[46ch] text-lg text-ink/75">This page doesn&apos;t exist. The rest of {site.shortName}&apos;s work is one click away.</p>
      <Link href="/" className="justify-self-start rounded-full bg-ink px-6 py-4 text-sm font-medium text-paper transition-colors hover:bg-accent hover:text-on-accent">
        Back to the site
      </Link>
    </main>
  );
}
