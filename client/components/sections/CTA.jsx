"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import api from "@/lib/axios";

const CTA = () => {
    const [cta, setCta] = useState({
        homeCTATitle: "",
        homeCTADesc: "",
        homeCTABtnText: "",
        homeCTAAltBtnText: ""
    });

    useEffect(() => {
        const fetchCTA = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data) {
                    setCta({
                        homeCTATitle: data.homeCTATitle || "",
                        homeCTADesc: data.homeCTADesc || "",
                        homeCTABtnText: data.homeCTABtnText || "",
                        homeCTAAltBtnText: data.homeCTAAltBtnText || ""
                    });
                }
            } catch (e) {
                // Fail silently
            }
        };
        fetchCTA();
    }, []);

    if (!cta.homeCTATitle) return null;

    // Split title by newlines or handle line breaks
    const renderTitle = (titleText) => {
        if (!titleText) return "";
        return titleText.split('\n').map((line, i, arr) => (
            <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
            </span>
        ));
    };

    return (
        <section className="bg-primary py-32 text-center text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

            <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">
                    {renderTitle(cta.homeCTATitle)}
                </h2>
                <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                    {cta.homeCTADesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 h-16 px-12 text-xl font-bold rounded-full shadow-2xl" asChild>
                        <Link href="/contact">
                            {cta.homeCTABtnText} <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-16 px-12 text-xl font-medium rounded-full" asChild>
                        <Link href="/contact">{cta.homeCTAAltBtnText}</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default CTA;
