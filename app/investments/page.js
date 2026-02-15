"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, BarChart3, Building2, LandPlot, ShieldCheck, ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";

export default function Investments() {
    return (
        <div className="pt-20 bg-white">
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
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
                        Grow Your Wealth With <br /> Real Assets
                    </h1>
                    <p className="text-xl text-white/90 font-light leading-relaxed mb-8">
                        Discover our tailored investment packages designed for security, high returns, and long-term capital appreciation.
                    </p>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100" asChild>
                        <Link href="/contact">Schedule a Consultation</Link>
                    </Button>
                </div>
            </section>

            {/* Service: Land Banking */}
            <SectionWrapper id="land-banking" className="bg-white">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6">
                            <LandPlot size={16} /> Wealth Strategy
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-6">Land Banking</h2>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                            Land Banking is the practice of buying land in undeveloped or developing areas with the intention of holding it for high capital appreciation. It is one of the safest and most profitable real estate strategies.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Secure Title Documents (C of O, Gazette)",
                                "100% ROI within 12-24 months in prime locations",
                                "Zero maintenance costs while you hold"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                                    <CheckCircle className="text-primary w-5 h-5" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Button asChild>
                            <Link href="/projects">View Available Lands</Link>
                        </Button>
                    </div>
                    <div className="order-1 md:order-2 h-[400px] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                        <div
                            className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-700"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')" }}
                        />
                    </div>
                </div>
            </SectionWrapper>

            {/* Service: Property Development */}
            <SectionWrapper id="development" className="bg-gray-50">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="h-[400px] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                        <div
                            className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-700"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2831&auto=format&fit=crop')" }}
                        />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-bold uppercase tracking-wider mb-6">
                            <Building2 size={16} /> Construction
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-foreground mb-6">Property Development</h2>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                            We design and build premium residential and commercial structures tailored to modern living. From automated smart homes to eco-friendly office spaces, our developments define luxury.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Smart Home Integration",
                                "Premium Finishing & Materials",
                                "Eco-Friendly Designs",
                                "Facility Management Services"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                                    <CheckCircle className="text-yellow-600 w-5 h-5" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Button variant="outline" asChild>
                            <Link href="/projects">See Our Projects</Link>
                        </Button>
                    </div>
                </div>
            </SectionWrapper>

            {/* ROI Explainer */}
            <section className="bg-primary text-white py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-12">The Power of Appreciation</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white/10 p-8 rounded-xl border border-white/20">
                            <div className="text-4xl font-bold mb-2">Year 1</div>
                            <div className="text-xl opacity-80 mb-4">Initial Investment</div>
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[30%]" />
                            </div>
                        </div>
                        <div className="bg-white/10 p-8 rounded-xl border border-white/20">
                            <div className="text-4xl font-bold mb-2">Year 3</div>
                            <div className="text-xl opacity-80 mb-4">50% Growth</div>
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[60%]" />
                            </div>
                        </div>
                        <div className="bg-white/10 p-8 rounded-xl border border-white/20">
                            <div className="text-4xl font-bold mb-2">Year 5+</div>
                            <div className="text-xl opacity-80 mb-4">150% ROI</div>
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-full" />
                            </div>
                        </div>
                    </div>

                    <p className="mt-12 text-lg text-white/80 max-w-2xl mx-auto">
                        *Projections based on historical data of the Ibeju-Lekki corridor. Real estate values in this axis have consistently outperformed traditional savings.
                    </p>
                </div>
            </section>

            {/* Process CTA */}
            <SectionWrapper className="text-center">
                <h2 className="text-4xl font-serif font-bold text-foreground mb-8">Ready to Start?</h2>
                <div className="flex justify-center gap-8 mb-12 flex-wrap">
                    {[
                        { step: "01", title: "Free Consultation" },
                        { step: "02", title: "Site Inspection" },
                        { step: "03", title: "Payment & Documentation" },
                        { step: "04", title: "Asset Allocation" },
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 mb-4 border-2 border-gray-200">
                                {s.step}
                            </div>
                            <div className="font-bold text-foreground">{s.title}</div>
                        </div>
                    ))}
                </div>
                <Button size="lg" asChild>
                    <Link href="/contact">Begin Process <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
            </SectionWrapper>
        </div>
    );
}
