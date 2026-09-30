import Contact from "@/components/sections/Contact";
import Exploded from "@/components/sections/Exploded";
import Hero from "@/components/sections/Hero";
import PosterName from "@/components/sections/PosterName";
import StackRibbons from "@/components/sections/StackRibbons";
import Statement from "@/components/sections/Statement";
import Work from "@/components/sections/Work";
import { site } from "@/content/site";

// Page flow (see reference.md): dark intro + hero + exploded phone, liquid-lens flip to the light
// poster half (name, ribbons, work, statement), flip back to dark for the steel-card contact.
export default function Home() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between px-5 text-sm mix-blend-difference md:px-10">
        <a href="#top" className="font-medium">
          {site.name}
        </a>
        <nav className="flex gap-6">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
      <main>
        <Hero />
        <Exploded />
        <PosterName />
        <StackRibbons />
        <Work />
        <Statement />
        <Contact />
      </main>
    </>
  );
}
