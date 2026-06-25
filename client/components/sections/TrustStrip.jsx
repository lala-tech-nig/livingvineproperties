"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import api from "@/lib/axios";

const STATIC_STATS = [];

const TrustStrip = () => {
    const [stats, setStats] = useState(STATIC_STATS);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data && data.homeStats && data.homeStats.length > 0) {
                    setStats(data.homeStats);
                }
            } catch (e) {
                // Fail silently
            }
        };
        fetchStats();
    }, []);

    if (!stats || stats.length === 0) return null;

    return (
        <section className="bg-primary text-white py-12 border-t border-primary-foreground/10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20">
                    {stats.map((stat, i) => (
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
