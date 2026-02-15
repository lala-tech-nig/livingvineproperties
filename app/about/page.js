"use client";

import Image from "next/image";
import { CheckCircle, Award, Users, Target, Briefcase } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Card, CardContent } from "@/components/ui/Card";

export default function About() {
    return (
        <div className="pt-20 bg-white">
            {/* Hero Section */}
            <section className="relative bg-secondary text-white py-32 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/80 z-10" />
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')" }}
                    />
                </div>

                <div className="container relative z-20 mx-auto max-w-4xl">
                    <div className="inline-block mb-4">
                        <span className="py-1 px-3 border border-white/30 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-sm">
                            Established 2015
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                        Building Legacies, <br /> <span className="text-primary">One Acre at a Time.</span>
                    </h1>
                    <p className="text-xl text-gray-300 font-light leading-relaxed">
                        We are Living Vine Properties. An indigenous real estate company committed to bridging the gap between ambition and ownership through transparency, integrity, and strategic innovation.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <SectionWrapper className="bg-white">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="bg-gray-50 p-10 rounded-2xl border-l-4 border-primary">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-foreground">Our Mission</h2>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            To empower individuals and organizations with secure, profitable real estate investment opportunities that create generational wealth, while contributing significantly to the infrastructural development of Nigeria.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-10 rounded-2xl border-l-4 border-yellow-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-600">
                                <Award size={32} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-foreground">Our Vision</h2>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            To be the most trusted and preferred real estate partner in Africa, known for our unwavering commitment to client satisfaction, project excellence, and community growth.
                        </p>
                    </div>
                </div>
            </SectionWrapper>

            {/* Core Values */}
            <SectionWrapper className="bg-gray-50">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-primary font-bold tracking-widest uppercase mb-2">Our DNA</h2>
                    <h3 className="text-4xl font-serif font-bold mb-4 text-foreground">What Drives Us</h3>
                    <p className="text-muted-foreground text-lg">
                        These core values guide every decision we make and every interaction we have.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Integrity", icon: CheckCircle, desc: "We are transparent in our dealings. No hidden fees, no ambiguity using verifiable documentation." },
                        { title: "Excellence", icon: Award, desc: "We don't settle for average. Our projects are designed to meet global standards of quality and aesthetics." },
                        { title: "Client First", icon: Users, desc: "Your financial goals are our priority. We tailor our solutions to meet your specific investment needs." }
                    ].map((val, i) => (
                        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-8 text-center px-8 pb-10">
                                <div className="mx-auto w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                                    <val.icon size={32} />
                                </div>
                                <h4 className="text-xl font-bold font-serif mb-4 text-foreground">{val.title}</h4>
                                <p className="text-muted-foreground">{val.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </SectionWrapper>

            {/* Leadership Team */}
            <SectionWrapper className="bg-white">
                <div className="text-center mb-16">
                    <h2 className="text-primary font-bold tracking-widest uppercase mb-2">Leadership</h2>
                    <h3 className="text-4xl font-serif font-bold mb-4 text-foreground">Meet The Minds</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {[
                        { name: "Micheal Okonkwo", role: "MD / CEO", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop" },
                        { name: "Sarah Adebayo", role: "Head of Operations", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop" },
                        { name: "Barr. Tunde Cole", role: "Legal Secretary", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop" }
                    ].map((member, i) => (
                        <div key={i} className="group text-center">
                            <div className="relative h-80 w-full mb-6 overflow-hidden rounded-xl bg-gray-200">
                                <div
                                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                    style={{ backgroundImage: `url('${member.img}')` }}
                                />
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-foreground">{member.name}</h4>
                            <p className="text-primary font-medium uppercase tracking-wider text-sm">{member.role}</p>
                        </div>
                    ))}
                </div>
            </SectionWrapper>

            {/* Certifications & Trust */}
            <section className="py-20 bg-gray-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-serif font-bold mb-10 opacity-80">Certified & Registered With</h3>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos */}
                        <div className="text-2xl font-bold flex items-center gap-2"><Briefcase /> CAC RC: 1234567</div>
                        <div className="text-2xl font-bold flex items-center gap-2"><Award /> REDAN</div>
                        <div className="text-2xl font-bold flex items-center gap-2"><CheckCircle /> EFCC SCUML</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
