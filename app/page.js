import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import TrustStrip from "@/components/sections/TrustStrip";
import AboutSnippet from "@/components/sections/AboutSnippet";
import ServiceGrid from "@/components/sections/ServiceGrid";
import ProjectsGallery from "@/components/sections/ProjectsGallery";
import AppTeaser from "@/components/sections/AppTeaser";
import CTA from "@/components/sections/CTA";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-foreground selection:bg-primary selection:text-white">
      <Navbar />

      <main>
        <Hero />
        <TrustStrip />

        {/* Floating Elements Removed for Corporate Cleanliness */}
        <div className="relative">
          <AboutSnippet />
          <ServiceGrid />
        </div>

        <ProjectsGallery />
        <AppTeaser />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
