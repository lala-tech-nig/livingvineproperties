'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PlusCircle, TrendingUp, Calendar, Wallet, ArrowRight, Eye, RefreshCw, Star, Info, UserCheck, Phone, Mail, Settings, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ── Circular progress ring component ─────────────────── */
function ProgressRing({ pct = 72, r = 26, stroke = 4, trackColor = "#e5e7eb", fillColor = "#16a34a" }) {
    const circ = 2 * Math.PI * r;
    const strokeDashoffset = circ - (circ * pct) / 100;
    return (
        <svg width={r * 2 + stroke * 2} height={r * 2 + stroke * 2} className="rotate-[-90deg]">
            <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
            <circle
                cx={r + stroke} cy={r + stroke} r={r}
                fill="none"
                stroke={fillColor}
                strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={isNaN(strokeDashoffset) ? circ : strokeDashoffset}
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function InvestorDashboard() {
    const { user } = useAuthStore();
    const [investments, setInvestments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileCompletion, setProfileCompletion] = useState(null);
    
    // Countdown state for nearest active investment
    const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [nearestInv, setNearestInv] = useState(null);
    const [invProgress, setInvProgress] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, projRes, completionRes] = await Promise.all([
                api.get('/investments/my'),
                api.get('/website/projects'),
                api.get('/users/profile/completion').catch(() => ({ data: null })),
            ]);
            setInvestments(invRes.data);
            setProjects(projRes.data || []);
            if (completionRes.data) setProfileCompletion(completionRes.data);
            
            // Find active/approved investment with nearest maturity date
            const activeInvs = invRes.data.filter(i => i.status === 'approved' || i.status === 'active' || i.status === 'reviewing');
            if (activeInvs.length > 0) {
                const approvedInvs = activeInvs.filter(i => i.status === 'approved' || i.status === 'active');
                const selectedInv = approvedInvs.length > 0 ? approvedInvs[0] : activeInvs[0];
                setNearestInv(selectedInv);
            }
        } catch (error) {
            toast.error('Failed to load investments');
        } finally {
            setLoading(false);
        }
    };

    // Countdown Timer logic
    useEffect(() => {
        if (!nearestInv) return;

        const updateTimer = () => {
            const start = new Date(nearestInv.startDate || nearestInv.createdAt).getTime();
            const durationMonths = nearestInv.durationInMonths || 6;
            const end = start + durationMonths * 30 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            const remaining = end - now;
            
            if (remaining <= 0) {
                setCountdown({ d: 0, h: 0, m: 0, s: 0 });
                setInvProgress(100);
                return;
            }

            const total = end - start;
            const elapsed = now - start;
            const pct = Math.min(Math.round((elapsed / total) * 100), 100);
            setInvProgress(pct > 0 ? pct : 0);

            const d = Math.floor(remaining / (1000 * 60 * 65 * 24));
            const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((remaining % (1000 * 65 * 60)) / (1000 * 60));
            const s = Math.floor((remaining % (1000 * 60)) / 1000);
            
            setCountdown({ d, h, m, s });
        };

        updateTimer();
        const id = setInterval(updateTimer, 1000);
        return () => clearInterval(id);
    }, [nearestInv]);

    const totalInvested = investments.reduce((acc, curr) => acc + curr.amountToInvest, 0);
    const totalExpectedROI = investments.reduce((acc, curr) => acc + (curr.expectedROI || 0), 0);
    const totalProfit = totalExpectedROI - totalInvested;

    const pad = (n) => String(n).padStart(2, "0");

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading your portfolio...</div>;
    }

    return (
        <div className="space-y-6">

            {/* ── Profile Completion Banner ─────────────────────────────── */}
            {profileCompletion && profileCompletion.percent < 100 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden relative">
                    {/* Gradient accent */}
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
                        style={{ background: profileCompletion.percent >= 80 ? '#22c55e' : profileCompletion.percent >= 50 ? '#f59e0b' : '#de1f25' }} />
                    <div className="pl-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Settings size={15} className="text-gray-400" />
                                <p className="text-sm font-bold text-gray-900">
                                    Profile <span style={{ color: profileCompletion.percent >= 80 ? '#22c55e' : profileCompletion.percent >= 50 ? '#f59e0b' : '#de1f25' }}>{profileCompletion.percent}%</span> complete
                                </p>
                            </div>
                            <Link href="/investor/account-settings"
                                className="flex items-center gap-1 text-xs font-bold text-[#de1f25] hover:underline">
                                Complete <ChevronRight size={12} />
                            </Link>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${profileCompletion.percent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: profileCompletion.percent >= 80 ? '#22c55e' : profileCompletion.percent >= 50 ? '#f59e0b' : '#de1f25' }} />
                        </div>
                        {/* Missing item chips */}
                        <div className="flex flex-wrap gap-1.5">
                            {profileCompletion.checks.filter(c => !c.done).slice(0, 5).map(c => (
                                <Link key={c.key} href="/investor/account-settings"
                                    className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 hover:bg-[#de1f25]/10 hover:text-[#de1f25] text-gray-500 rounded-full transition-colors flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full border border-gray-400" />
                                    {c.label}
                                </Link>
                            ))}
                            {profileCompletion.checks.filter(c => !c.done).length > 5 && (
                                <span className="text-[10px] text-gray-400 font-medium self-center">+{profileCompletion.checks.filter(c => !c.done).length - 5} more</span>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Completed profile celebration chip ── */}
            {profileCompletion && profileCompletion.percent === 100 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <p className="text-sm font-semibold text-green-800">Your profile is 100% complete — thank you! 🎉</p>
                </motion.div>
            )}

            {/* MOBILE VIEW (Renders on < lg screens)                        */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="lg:hidden space-y-5 pb-20">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    Current Investment
                </div>

                {/* Investment Card */}
                {nearestInv ? (
                    <div className="bg-gradient-to-br from-orange-900 to-orange-850 rounded-2xl p-4.5 shadow-lg relative overflow-hidden text-white">
                        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-[10px] text-orange-200 font-bold uppercase tracking-wider">
                                    {nearestInv.durationInMonths} Months Yield Plan
                                </div>
                                <div className="text-white text-xs font-semibold opacity-90 mt-0.5">Active Portfolio Capital</div>
                            </div>
                            {/* LVP logo badge */}
                            <div className="w-10 h-7 bg-white rounded overflow-hidden flex items-center justify-center shadow">
                                <img src="/living-logo.png" alt="LVP" className="w-full h-full object-contain p-0.5" />
                            </div>
                        </div>
                        <div className="text-white text-2xl font-black mb-1">
                            ₦{nearestInv.amountToInvest.toLocaleString()}.00
                        </div>
                        <div className="text-orange-200 text-[10px] font-mono tracking-widest mb-3">
                            •••• •••• •••• {nearestInv._id.substring(nearestInv._id.length - 4).toUpperCase()}
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-orange-100 border-t border-white/10 pt-2.5">
                            <div>Status: <span className="font-bold capitalize bg-white/20 px-2 py-0.5 rounded-full">{nearestInv.status}</span></div>
                            <div className="text-[8px] bg-white/20 text-white px-2 py-0.5 rounded">LVP</div>
                        </div>
                    </div>
                ) : (
                    /* No Active Investment card placeholder */
                    <div className="bg-gradient-to-br from-orange-950 to-orange-900 rounded-2xl p-6 shadow-lg relative overflow-hidden text-white text-center">
                        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                        <h4 className="font-serif font-bold text-lg mb-2">No Active Portfolio</h4>
                        <p className="text-xs text-orange-200 mb-5 max-w-xs mx-auto leading-relaxed">
                            Create your first land banking portfolio to start generating high-yield returns.
                        </p>
                        <Link
                            href="/investor/new-investment"
                            className="inline-flex items-center justify-center gap-2 bg-white text-orange-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                        >
                            Start Investing <ArrowRight size={14} />
                        </Link>
                    </div>
                )}

                {/* Countdown & Progress Circle */}
                {nearestInv && (nearestInv.status === 'approved' || nearestInv.status === 'active') && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            {/* Timer countdown digits */}
                            <div className="space-y-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Time to Maturity</span>
                                <div className="flex gap-2.5 items-end">
                                    {[{ v: pad(countdown.d), l: "DAYS" }, { v: pad(countdown.h), l: "HRS" }, { v: pad(countdown.m), l: "MINS" }, { v: pad(countdown.s), l: "SECS" }].map(({ v, l }, i) => (
                                        <div key={i} className="text-center">
                                            <div className="text-lg font-black text-gray-800 tabular-nums leading-none">{v}</div>
                                            <div className="text-[7px] text-gray-400 font-bold tracking-wider mt-0.5">{l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Progress circle */}
                            <div className="relative shrink-0">
                                <ProgressRing pct={invProgress} r={22} stroke={4} fillColor="#de1f25" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-[9px] font-black text-[#de1f25]">{invProgress}%</span>
                                    <span className="text-[5px] text-gray-400 uppercase font-bold leading-none">Ratio</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Returns summary box */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <TrendingUp className="text-emerald-600" size={18} />
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {nearestInv ? 'Portfolio Returns (Expected)' : 'Expected Net Return'}
                        </div>
                        <div className="text-base font-black text-gray-800 mt-0.5">
                            ₦{nearestInv ? nearestInv.expectedROI?.toLocaleString() : totalExpectedROI.toLocaleString()}.00
                        </div>
                    </div>
                </div>

                {/* Account Officer Card — Mobile */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <UserCheck className="text-orange-800" size={14} />
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Your Account Officer</span>
                    </div>
                    {user?.accountOfficer ? (
                        <div className="space-y-1.5">
                            <p className="font-bold text-gray-900 text-sm leading-tight">
                                {user.accountOfficer.firstName} {user.accountOfficer.surname}
                            </p>
                            <p className="text-[10px] text-orange-700 font-semibold capitalize bg-orange-50 rounded-full px-2 py-0.5 inline-block">
                                {user.accountOfficer.role}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Mail size={11} className="text-gray-400" />
                                <a href={`mailto:${user.accountOfficer.email}`} className="text-[10px] text-gray-500 hover:text-[#de1f25] transition-colors truncate">
                                    {user.accountOfficer.email}
                                </a>
                            </div>
                            {user.accountOfficer.phoneNumber && (
                                <div className="flex items-center gap-1.5">
                                    <Phone size={11} className="text-gray-400" />
                                    <a href={`tel:${user.accountOfficer.phoneNumber}`} className="text-[10px] text-gray-500 hover:text-[#de1f25] transition-colors">
                                        {user.accountOfficer.phoneNumber}
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-2">
                            <p className="text-xs text-gray-400">No account officer assigned yet.</p>
                            <p className="text-[10px] text-gray-300 mt-0.5">Contact us to get support.</p>
                        </div>
                    )}
                </div>

                {/* Start New Investment CTA */}
                {nearestInv && (
                    <Link
                        href="/investor/new-investment"
                        className="w-full bg-[#de1f25] text-white text-xs font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#de1f25]/25 active:scale-98 transition-all hover:bg-[#b0181d]"
                    >
                        Start New Investment <PlusCircle size={14} />
                    </Link>
                )}

                {/* Explore Properties strip (dynamic from WebsiteProject DB) */}
                <div className="space-y-2.5">
                    <div className="flex justify-between items-center px-1">
                        <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Explore Portfolios</div>
                        <Link href="/projects" className="text-[9px] text-primary font-bold">View all</Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x" style={{ scrollbarWidth: "none" }}>
                        {projects.length === 0 ? (
                            /* Fallback cards */
                            [
                                { name: "Premium Estate", location: "Lekki, Lagos", price: "₦18M – ₦45M", img: "/lagos.jpg" },
                                { name: "Greenview Estate", location: "Ikeja GRA, Lagos", price: "₦10M – ₦28M", img: "/lagos.jpg" }
                            ].map((p, i) => (
                                <div key={i} className="shrink-0 w-32 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 snap-start">
                                    <div className="h-16 w-full bg-cover bg-center" style={{ backgroundImage: `url('${p.img}')` }} />
                                    <div className="p-2.5">
                                        <div className="text-[9px] font-bold text-gray-800 leading-tight truncate">{p.name}</div>
                                        <div className="text-[7px] text-gray-400 truncate mt-0.5">{p.location}</div>
                                        <div className="text-[9px] font-bold text-[#de1f25] mt-1">{p.price}</div>
                                    </div>
                                </div>
                            ))
                        ) : projects.map((proj) => (
                            <div key={proj._id} className="shrink-0 w-36 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-150 snap-start">
                                <div className="h-20 w-full bg-cover bg-center" style={{ backgroundImage: `url('${proj.image || '/lagos.jpg'}')` }} />
                                <div className="p-2.5">
                                    <div className="text-[9px] font-bold text-gray-800 leading-tight truncate">{proj.title}</div>
                                    <div className="text-[7px] text-gray-400 truncate mt-0.5">{proj.location}</div>
                                    <div className="text-[9px] font-bold text-orange-950 mt-1 uppercase tracking-wider">{proj.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* DESKTOP VIEW (Renders on >= lg screens)                      */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="hidden lg:block space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h2>
                        <p className="text-gray-500">Here is what is happening with your investments.</p>
                    </div>
                    <Link
                        href="/investor/new-investment"
                        className="flex items-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-[#de1f25]/20 animate-pulse"
                    >
                        <PlusCircle size={20} />
                        Start New Investment
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <Wallet size={20} className="text-[#de1f25]" />
                            <h3 className="font-medium">Total Invested</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">₦{totalInvested.toLocaleString()}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <TrendingUp size={20} className="text-green-600" />
                            <h3 className="font-medium">Expected Returns</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 text-green-700">₦{totalExpectedROI.toLocaleString()}</p>
                        <p className="text-sm text-green-600 mt-1 font-medium">+₦{totalProfit.toLocaleString()} profit</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-orange-900 to-orange-800 p-6 rounded-2xl border border-orange-850 shadow-lg text-white flex flex-col justify-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-700 rounded-full blur-2xl opacity-50"></div>
                        <h3 className="font-medium text-orange-200 mb-1 relative z-10">Active Portfolios</h3>
                        <p className="text-3xl font-bold relative z-10">{investments.filter(i => i.status !== 'liquidated').length}</p>
                    </motion.div>
                </div>

                {/* Two-column layout: investments table + account officer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Investments Table (2/3 width) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Your Investments</h3>
                        </div>

                    {investments.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="text-gray-450" size={32} />
                            </div>
                            <p className="mb-4">You have no active investments yet.</p>
                            <Link
                                href="/investor/new-investment"
                                className="text-[#de1f25] font-medium hover:text-[#b0181d]"
                            >
                                Start your first investment →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-650 border-b border-gray-105">Plan / Reference</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-650 border-b border-gray-105">Capital</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-650 border-b border-gray-105">Duration</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-650 border-b border-gray-105">Expected ROI</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-650 border-b border-gray-105">Status</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-655 border-b border-gray-105 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {investments.map((inv) => (
                                        <tr key={inv._id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-905">Real Estate Yield Portfolio</p>
                                                <p className="text-xs text-gray-500 uppercase">{inv._id.substring(0, 8)}</p>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">₦{inv.amountToInvest.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{inv.durationInMonths} Months</td>
                                            <td className="px-6 py-4 text-green-700 font-bold">₦{inv.expectedROI?.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                                                    ${inv.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    inv.status === 'approved' || inv.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    inv.status === 'declined' ? 'bg-red-100 text-red-800 border-red-200' :
                                                    'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/investor/investment/${inv._id}`} className="inline-flex items-center gap-1 bg-[#de1f25]/10 hover:bg-[#de1f25]/20 text-[#de1f25] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                    <Eye size={14} /> View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </div>

                    {/* Right column: Account Officer + quick stats */}
                    <div className="space-y-4">
                        {/* Account Officer Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                    <UserCheck size={20} className="text-orange-800" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Officer</p>
                                    <p className="text-[10px] text-gray-300">Your dedicated representative</p>
                                </div>
                            </div>
                            {user?.accountOfficer ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-800 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {user.accountOfficer.firstName?.charAt(0)}{user.accountOfficer.surname?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.accountOfficer.firstName} {user.accountOfficer.surname}</p>
                                            <span className="text-[10px] font-semibold text-orange-700 capitalize bg-orange-50 px-2 py-0.5 rounded-full">
                                                {user.accountOfficer.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-50 pt-3 space-y-2">
                                        <a
                                            href={`mailto:${user.accountOfficer.email}`}
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#de1f25] transition-colors group"
                                        >
                                            <Mail size={14} className="text-gray-400 group-hover:text-[#de1f25]" />
                                            <span className="truncate">{user.accountOfficer.email}</span>
                                        </a>
                                        {user.accountOfficer.phoneNumber && (
                                            <a
                                                href={`tel:${user.accountOfficer.phoneNumber}`}
                                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#de1f25] transition-colors group"
                                            >
                                                <Phone size={14} className="text-gray-400 group-hover:text-[#de1f25]" />
                                                <span>{user.accountOfficer.phoneNumber}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                        <UserCheck size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">No Account Officer Assigned</p>
                                    <p className="text-xs text-gray-300 mt-1">Contact our office to get a dedicated representative.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
