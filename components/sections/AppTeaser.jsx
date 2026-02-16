"use client";

import { Button } from "@/components/ui/Button";
import { Apple, Smartphone, LayoutGrid, PieChart, Bell, User } from "lucide-react";

const AppTeaser = () => {
    return (
        <section className="bg-gray-50 py-24 border-t border-gray-200 overflow-hidden">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                <div className="text-left order-2 lg:order-1">
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
                        <Button className="bg-black text-white hover:bg-gray-800 h-14 px-6 rounded-xl flex items-center gap-3">
                            <Apple size={24} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase font-bold text-gray-400">Download on the</div>
                                <div className="text-sm font-bold">App Store</div>
                            </div>
                        </Button>
                        <Button variant="outline" className="border-gray-300 text-foreground hover:bg-gray-100 h-14 px-6 rounded-xl flex items-center gap-3">
                            <Smartphone size={24} />
                            <div className="text-left leading-tight">
                                <div className="text-[10px] uppercase font-bold text-gray-500">Get it on</div>
                                <div className="text-sm font-bold">Google Play</div>
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Clean Phone Mockup - CSS + Lucide Icons */}
                <div className="relative h-[600px] w-full flex justify-center items-center order-1 lg:order-2">
                    <div className="relative w-[300px] h-[600px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden z-10">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                        {/* Status Bar Mock */}
                        <div className="flex justify-between px-6 pt-3 text-[10px] font-bold text-gray-400">
                            <span>9:41</span>
                            <div className="flex gap-1">
                                <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                                <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                            </div>
                        </div>

                        {/* App Content */}
                        <div className="p-6 pt-8 h-full flex flex-col bg-gray-50">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <div className="text-xs text-gray-400">Good Morning</div>
                                    <div className="font-bold text-lg">Tunji Adebayo</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User size={20} className="text-gray-500" />
                                </div>
                            </div>

                            {/* Portfolio Card */}
                            <div className="bg-primary text-white rounded-2xl p-6 shadow-lg shadow-primary/30 mb-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                                <div className="text-white/70 text-xs mb-1 font-medium">Total Portfolio Balance</div>
                                <div className="text-3xl font-bold mb-4">₦45,200,500</div>
                                <div className="flex gap-2">
                                    <span className="bg-white/20 px-2 py-1 rounded text-[10px]">+12.5% this month</span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                                {[
                                    { icon: LayoutGrid, label: "Projects" },
                                    { icon: PieChart, label: "Invest" },
                                    { icon: Bell, label: "Alerts" },
                                    { icon: User, label: "Profile" }
                                ].map((action, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-600">
                                            <action.icon size={20} />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium">{action.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Activity */}
                            <div className="flex-1 bg-white rounded-t-3xl p-6 shadow-inner -mx-6">
                                <div className="font-bold text-sm mb-4 text-gray-800">Recent Transactions</div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <PieChart size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-gray-800">Land Purchase</div>
                                                <div className="text-[10px] text-gray-400">Greenfield Estate Plot 4B</div>
                                            </div>
                                            <div className="text-xs font-bold text-red-500">-₦2.5M</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppTeaser;
