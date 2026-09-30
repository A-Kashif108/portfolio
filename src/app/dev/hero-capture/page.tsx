import { notFound } from "next/navigation";
import HeroCapture from "@/experience/dev/HeroCapture";

// Dev-only tool that renders the hero loop frame by frame for the video fallback. Never served in production.
export default function HeroCapturePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <HeroCapture />;
}
