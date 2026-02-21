"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900">
            {/* Static Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')" }}
                />
            </div>

            <div className="container relative z-20 px-4 pt-20">
                <div className="max-w-4xl text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium tracking-wide uppercase mb-6">
                        Indigenous Excellence in Real Estate
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight">
                        Build Wealth With <br />
                        <span className="text-primary">
                            Living Vine
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed">
                        Your trusted partner for secure land ownership and high-yield property development in Nigeria's most rapidly growing markets.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button size="lg" className="h-16 px-10 text-lg" asChild>
                            <Link href="/investments">
                                Start Investing <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="glass" className="h-16 px-10 text-lg group bg-white text-black hover:bg-gray-100 border-none" asChild>
                            <Link href="/projects">
                                <Play className="mr-2 w-5 h-5" />
                                Watch Our Story
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
