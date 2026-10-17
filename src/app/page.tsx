import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import { About, Contact, Marquee, Projects, Services } from "@/components/Sections";

export default function Home() {
  return (
    <main>
      <Cursor />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <Projects />
      <Contact />
    </main>
  );
}
