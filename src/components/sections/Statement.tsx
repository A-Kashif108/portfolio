import { site } from "@/content/site";

// Light. Word-fill statement: words go outline to solid as you scroll (scrubbed).
// Port from: concepts/poster.js (statement).
export default function Statement() {
  return (
    <section className="surface-light px-5 py-32 md:px-10">
      <p className="poster-type max-w-6xl text-6xl md:text-8xl">{site.statement}</p>
    </section>
  );
}
