"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CTA = () => {
    return (
        <section className="bg-primary py-32 text-center text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

            <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">
                    Start Your Journey to <br />Generational Wealth.
                </h2>
                <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                    Join hundreds of smart investors securing their future with Living Vine Properties. Secure, transparent, and built on indigenous trust.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 h-16 px-12 text-xl font-bold rounded-full shadow-2xl" asChild>
                        <Link href="/contact">
                            Invest Now <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-16 px-12 text-xl font-medium rounded-full" asChild>
                        <Link href="/contact">Talk to an Advisor</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default CTA;
