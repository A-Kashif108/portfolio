// next/font hashes family names, so canvas text must read the real family list from the CSS variables.
function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export type Fonts = { sans: string; mono: string; cond: string };

export function readFonts(): Fonts {
  return {
    sans: `${cssVar("--font-geist-sans", "Geist")}, Arial, sans-serif`,
    mono: `${cssVar("--font-geist-mono", "Geist Mono")}, Menlo, monospace`,
    cond: `${cssVar("--font-archivo", "Archivo")}, "Arial Narrow", sans-serif`,
  };
}

/** Resolves once the faces used by canvas textures and SplitText are loaded (or after a timeout). */
export function fontsReady(fonts: Fonts, timeoutMs = 1500): Promise<void> {
  if (!document.fonts?.load) return Promise.resolve();
  const loads = Promise.all([
    document.fonts.load(`900 100px ${fonts.cond}`),
    document.fonts.load(`500 60px ${fonts.sans}`),
    document.fonts.load(`600 60px ${fonts.sans}`),
    document.fonts.load(`500 30px ${fonts.mono}`),
  ]).then(() => undefined);
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([loads, timeout]).catch(() => undefined);
}
