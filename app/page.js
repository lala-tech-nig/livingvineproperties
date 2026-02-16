import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/sections/HeroCarousel";
import TrustStrip from "@/components/sections/TrustStrip";
import AboutSnippet from "@/components/sections/AboutSnippet";
import ServiceGrid from "@/components/sections/ServiceGrid";
import ProjectsGallery from "@/components/sections/ProjectsGallery";
import AppTeaser from "@/components/sections/AppTeaser";
import CTA from "@/components/sections/CTA";
import FloatingElements from "@/components/ui/FloatingElements";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ROICalculator from "@/components/sections/ROICalculator";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-foreground selection:bg-primary selection:text-white">
      <Navbar />

      <main>
        <HeroCarousel />
        <TrustStrip />

        {/* Mobile-only ROI Calculator */}
        <div className="lg:hidden">
          <ROICalculator />
        </div>

        <div className="relative">
          <FloatingElements />
          <AboutSnippet />
          <ServiceGrid />
        </div>

        <ProjectsGallery />
        <AppTeaser />
        <CTA />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
