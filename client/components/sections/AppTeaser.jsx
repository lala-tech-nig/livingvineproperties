"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Home, LayoutGrid, History, Building2, HeadphonesIcon, ArrowRight, MonitorSmartphone } from "lucide-react";
import api from "@/lib/axios";

/* ── Circular progress ring ─────────────────────────────── */
function ProgressRing({ pct = 72, r = 26, stroke = 4, trackColor = "#e5e7eb", fillColor = "#16a34a" }) {
    const circ = 2 * Math.PI * r;
    return (
        <svg width={r * 2 + stroke * 2} height={r * 2 + stroke * 2} className="rotate-[-90deg]">
            <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
            <circle
                cx={r + stroke} cy={r + stroke} r={r}
                fill="none"
                stroke={fillColor}
                strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={circ - (circ * pct) / 100}
                strokeLinecap="round"
            />
        </svg>
    );
}

/* ── Countdown hook ──────────────────────────────────────── */
function useCountdown(days = 45, hrs = 12, mins = 30, secs = 20) {
    const [time, setTime] = useState({ d: days, h: hrs, m: mins, s: secs });
    useEffect(() => {
        const id = setInterval(() => {
            setTime(prev => {
                let { d, h, m, s } = prev;
                s--;
                if (s < 0) { s = 59; m--; }
                if (m < 0) { m = 59; h--; }
                if (h < 0) { h = 23; d--; }
                if (d < 0) return prev;
                return { d, h, m, s };
            });
        }, 1000);
        return () => clearInterval(id);
    }, []);
    return time;
}

/* ── Apple SVG ───────────────────────────────────────────── */
const AppleSVG = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white shrink-0">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
);

/* ── Google Play SVG ─────────────────────────────────────── */
const GooglePlaySVG = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0">
        <path fill="#EA4335" d="M3.18 1.47A2 2 0 0 0 3 2.3v19.4c0 .3.06.57.18.82L13 12 3.18 1.47z" />
        <path fill="#FBBC05" d="M16.41 8.84 13 12l3.41 3.16 4.34-2.51a1.37 1.37 0 0 0 0-2.3l-4.34-2.51z" />
        <path fill="#4285F4" d="M3.18 22.53 13 12 3.18 1.47C2.48 1.83 3 2.54 3 3.3v17.4c0 .76-.52 1.47.18 1.83z" />
        <path fill="#34A853" d="M13 12l3.41 3.16-9.58 5.54c-.5.3-1.13.27-1.65-.17L13 12z" />
        <path fill="#4285F4" d="M6.82 3.47 13 12 5.18 3.47A1.94 1.94 0 0 1 6.82 3.3v.17z" />
    </svg>
);

