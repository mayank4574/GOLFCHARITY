import HeroSection from "./HeroSection";
import FilterTabs from "./FilterTabs";
import TestimonialsGrid from "./TestimonialsGrid";
import CTASection from "./CTASection";

export default function Testimonials() {
  return (
    <div className="bg-[#0b1326] text-white min-h-screen">
      <HeroSection />
      <FilterTabs />
      <TestimonialsGrid />
      <CTASection />
    </div>
  );
}