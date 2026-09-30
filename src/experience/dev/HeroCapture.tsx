"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { ACCENT } from "../config";
import { createHero } from "../gl/hero";
import { makeEnv } from "../gl/kit";

/**
 * Renders the hero scene at fixed time steps and POSTs each JPEG frame to a local receiver
 * (scripts/hero-video/receive.mjs). Query: ?w=1920&h=1080&fps=30&seconds=12&port=3199
 */
export default function HeroCapture() {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const w = Number(q.get("w") ?? 1920);
    const h = Number(q.get("h") ?? 1080);
    const fps = Number(q.get("fps") ?? 30);
    const seconds = Number(q.get("seconds") ?? 12);
    const port = Number(q.get("port") ?? 3199);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x0b0c10, 1);
    const env = makeEnv(renderer, false, ACCENT);
    const hero = createHero(env.texture, { accent: new THREE.Color(ACCENT), dpr: 1.5, density: 1 });
    hero.cam.aspect = w / h;
    hero.cam.updateProjectionMatrix();
    let cancelled = false;

    (async () => {
      const total = Math.round(fps * seconds);
      for (let i = 0; i < total && !cancelled; i++) {
        hero.pose(i / fps);
        renderer.render(hero.scene, hero.cam);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.96));
        if (!blob) throw new Error("toBlob failed");
        await fetch(`http://localhost:${port}/frame?i=${i}`, { method: "POST", body: blob });
        setStatus(`frame ${i + 1} / ${total}`);
      }
      // StrictMode runs this effect twice in dev; only the surviving run may report completion.
      if (cancelled) return;
      setStatus("done");
      (window as unknown as { __captureDone?: boolean }).__captureDone = true;
    })().catch((err) => setStatus(`error: ${String(err)}`));

    return () => {
      cancelled = true;
      hero.bin.dispose();
      env.dispose();
      renderer.dispose();
    };
  }, []);

  return <p style={{ padding: 24, fontFamily: "monospace", color: "#fff" }}>Hero capture: {status}</p>;
}
