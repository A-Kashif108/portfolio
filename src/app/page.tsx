import Chrome from "@/components/xp/Chrome";
import Contact from "@/components/xp/Contact";
import Exploded from "@/components/xp/Exploded";
import Footer from "@/components/xp/Footer";
import Hero from "@/components/xp/Hero";
import Intro from "@/components/xp/Intro";
import Melt from "@/components/xp/Melt";
import NameSection from "@/components/xp/NameSection";
import Ribbons from "@/components/xp/Ribbons";
import Statement from "@/components/xp/Statement";
import Work from "@/components/xp/Work";
import { C } from "@/experience/config";
import Experience from "@/experience/Experience";

// Page flow (see reference.md): dark intro, hero and exploded phone; liquid lens into the light poster half
// (name, ribbons, work, statement); liquid lens back to dark for the steel-card contact and the wordmark.
export default function Home() {
  return (
    <Experience>
      <Chrome />
      <Intro />
      <main>
        <Hero />
        <Exploded />
        <Melt id="goo-to-light" direction="to-light" fill={C.paper} edge="#DADCE3" />
        <div className="fu-light">
          <NameSection />
          <Ribbons />
          <Work />
          <Statement />
        </div>
        <Melt id="goo-to-dark" direction="to-dark" fill={C.ink} edge="#15171D" />
        <Contact />
      </main>
      <Footer />
    </Experience>
  );
}
