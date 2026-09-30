"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { mount } from "./engine";

/** Client root for the page: renders the server-built sections and attaches the scroll and WebGL experience. */
export default function Experience({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mount(ref.current);
  }, []);

  return (
    <div ref={ref} className="xp">
      {children}
    </div>
  );
}
