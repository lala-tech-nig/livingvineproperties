"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Building2, LandPlot, ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import ROICalculator from "@/components/sections/ROICalculator";
import api from "@/lib/axios";

export default function Investments() {
    const [settings, setSettings] = useState({
        investmentsPageHeroTitle: "Grow Your Wealth With \n Real Assets",
        investmentsPageHeroSubtitle: "Discover our tailored investment packages designed for security, high returns, and long-term capital appreciation.",
        investmentsPageHeroBtnText: "Schedule a Consultation",
        investmentsPageLandBankingBadge: "Wealth Strategy",
        investmentsPageLandBankingTitle: "Land Banking",
        investmentsPageLandBankingDesc: "Land Banking is the practice of buying land in undeveloped or developing areas with the intention of holding it for high capital appreciation. It is one of the safest and most profitable real estate strategies.",
        investmentsPageLandBankingBenefits: [
            "Secure Title Documents (C of O, Gazette)",
            "100% ROI within 12-24 months in prime locations",
            "Zero maintenance costs while you hold"
        ],
        investmentsPageLandBankingImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop",
        investmentsPageLandBankingBtnText: "View Available Lands",
        investmentsPageDevBadge: "Construction",
        investmentsPageDevTitle: "Property Development",
        investmentsPageDevDesc: "We design and build premium residential and commercial structures tailored to modern living. From automated smart homes to eco-friendly office spaces, our developments define luxury.",
        investmentsPageDevBenefits: [
            "Smart Home Integration",
            "Premium Finishing & Materials",
            "Eco-Friendly Designs",
            "Facility Management Services"
        ],
        investmentsPageDevImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2831&auto=format&fit=crop",
        investmentsPageDevBtnText: "See Our Projects",
        investmentsPageAppreciationTitle: "The Power of Appreciation",
        investmentsPageAppreciationNote: "*Projections based on historical data of the Ibeju-Lekki corridor. Real estate values in this axis have consistently outperformed traditional savings.",
        investmentsPageAppreciationYears: [
            { year: "Year 1", growth: "Initial Investment", percentage: 30 },
            { year: "Year 3", growth: "50% Growth", percentage: 60 },
            { year: "Year 5+", growth: "150% ROI", percentage: 100 }
        ],
        investmentsPageProcessTitle: "Ready to Start?",
        investmentsPageProcessBtnText: "Begin Process",
        investmentsPageProcessSteps: [
            { step: "01", title: "Free Consultation" },
            { step: "02", title: "Site Inspection" },
            { step: "03", title: "Payment & Documentation" },
            { step: "04", title: "Asset Allocation" }
        ]
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvestmentsSettings = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data) {
                    setSettings({
                        investmentsPageHeroTitle: data.investmentsPageHeroTitle || "Grow Your Wealth With \n Real Assets",
                        investmentsPageHeroSubtitle: data.investmentsPageHeroSubtitle || "Discover our tailored investment packages designed for security, high returns, and long-term capital appreciation.",
                        investmentsPageHeroBtnText: data.investmentsPageHeroBtnText || "Schedule a Consultation",
                        investmentsPageLandBankingBadge: data.investmentsPageLandBankingBadge || "Wealth Strategy",
                        investmentsPageLandBankingTitle: data.investmentsPageLandBankingTitle || "Land Banking",
                        investmentsPageLandBankingDesc: data.investmentsPageLandBankingDesc || "Land Banking is the practice of buying land in undeveloped or developing areas with the intention of holding it for high capital appreciation. It is one of the safest and most profitable real estate strategies.",
                        investmentsPageLandBankingBenefits: data.investmentsPageLandBankingBenefits && data.investmentsPageLandBankingBenefits.length > 0
                            ? data.investmentsPageLandBankingBenefits
                            : [
                                "Secure Title Documents (C of O, Gazette)",
                                "100% ROI within 12-24 months in prime locations",
                                "Zero maintenance costs while you hold"
                              ],
                        investmentsPageLandBankingImage: data.investmentsPageLandBankingImage || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop",
                        investmentsPageLandBankingBtnText: data.investmentsPageLandBankingBtnText || "View Available Lands",
                        investmentsPageDevBadge: data.investmentsPageDevBadge || "Construction",
                        investmentsPageDevTitle: data.investmentsPageDevTitle || "Property Development",
                        investmentsPageDevDesc: data.investmentsPageDevDesc || "We design and build premium residential and commercial structures tailored to modern living. From automated smart homes to eco-friendly office spaces, our developments define luxury.",
                        investmentsPageDevBenefits: data.investmentsPageDevBenefits && data.investmentsPageDevBenefits.length > 0
                            ? data.investmentsPageDevBenefits
                            : [
                                "Smart Home Integration",
                                "Premium Finishing & Materials",
                                "Eco-Friendly Designs",
                                "Facility Management Services"
                              ],
                        investmentsPageDevImage: data.investmentsPageDevImage || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2831&auto=format&fit=crop",
                        investmentsPageDevBtnText: data.investmentsPageDevBtnText || "See Our Projects",
                        investmentsPageAppreciationTitle: data.investmentsPageAppreciationTitle || "The Power of Appreciation",
                        investmentsPageAppreciationNote: data.investmentsPageAppreciationNote || "*Projections based on historical data of the Ibeju-Lekki corridor. Real estate values in this axis have consistently outperformed traditional savings.",
                        investmentsPageAppreciationYears: data.investmentsPageAppreciationYears && data.investmentsPageAppreciationYears.length > 0
                            ? data.investmentsPageAppreciationYears
                            : [
                                { year: "Year 1", growth: "Initial Investment", percentage: 30 },
                                { year: "Year 3", growth: "50% Growth", percentage: 60 },
                                { year: "Year 5+", growth: "150% ROI", percentage: 100 }
                              ],
                        investmentsPageProcessTitle: data.investmentsPageProcessTitle || "Ready to Start?",
                        investmentsPageProcessBtnText: data.investmentsPageProcessBtnText || "Begin Process",
                        investmentsPageProcessSteps: data.investmentsPageProcessSteps && data.investmentsPageProcessSteps.length > 0
                            ? data.investmentsPageProcessSteps
                            : [
                                { step: "01", title: "Free Consultation" },
                                { step: "02", title: "Site Inspection" },
                                { step: "03", title: "Payment & Documentation" },
                                { step: "04", title: "Asset Allocation" }
                              ]
                    });
                }
            } catch (e) {
                console.error("Failed to load investments page settings:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchInvestmentsSettings();
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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative bg-secondary text-white py-24 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-primary/90 mix-blend-multiply z-10" />
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2573&auto=format&fit=crop')" }}
                    />
                </div>

                <div className="container relative z-20 mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                        {renderTitle(settings.investmentsPageHeroTitle)}
                    </h1>
                    <p className="text-xl text-white/90 font-light leading-relaxed mb-8">
                        {settings.investmentsPageHeroSubtitle}
                    </p>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100" asChild>
                        <Link href="/contact">{settings.investmentsPageHeroBtnText}</Link>
                    </Button>
                </div>
            </section>

            {/* Service: Land Banking */}
            <SectionWrapper id="land-banking" className="bg-white">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6">
                            <LandPlot size={16} /> {settings.investmentsPageLandBankingBadge}
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-6">{settings.investmentsPageLandBankingTitle}</h2>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                            {settings.investmentsPageLandBankingDesc}
                        </p>
                        <ul className="space-y-4 mb-8">
                            {settings.investmentsPageLandBankingBenefits.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                                    <CheckCircle className="text-primary w-5 h-5 shrink-0" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Button asChild>
                            <Link href="/projects">{settings.investmentsPageLandBankingBtnText}</Link>
                        </Button>
                    </div>
                    <div className="order-1 md:order-2 h-[400px] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                        <div
                            className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-700"
                            style={{ backgroundImage: `url('${settings.investmentsPageLandBankingImage}')` }}
                        />
                    </div>
                </div>
            </SectionWrapper>

            {/* Investment Calculator Section */}
            <ROICalculator />

            {/* Service: Property Development */}
            <SectionWrapper id="development" className="bg-gray-50">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="h-[400px] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                        <div
                            className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-700"
                            style={{ backgroundImage: `url('${settings.investmentsPageDevImage}')` }}
                        />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-bold uppercase tracking-wider mb-6">
                            <Building2 size={16} /> {settings.investmentsPageDevBadge}
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-6">{settings.investmentsPageDevTitle}</h2>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                            {settings.investmentsPageDevDesc}
                        </p>
                        <ul className="space-y-4 mb-8">
                            {settings.investmentsPageDevBenefits.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                                    <CheckCircle className="text-yellow-600 w-5 h-5 shrink-0" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Button variant="outline" asChild>
                            <Link href="/projects">{settings.investmentsPageDevBtnText}</Link>
                        </Button>
                    </div>
                </div>
            </SectionWrapper>

            {/* ROI Explainer */}
            <section className="bg-primary text-white py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-12">{settings.investmentsPageAppreciationTitle}</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {settings.investmentsPageAppreciationYears.map((ay, i) => (
                            <div key={i} className="bg-white/10 p-8 rounded-xl border border-white/20">
                                <div className="text-4xl font-bold mb-2">{ay.year}</div>
                                <div className="text-xl opacity-80 mb-4">{ay.growth}</div>
                                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${ay.percentage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-12 text-lg text-white/80 max-w-2xl mx-auto">
                        {settings.investmentsPageAppreciationNote}
                    </p>
                </div>
            </section>

            {/* Process CTA */}
            <SectionWrapper className="text-center">
                <h2 className="text-4xl font-serif font-bold text-foreground mb-8">{settings.investmentsPageProcessTitle}</h2>
                <div className="flex justify-center gap-8 mb-12 flex-wrap">
                    {settings.investmentsPageProcessSteps.map((s, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 mb-4 border-2 border-gray-200">
                                {s.step}
                            </div>
                            <div className="font-bold text-foreground">{s.title}</div>
                        </div>
                    ))}
                </div>
                <Button size="lg" asChild>
                    <Link href="/contact">{settings.investmentsPageProcessBtnText} <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
            </SectionWrapper>
        </div>
    );
}
