// Single place to import GSAP from, so plugins are registered exactly once.
// Import only from Client Components.
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, useGSAP);
}

export { gsap, Draggable, ScrollTrigger, SplitText, useGSAP };
