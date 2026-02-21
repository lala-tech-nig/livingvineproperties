"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SLIDES = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop",
        title: "Build Wealth With Living Vine",
        subtitle: "Your trusted partner for secure land ownership and high-yield property development in Nigeria."
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop",
        title: "Luxury Defined by Nature",
        subtitle: "Experience serenity in our eco-friendly estates located in prime Lagos neighborhoods."
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?q=80&w=2669&auto=format&fit=crop",
        title: "Invest in Solid Foundations",
        subtitle: "From land banking to commercial structures, we build assets that stand the test of time."
    }
];

const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);
    const [amount, setAmount] = useState(1000000);

    const ROI_PERCENTAGE = 0.26;
    const roi = amount * ROI_PERCENTAGE;
    const total = amount + roi;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black">
            {/* Background Carousel */}
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

            <div className="container relative z-20 px-4 pt-20">
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    {/* Left: Text Content - Takes more space */}
                    <motion.div
                        key={`text-${current}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-center lg:text-left lg:col-span-3"
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                            {SLIDES[current].title}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed">
                            {SLIDES[current].subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button size="lg" className="h-14 px-8 text-base" asChild>
                                <Link href="/investments">
                                    Start Investing <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Right: ROI Calculator (Desktop Only, Compact) */}
                    <div className="hidden lg:block lg:col-span-2">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden max-w-sm">
                            <div className="bg-primary p-4 text-white text-center">
                                <h3 className="text-lg font-serif font-bold">Investment Calculator</h3>
                                <p className="opacity-80 text-sm">See your potential returns</p>
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Investment Amount</label>
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="text-2xl font-serif font-bold text-foreground">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="500000"
                                        max="50000000"
                                        step="100000"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                                        <span>₦500k</span>
                                        <span>₦50M+</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">ROI (26%)</div>
                                        <motion.div
                                            key={roi}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-lg font-bold text-green-600"
                                        >
                                            +{formatCurrency(roi)}
                                        </motion.div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Total Value</div>
                                        <motion.div
                                            key={total}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-xl font-bold text-primary"
                                        >
                                            {formatCurrency(total)}
                                        </motion.div>
                                    </div>
                                </div>

                                <p className="text-center text-xs text-gray-400 mt-3">
                                    *26% ROI projection
                                </p>
                            </div>
                        </div>
                    </div>
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
