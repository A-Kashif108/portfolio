import { site } from "@/content/site";

// Dark. Pinned exploded phone: 5 frosted glass slabs with grainy point-cloud UI inside, callouts per layer.
// The static list below is the no-WebGL / reduced-motion fallback.
// Port from: round5/fusion.js (explode sequence), concepts/exploded.js (callouts, counter).
export default function Exploded() {
  return (
    <section id="about" className="surface-dark px-5 py-32 md:px-10">
      <h2 className="text-4xl font-medium tracking-[-0.04em] md:text-6xl">Every app is layers.</h2>
      <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {site.layers.map((layer) => (
          <li key={layer.name} className="border-t border-paper/15 pt-4">
            <p className="text-lg font-medium">{layer.name}</p>
            <p className="mt-1 font-mono text-xs text-muted">{layer.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
