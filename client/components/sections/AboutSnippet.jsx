"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import api from "@/lib/axios";

const AboutSnippet = () => {
    const [settings, setSettings] = useState({
        aboutTitle: "Proudly Indigenous. \n Global Standards.",
        aboutSubtitle: "Who We Are",
        aboutDescription1: "Living Vine Properties isn't just a real estate company; we are a movement. Born from a deep understanding of the Nigerian land tenure system and the local investment climate, we bridge the gap between ambition and ownership.",
        aboutDescription2: "We exist to prove that trust, transparency, and high returns can coexist in the indigenous market. When you invest with us, you aren't just buying land—you are securing a legacy.",
        aboutImage: "/lagos.jpg",
        aboutFeature1: "100% Verified Documentation",
        aboutFeature2: "Strategic Locations Only",
        aboutFeature3: "Guaranteed Capital Appreciation"
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data) {
                    setSettings({
                        aboutTitle: data.aboutTitle || "Proudly Indigenous. \n Global Standards.",
                        aboutSubtitle: data.aboutSubtitle || "Who We Are",
                        aboutDescription1: data.aboutDescription1 || "Living Vine Properties isn't just a real estate company; we are a movement. Born from a deep understanding of the Nigerian land tenure system and the local investment climate, we bridge the gap between ambition and ownership.",
                        aboutDescription2: data.aboutDescription2 || "We exist to prove that trust, transparency, and high returns can coexist in the indigenous market. When you invest with us, you aren't just buying land—you are securing a legacy.",
                        aboutImage: data.aboutImage || "/lagos.jpg",
                        aboutFeature1: data.aboutFeature1 || "100% Verified Documentation",
                        aboutFeature2: data.aboutFeature2 || "Strategic Locations Only",
                        aboutFeature3: data.aboutFeature3 || "Guaranteed Capital Appreciation"
                    });
                }
            } catch (error) {
                console.error("Failed to load About Us snippet settings:", error);
            }
        };
        fetchSettings();
    }, []);

    // Split title by newlines to render br tags
    const renderTitle = (titleText) => {
        return titleText.split('\n').map((line, i, arr) => (
            <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
            </span>
        ));
    };

    return (
        <SectionWrapper className="bg-white">
            <div className="grid lg:grid-cols-2 gap-16 items-center text-gray-900">
                <div className="relative">
                    <div className="relative z-10 h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl skew-y-3 border-8 border-white group">
                        <div
                            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url('${settings.aboutImage}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        <div className="absolute bottom-8 left-8 text-white">
                            <p className="font-serif text-2xl font-bold">Lagos, Nigeria</p>
                            <p className="text-sm uppercase tracking-widest opacity-80">Our Home. Your Opportunity.</p>
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl" />
                </div>

                <div>
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary uppercase tracking-widest text-xs font-bold rounded-full mb-6">
                        {settings.aboutSubtitle}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                        {renderTitle(settings.aboutTitle)}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                        {settings.aboutDescription1}
                    </p>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        {settings.aboutDescription2}
                    </p>

                    <ul className="space-y-4 mb-10">
                        {[settings.aboutFeature1, settings.aboutFeature2, settings.aboutFeature3].filter(Boolean).map((item, i) => (
                            <li key={i} className="flex items-center gap-3 font-medium text-foreground">
                                <CheckCircle className="text-primary w-5 h-5 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <Button size="lg" className="h-14 px-8 text-lg bg-[#de1f25] hover:bg-[#b0181d] text-white rounded-xl shadow-lg shadow-[#de1f25]/20 hover:shadow-[#de1f25]/30 transition-all font-bold" asChild>
                        <Link href="/about">Read Our Story</Link>
                    </Button>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default AboutSnippet;
