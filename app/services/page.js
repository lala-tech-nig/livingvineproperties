"use client";

import { Crown, Handshake, Landmark, TrendingUp } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { SERVICES } from "@/data";

export default function Services() {
    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-secondary text-secondary-foreground py-20 px-4 text-center">
                <div className="container mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6">Our Services</h1>
                    <p className="text-xl max-w-3xl mx-auto text-secondary-foreground/80">
                        Comprehensive real estate solutions designed for wealth creation and asset security.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16 space-y-24">
                {SERVICES.map((service, index) => {
                    const Icon = service.icon;
                    const isEven = index % 2 === 0;
                    return (
                        <SectionWrapper key={index} id={service.href.split('#')[1]} className="scroll-mt-24">
                            <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                                <div className="lg:w-1/2">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                        <Icon size={32} />
                                    </div>
                                    <h2 className="text-3xl font-serif font-bold mb-4">{service.title}</h2>
                                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                        {service.description}
                                    </p>
                                    <div className="prose text-muted-foreground">
                                        {/* Expanded content based on service type */}
                                        {service.title === "Investment Schemes" && (
                                            <p>We offer a broad spectrum of real estate investment opportunities with a high level of security for capital invested. Prospective investors having the desire to achieve guaranteed return on capital investment are welcomed.</p>
                                        )}
                                        {service.title === "Joint Ventures" && (
                                            <p>Building strong and healthy partnerships through a vast network of business-driven investors remains the core business strategy of the company. We collaborate to deliver mutually beneficial projects.</p>
                                        )}
                                        {service.title === "Land Acquisition" && (
                                            <p>Acquiring vacant land as a fixed economic asset with good capital appreciation potential for either on-going business concerns or outright sales upon market maturity offers investors a secured means of investment.</p>
                                        )}
                                        {service.title === "Real Estate Finance" && (
                                            <p>The adopted model for real estate financing is equity. Financial resources required for property development are sourced internally by way of equity funding or capital contributions.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:w-1/2 w-full">
                                    <Card className="overflow-hidden border-none shadow-lg bg-secondary/5">
                                        <div className="h-64 sm:h-80 w-full relative bg-neutral-200 flex items-center justify-center">
                                            {/* Placeholder Image */}
                                            <Icon size={80} className="text-neutral-400 opacity-20" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </SectionWrapper>
                    );
                })}
            </div>
        </div>
    );
}
