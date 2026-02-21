"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, LandPlot, Building2, Briefcase, Smartphone } from "lucide-react";
import Link from "next/link";
import { SERVICES } from "@/data";

const iconMap = {
    LandPlot: LandPlot,
    Building2: Building2,
    Briefcase: Briefcase,
    Smartphone: Smartphone,
};

const ServiceGrid = () => {
    return (
        <SectionWrapper className="bg-muted/30">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-primary font-bold uppercase tracking-widest text-sm bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                    What We Offer
                </span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mt-4 mb-6">
                    Wealth Creation Strategies
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    We've curated a suite of real estate solutions designed to help you secure, grow, and multiply your capital in the Nigerian market.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {SERVICES.map((service, index) => {
                    const Icon = iconMap[service.icon];
                    return (
                        <Card key={index} className="group border-border hover:border-primary/30 transition-all duration-500">
                            <CardHeader>
                                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <Icon size={28} strokeWidth={1.5} />
                                </div>
                                <CardTitle className="group-hover:text-primary transition-colors">
                                    {service.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {service.description}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="link" className="p-0 text-primary group-hover:translate-x-2 transition-transform duration-300" asChild>
                                    <Link href={service.href}>
                                        Learn More <ArrowRight className="ml-1 w-4 h-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </SectionWrapper>
    );
};

export default ServiceGrid;
