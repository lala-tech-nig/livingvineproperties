"use client";

import { Button } from "@/components/ui/Button";
import { Apple, Smartphone } from "lucide-react";

const AppTeaser = () => {
    return (
        <section className="bg-gray-50 py-24 border-t border-gray-200">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                <div className="text-left">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block">Coming Soon</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                        Invest on the Go. <br />
                        <span className="text-primary">
                            Anytime, Anywhere.
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed font-light">
                        Track your portfolio, receive project updates, and secure new land acquisitions directly from your smartphone. The future of indigenous real estate investment is in your pocket.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                        <Button className="bg-black text-white hover:bg-gray-800 h-14 px-6 rounded-md flex items-center gap-3">
                            <Apple size={24} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase font-bold text-gray-400">Download on the</div>
                                <div className="text-sm font-bold">App Store</div>
                            </div>
                        </Button>
                        <Button variant="outline" className="border-gray-300 text-foreground hover:bg-gray-100 h-14 px-6 rounded-md flex items-center gap-3">
                            <Smartphone size={24} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase font-bold text-gray-500">Get it on</div>
                                <div className="text-sm font-bold">Google Play</div>
                            </div>
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="w-2 h-2 bg-green-600 rounded-full" />
                        Beta access opening soon. Join the waitlist.
                    </div>
                </div>

                {/* Simulated Phone Mockups - Static */}
                <div className="relative h-[600px] w-full flex justify-center items-center">
                    {/* Phone 1 */}
                    <div className="w-[280px] h-[580px] bg-black border-8 border-gray-800 rounded-[3rem] shadow-2xl z-10 overflow-hidden">
                        {/* Screen Content Placeholder */}
                        <div className="w-full h-full bg-slate-900 flex flex-col pt-12 px-6">
                            <div className="flex justify-between items-center text-white mb-8">
                                <div className="text-lg font-bold">Hello, Tunji</div>
                                <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                            </div>
                            <div className="bg-primary rounded-xl p-6 mb-6">
                                <div className="text-white/70 text-sm mb-1">Total Portfolio Value</div>
                                <div className="text-3xl font-bold text-white">₦45,200,000</div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-20 bg-gray-800 rounded-lg"></div>
                                <div className="h-20 bg-gray-800 rounded-lg"></div>
                                <div className="h-20 bg-gray-800 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppTeaser;
