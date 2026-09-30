import { site } from "@/content/site";

// Dark. Pinned exploded phone: five frosted glass slabs with the dot-cloud UI inside, one callout per layer.
// Callout positions are driven by the WebGL scene; without it they stay hidden and the list is still readable.
export default function Exploded() {
  const first = site.layers[0];
  return (
    <section className="fu-explode" id="layers" aria-label="The layers of an app">
      <div className="fu-view" data-view="phone" />
      <h2 className="fu-cap fu-z">Every app is layers.</h2>
      <p className="fu-cap-sub fu-z">{site.layersNote}</p>
      <svg className="fu-lines fu-z" aria-hidden="true">
        {site.layers.map((layer, i) => (
          <g key={layer.name}>
            <path data-i={i} />
            <circle r={3} data-i={i} />
          </g>
        ))}
      </svg>
      {site.layers.map((layer, i) => (
        <div key={layer.name} className="fu-call fu-z" data-i={i}>
          <b>{layer.name}</b>
          <span>{layer.detail}</span>
        </div>
      ))}
      <div className="fu-counter fu-z" aria-live="polite">
        <span>
          Layer <b className="fu-n">1</b> of {site.layers.length}
        </span>
        <span className="fu-lname">{first.name}</span>
      </div>
    </section>
  );
}
