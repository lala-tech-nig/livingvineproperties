"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SLIDES = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop", // Modern Skyscraper
        title: "Build Wealth With Living Vine",
        subtitle: "Your trusted partner for secure land ownership and high-yield property development in Nigeria."
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop", // Luxury Home
        title: "Luxury Defined by Nature",
        subtitle: "Experience serenity in our eco-friendly estates located in prime Lagos neigborhoods."
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?q=80&w=2669&auto=format&fit=crop", // Construction / Blueprint
        title: "Invest in Solid Foundations",
        subtitle: "From land banking to commercial structures, we build assets that stand the test of time."
    }
];

const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${SLIDES[current].image}')` }}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="container relative z-20 px-4 pt-20 text-center md:text-left">
                <div className="max-w-4xl">
                    <motion.div
                        key={`text-${current}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight">
                            {SLIDES[current].title}
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed">
                            {SLIDES[current].subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Button size="lg" className="h-16 px-10 text-lg" asChild>
                                <Link href="/investments">
                                    Start Investing <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === current ? "bg-primary w-8" : "bg-white/50 hover:bg-white"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroCarousel;
