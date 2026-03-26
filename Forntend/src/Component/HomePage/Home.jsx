
import Hero from "./Hero";
import KineticLoop from "./KineticLoop";
import ImpactPartners from "./ImpactPartners";
import Seasonal from "./Seasonal";
import Testimonials from "./Testimonials";


export default function Home() {
  return (
    <div className="bg-[#071a2f] text-white min-h-screen pt-[70px]">

      <Hero />

      <KineticLoop />

      <ImpactPartners />

      <Seasonal />

      <Testimonials />

      

    </div>
  );
}