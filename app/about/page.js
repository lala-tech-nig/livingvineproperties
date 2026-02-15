"use client";

import Image from "next/image";
import { Building, ShieldCheck, Target, Users } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function About() {
    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-secondary text-secondary-foreground py-20 px-4 text-center">
                <div className="container mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6">About Us</h1>
                    <p className="text-xl max-w-3xl mx-auto text-secondary-foreground/80">
                        Building strong and healthy partnerships through a vast network of business-driven investors.
                    </p>
                </div>
            </section>

            {/* Intro Section */}
            <SectionWrapper>
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-serif font-bold mb-6">Who We Are</h2>
                        <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                            Living Vine Properties & Investments Ltd is a premier real estate firm dedicated to providing secure and profitable investment opportunities. We specialize in identifying high-value assets and managing them to ensure maximum returns for our clients.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Our adopted model for real estate financing is equity. Financial resources required for property development are sourced internally by way of equity funding or capital contributions by investors committed to the cause of business.
                        </p>
                    </div>
                    <div className="relative h-[400px] w-full rounded-2xl overflow-hidden bg-neutral-100">
                        {/* Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
                            <Building size={64} className="text-neutral-400" />
                        </div>
                    </div>
                </div>
            </SectionWrapper>

            {/* Core Values */}
            <SectionWrapper className="bg-secondary/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold mb-4">Our Core Values</h2>
                        <div className="w-24 h-1 bg-primary mx-auto" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Integrity", icon: ShieldCheck, desc: "We uphold the highest standards of honesty and transparency in all our dealings." },
                            { title: "Innovation", icon: Target, desc: "Constantly seeking new and better ways to serve our clients and maximize value." },
                            { title: "Client Centricity", icon: Users, desc: "Our clients' success is our success. We prioritize your goals above all else." }
                        ].map((value, i) => (
                            <Card key={i} className="text-center border-none shadow-md">
                                <CardHeader>
                                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                                        <value.icon size={32} />
                                    </div>
                                    <CardTitle className="mb-2">{value.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{value.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
