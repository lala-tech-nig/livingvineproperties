"use client";

import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

const AboutSnippet = () => {
    return (
        <SectionWrapper className="bg-white">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    <div className="relative z-10 h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl skew-y-3 border-8 border-white group">
                        <div
                            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: "url('/lagos.jpg')" }}
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
                        Who We Are
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                        Proudly Indigenous. <br /> Global Standards.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                        Living Vine Properties isn't just a real estate company; we are a movement. Born from a deep understanding of the Nigerian land tenure system and the local investment climate, we bridge the gap between ambition and ownership.
                    </p>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        We exist to prove that **trust, transparency, and high returns** can coexist in the indigenous market. When you invest with us, you aren't just buying land—you are securing a legacy.
                    </p>

                    <ul className="space-y-4 mb-10">
                        {["100% Verified Documentation", "Strategic Locations Only", "Guaranteed Capital Appreciation"].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 font-medium text-foreground">
                                <CheckCircle className="text-primary w-5 h-5" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <Button size="lg" className="h-14 px-8 text-lg" asChild>
                        <Link href="/about">Read Our Story</Link>
                    </Button>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default AboutSnippet;