/* ── Main component ──────────────────────────────────────── */
const AppTeaser = () => {
    const countdown = useCountdown();
    const pad = (n) => String(n).padStart(2, "0");

    const [teaser, setTeaser] = useState({
        homeAppTeaserBadge: "",
        homeAppTeaserTitle: "",
        homeAppTeaserDesc: "",
        homeAppTeaserFeatures: []
    });

    useEffect(() => {
        const fetchTeaser = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data) {
                    setTeaser({
                        homeAppTeaserBadge: data.homeAppTeaserBadge || "",
                        homeAppTeaserTitle: data.homeAppTeaserTitle || "",
                        homeAppTeaserDesc: data.homeAppTeaserDesc || "",
                        homeAppTeaserFeatures: data.homeAppTeaserFeatures || []
                    });
                }
            } catch (e) {
                // Fail silently
            }
        };
        fetchTeaser();
    }, []);

    const properties = [];

    if (!teaser.homeAppTeaserTitle) return null;

    return (
        <section className="relative bg-white py-24 overflow-hidden border-t border-gray-100">
            {/* Background accent */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -right-40 top-20 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -left-40 bottom-0 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 xl:gap-24 items-center relative z-10">

                {/* ── Left: copy + CTAs ──────────────────────── */}
                <div className="order-2 lg:order-1 text-left">
                    <span className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-full mb-6">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        {teaser.homeAppTeaserBadge}
                    </span>
                    <h2 className="text-4xl md:text-5xl xl:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                        {teaser.homeAppTeaserTitle}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                        {teaser.homeAppTeaserDesc}
                    </p>

                    {/* Feature bullets */}
                    <ul className="space-y-3 mb-10 text-sm text-gray-600">
                        {teaser.homeAppTeaserFeatures.map((f) => (
                            <li key={f} className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </span>
                                {f}
                            </li>
                        ))}
                    </ul>

                    {/* Store buttons */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
                        {/* Apple App Store */}
                        <button className="group flex items-center gap-3 bg-black hover:bg-gray-900 text-white h-[58px] px-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 min-w-[170px]">
                            <AppleSVG />
                            <div className="text-left leading-tight">
                                <div className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">Download on the</div>
                                <div className="text-[15px] font-bold tracking-tight">App Store</div>
                            </div>
                        </button>

                        {/* Google Play */}
                        <button className="group flex items-center gap-3 bg-[#1a1a2e] hover:bg-[#16213e] text-white h-[58px] px-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 min-w-[170px]">
                            <GooglePlaySVG />
                            <div className="text-left leading-tight">
                                <div className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">Get it on</div>
                                <div className="text-[15px] font-bold tracking-tight">Google Play</div>
                            </div>
                        </button>

                        {/* Web App */}
                        <Link
                            href="/investor/login"
                            className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-white h-[58px] px-5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 min-w-[170px]"
                        >
                            <MonitorSmartphone size={26} className="shrink-0" />
                            <div className="text-left leading-tight">
                                <div className="text-[9px] text-orange-100 uppercase tracking-widest font-medium">Access via</div>
                                <div className="text-[15px] font-bold tracking-tight flex items-center gap-1">
                                    Web App
                                    <ArrowRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                </div>
                            </div>
                        </Link>
                    </div>
                    <p className="text-xs text-muted-foreground">Available on iOS, Android & Web. Registration required.</p>
                </div>

                {/* ── Right: phone mockup ─────────────────────── */}
                <div className="order-1 lg:order-2 relative flex justify-center items-center h-[660px]">
                    {/* glow rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-80 h-80 rounded-full border border-primary/10 absolute" />
                        <div className="w-96 h-96 rounded-full border border-primary/5 absolute" />
                    </div>

                    {/* Tilted background phone (shadow clone) */}
                    <div className="absolute w-[270px] h-[560px] bg-gray-200 rounded-[2.8rem] rotate-6 translate-x-10 translate-y-2 opacity-50 shadow-2xl" />

                    {/* Main phone */}
                    <div className="relative w-[290px] h-[600px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden z-10 flex flex-col">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[22px] bg-gray-900 rounded-b-2xl z-20" />

                        {/* Status bar */}
                        <div className="flex justify-between px-5 pt-2.5 pb-1 text-[9px] font-semibold text-gray-500 shrink-0">
                            <span>9:41</span>
                            <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 fill-gray-500" viewBox="0 0 24 24"><path d="M1.5 8.5a13 13 0 0 1 21 0M5 12a10 10 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0M12 19h.01" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/></svg>
                                <svg className="w-3.5 h-2 fill-gray-500" viewBox="0 0 20 12"><rect x="0" y="3" width="16" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><rect x="1.5" y="4.5" width="9" height="6" rx="1" fill="currentColor"/><path d="M17 5v4a2 2 0 0 0 0-4z" fill="currentColor"/></svg>
                            </div>
                        </div>

                        {/* Scrollable app content */}
                        <div className="flex-1 overflow-y-auto bg-gray-50" style={{ scrollbarWidth: "none" }}>
                            {/* App header */}
                            <div className="bg-white px-4 pt-2 pb-3 flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">M</div>
                                    <div>
                                        <div className="text-[9px] text-gray-400 leading-none">Hello, Michael 👋</div>
                                        <div className="text-[11px] font-bold text-gray-800 leading-tight">Welcome back to<br/><span className="text-primary">Living Vine Properties</span></div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Bell size={18} className="text-gray-600" />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                                </div>
                            </div>

                            <div className="p-3 space-y-3">
                                {/* Current investment section */}
                                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Current Investment</div>

                                {/* Investment card */}
                                <div className="bg-primary rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
                                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-[9px] text-orange-200 font-medium">Wealth Builder Plan</div>
                                            <div className="text-white text-[11px] font-bold">Total Investment</div>
                                        </div>
                                        {/* LVP logo badge */}
                                        <div className="w-9 h-6 bg-white rounded overflow-hidden flex items-center justify-center shadow">
                                            <img src="/living-logo.png" alt="LVP" className="w-full h-full object-contain p-0.5" />
                                        </div>
                                    </div>
                                    <div className="text-white text-xl font-bold mb-1">₦2,500,000.00</div>
                                    <div className="text-orange-200 text-[9px] font-mono tracking-widest mb-2">•••• •••• •••• 4678</div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-[9px] text-orange-200">Investment Ends In</div>
                                        <div className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full">VISA</div>
                                    </div>
                                </div>

                                {/* Countdown + Progress */}
                                <div className="bg-white rounded-xl p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        {/* Timer */}
                                        <div className="flex gap-2 items-end">
                                            {[{ v: pad(countdown.d), l: "DAYS" }, { v: pad(countdown.h), l: "HRS" }, { v: pad(countdown.m), l: "MINS" }, { v: pad(countdown.s), l: "SECS" }].map(({ v, l }, i) => (
                                                <div key={i} className="text-center">
                                                    <div className="text-[15px] font-black text-gray-800 tabular-nums leading-none">{v}</div>
                                                    <div className="text-[7px] text-gray-400 font-semibold">{l}</div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Progress ring */}
                                        <div className="relative">
                                            <ProgressRing pct={72} r={20} stroke={4} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-[10px] font-black text-green-600">72%</span>
                                                <span className="text-[6px] text-gray-400 leading-none">Progress</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Returns */}
                                <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-gray-400">Total Returns (Estimated)</div>
                                        <div className="text-[13px] font-black text-gray-800">₦1,350,000.00</div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <button className="w-full bg-primary text-white text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/30">
                                    Start New Investment <ArrowRight size={12} />
                                </button>

                                {/* Explore Properties */}
                                <div>
                                    <div className="flex justify-between items-center mb-2 px-0.5">
                                        <div className="text-[10px] font-bold text-gray-700">Explore Properties</div>
                                        <div className="text-[8px] text-primary font-semibold">View all</div>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                                        {properties.map((p) => (
                                            <div key={p.name} className="shrink-0 w-[110px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                                <img src={p.img} alt={p.name} className="w-full h-[60px] object-cover" />
                                                <div className="p-1.5">
                                                    <div className="text-[8px] font-bold text-gray-800 leading-tight truncate">{p.name}</div>
                                                    <div className="text-[7px] text-gray-400 truncate">{p.location}</div>
                                                    <div className="text-[8px] font-bold text-primary mt-0.5">{p.price}</div>
                                                    <div className="text-[7px] text-gray-400">{p.sqm}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Extra spacing for bottom nav */}
                            <div className="h-14" />
                        </div>

                        {/* Bottom nav bar */}
                        <div className="shrink-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-2">
                            {[
                                { icon: Home, label: "Home", active: true },
                                { icon: LayoutGrid, label: "Invest" },
                                { icon: History, label: "History" },
                                { icon: Building2, label: "Properties" },
                                { icon: HeadphonesIcon, label: "Support" },
                            ].map(({ icon: Icon, label, active }) => (
                                <div key={label} className={`flex flex-col items-center gap-0.5 ${active ? "text-primary" : "text-gray-400"}`}>
                                    <Icon size={14} />
                                    <span className="text-[7px] font-semibold">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Home indicator */}
                        <div className="flex justify-center pb-1.5 bg-white shrink-0">
                            <div className="w-16 h-[3px] bg-gray-300 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppTeaser;
