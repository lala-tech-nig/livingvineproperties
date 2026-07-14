"use client";

import { useEffect } from "react";
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
import { useWebsiteData } from "@/lib/websiteData";

export default function Home() {
    const { fetchLandingData } = useWebsiteData();

    // Trigger the one coordinated parallel fetch for all landing-page sections.
    // Subsequent visits use the in-memory cache — no re-fetch.
    useEffect(() => {
        fetchLandingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="bg-white text-foreground selection:bg-primary selection:text-white">
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

            <WhatsAppButton />
        </div>
    );
}

