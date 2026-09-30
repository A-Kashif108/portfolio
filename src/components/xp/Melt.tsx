import { DROPS } from "@/experience/config";

type Props = {
  id: string;
  direction: "to-light" | "to-dark";
  fill: string;
  edge: string;
};

// Liquid-lens transition: goo drops swell, merge through an SVG filter and flood the screen.
// The engine sizes the SVG to the viewport and scrubs each drop's radius.
export default function Melt({ id, direction, fill, edge }: Props) {
  const drops = DROPS.map((_, i) => <circle key={i} r={0} />);
  return (
    <section className={`fu-melt ${direction}`} aria-hidden="true">
      <svg preserveAspectRatio="none">
        <defs>
          <radialGradient id={`${id}-g`} cx="42%" cy="38%" r="62%">
            <stop offset="0" stopColor={fill} />
            <stop offset="0.7" stopColor={fill} />
            <stop offset="1" stopColor={edge} />
          </radialGradient>
          <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.007" numOctaves={2} seed={4} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={46} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feGaussianBlur in="d" stdDeviation={16} result="b" />
            <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -13" />
          </filter>
        </defs>
        <g className="rim" filter={`url(#${id})`}>
          {drops}
        </g>
        <g className="fill" fill={`url(#${id}-g)`} filter={`url(#${id})`}>
          {drops}
        </g>
      </svg>
    </section>
  );
}
