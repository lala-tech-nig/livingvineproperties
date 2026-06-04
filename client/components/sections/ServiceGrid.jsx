"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, LandPlot, Building2, Briefcase, Smartphone, HelpCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

const iconMap = {
    LandPlot: LandPlot,
    Building2: Building2,
    Briefcase: Briefcase,
    Smartphone: Smartphone,
};

const STATIC_SERVICES = [
    {
        title: "Land Banking",
        description: "Secure high-value land assets in rapidly developing areas for maximum capital appreciation.",
        icon: "LandPlot",
        href: "/investments#land-banking"
    },
    {
        title: "Property Development",
        description: "Partner with us in developing premium residential and commercial structures.",
        icon: "Building2",
        href: "/investments#development"
    },
    {
        title: "Real Estate Advisory",
        description: "Expert guidance for navigating the Nigerian real estate market with confidence.",
        icon: "Briefcase",
        href: "/investments#advisory"
    },
    {
        title: "Digital Investment",
        description: "Invest in fractional real estate ownership through our upcoming digital platform.",
        icon: "Smartphone",
        href: "/investments#digital"
    }
];

const ServiceGrid = () => {
    const [services, setServices] = useState(STATIC_SERVICES);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await api.get('/website/services');
                if (data && data.length > 0) {
                    setServices(data);
                }
            } catch (error) {
                console.error("Failed to fetch website services:", error);
            }
        };
        fetchServices();
    }, []);

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
                {services.map((service, index) => {
                    const Icon = iconMap[service.icon] || HelpCircle;
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
                                    <Link href={service.href || '/investments'}>
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
