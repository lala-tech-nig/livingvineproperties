"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";

const STATS = [
    { label: "Land Units Sold", value: "2,500+" },
    { label: "Happy Investors", value: "850+" },
    { label: "Project Locations", value: "15+" },
    { label: "Years Experience", value: "10+" },
];

const TrustStrip = () => {
    return (
        <section className="bg-primary text-white py-12 border-t border-primary-foreground/10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20">
                    {STATS.map((stat, i) => (
                        <div key={i} className="text-center px-4">
                            <h3 className="text-4xl md:text-5xl font-serif font-bold mb-2">{stat.value}</h3>
                            <p className="text-xs md:text-sm uppercase tracking-widest opacity-80">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustStrip;
