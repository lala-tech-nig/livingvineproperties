'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    PlusCircle, TrendingUp, Wallet, ArrowRight, Eye,
    UserCheck, Phone, Mail, Settings, CheckCircle2, ChevronRight,
    Copy, Upload, CheckCircle, Clock, Loader2, Receipt, Banknote,
    Bell, ChevronLeft, Home, BarChart3, History, HeadphonesIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const pad = (n) => String(n).padStart(2, '0');

/* ── Circular progress ring ──────────────────────────────── */
function ProgressRing({ pct = 0, r = 30, stroke = 4, trackColor = 'rgba(255,255,255,0.2)', fillColor = '#fff' }) {
    const circ = 2 * Math.PI * r;
    const dashoffset = circ - (circ * pct) / 100;
    return (
        <svg width={r * 2 + stroke * 2} height={r * 2 + stroke * 2} className="rotate-[-90deg]">
            <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
            <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" stroke={fillColor} strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={isNaN(dashoffset) ? circ : dashoffset}
                strokeLinecap="round" />
        </svg>
    );
}

/* ── Chip SVG (like a real card chip) ───────────────────── */
function ChipIcon() {
    return (
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
            <rect width="36" height="28" rx="4" fill="#D4AF37" opacity="0.9" />
            <rect x="13" y="0" width="10" height="28" rx="0" fill="#C9A227" opacity="0.5" />
            <rect x="0" y="9" width="36" height="10" rx="0" fill="#C9A227" opacity="0.5" />
            <rect x="13" y="9" width="10" height="10" rx="1" fill="#B8941E" />
        </svg>
    );
}

/* ── Visa Card ───────────────────────────────────────────── */
function VisaCard({ inv, index, isActive: cardActive }) {
    const gradients = [
        'from-[#7a1010] via-[#b91c1c] to-[#7f1d1d]',
        'from-[#1e3a5f] via-[#1e40af] to-[#1e3a5f]',
        'from-[#14532d] via-[#166534] to-[#14532d]',
        'from-[#4c1d95] via-[#6d28d9] to-[#4c1d95]',
        'from-[#7c2d12] via-[#c2410c] to-[#7c2d12]',
    ];
    const gradient = gradients[index % gradients.length];
    const lastFour = inv._id.slice(-4).toUpperCase();
    const statusLabel = {
        reviewing: 'UNDER REVIEW',
        approved:  'PAYMENT DUE',
        active:    'ACTIVE',
        liquidated:'MATURED',
        declined:  'DECLINED',
    }[inv.status] || inv.status.toUpperCase();

    return (
        <div className={`relative w-full rounded-[22px] overflow-hidden bg-gradient-to-br ${gradient} p-5 shadow-2xl select-none`}
            style={{ aspectRatio: '1.586 / 1', minHeight: 0 }}>

            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute top-10 right-16 w-20 h-20 rounded-full bg-white/5" />

            {/* Top row: plan name + LVP badge */}
            <div className="flex items-start justify-between mb-3 relative z-10">
                <div>
                    <p className="text-white/60 text-[10px] font-semibold uppercase tracking-[0.15em]">
                        {inv.durationInMonths}‑Month Yield Plan
                    </p>
                    <p className="text-white text-sm font-bold mt-0.5">Wealth Builder Plan</p>
                </div>
                {/* LVP circular badge */}
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg shrink-0">
                    <img src="/living-logo.png" alt="LVP" className="w-8 h-8 object-contain" onError={e => { e.target.style.display='none'; }} />
                </div>
            </div>

            {/* Chip */}
            <div className="mb-3 relative z-10">
                <ChipIcon />
            </div>

            {/* Amount */}
            <div className="relative z-10 mb-1">
                <p className="text-white/60 text-[9px] uppercase tracking-widest font-medium">Total Investment</p>
                <p className="text-white text-2xl font-black tracking-tight leading-tight">
                    ₦{inv.amountToInvest?.toLocaleString()}.00
                </p>
            </div>

            {/* Bottom row: card dots + status + VISA */}
            <div className="flex items-center justify-between mt-3 relative z-10">
                <div className="flex items-center gap-1.5">
                    <span className="text-white/50 text-xs tracking-[0.2em]">•••• •••• ••••</span>
                    <span className="text-white font-bold text-xs tracking-wider ml-1">{lastFour}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        inv.status === 'active' ? 'bg-emerald-400/30 text-emerald-200' :
                        inv.status === 'approved' ? 'bg-blue-400/30 text-blue-200' :
                        inv.status === 'reviewing' ? 'bg-amber-400/30 text-amber-200' :
                        'bg-white/20 text-white/70'
                    }`}>{statusLabel}</span>
                    {/* VISA wordmark */}
                    <svg viewBox="0 0 80 26" width="40" height="14" fill="white">
                        <path d="M30.5 1.8L25 24.2h-6L24.5 1.8h6zm25 14.7c-.1-5.8-8-6.1-8-8.7 0-.8.8-1.6 2.4-1.8 1-.1 3.8-.2 7 1.5l1.2-5.8C56.5.5 54 0 50.8 0c-5.6 0-9.6 3-9.6 7.3 0 3.2 2.8 5 4.9 6 2.2 1.1 2.9 1.8 2.9 2.7 0 1.5-1.7 2.1-3.3 2.2-2.8 0-4.4-.8-5.7-1.4l-1 4.8c1.3.6 3.7 1.1 6.2 1.1 5.9 0 9.8-2.9 9.8-7.2zm14.7 7.7h5.3L71 1.8h-4.9c-1.1 0-2 .6-2.4 1.6L55.3 24.2h6l1.2-3.3h7.3l.7 3.3zm-6.3-7.9l3-8.2 1.7 8.2h-4.7zm-24.1-14.5L35 24.2h-5.7L29.5 1.8h5.3z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

/* ── Countdown Timer Row ────────────────────────────────── */
function CountdownTimer({ inv }) {
    const [cd, setCd]         = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (inv.status !== 'active') return;
        const tick = () => {
            const start   = new Date(inv.startDate || inv.createdAt).getTime();
            const end     = start + (inv.durationInMonths || 6) * 30 * 24 * 60 * 60 * 1000;
            const now     = Date.now();
            const rem     = end - now;
            if (rem <= 0) { setCd({ d: 0, h: 0, m: 0, s: 0 }); setProgress(100); return; }
            const total   = end - start;
            setProgress(Math.min(Math.round(((now - start) / total) * 100), 100));
            setCd({
                d: Math.floor(rem / (1000 * 60 * 60 * 24)),
                h: Math.floor((rem % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((rem % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((rem % (1000 * 60)) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [inv]);

    if (inv.status !== 'active') return null;

    return (
        <div className="flex items-center justify-between px-1">
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Investment Ends In</p>
                <div className="flex items-end gap-3">
                    {[{ v: pad(cd.d), l: 'DAYS' }, { v: pad(cd.h), l: 'HRS' }, { v: pad(cd.m), l: 'MINS' }, { v: pad(cd.s), l: 'SECS' }].map(({ v, l }, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl font-black text-gray-800 tabular-nums leading-none">{v}</div>
                            <div className="text-[8px] text-gray-400 font-bold tracking-wider mt-0.5">{l}</div>
                        </div>
                    ))}
                    {/* separators */}
                </div>
            </div>
            <div className="relative shrink-0">
                <ProgressRing pct={progress} r={30} stroke={4} trackColor="#e5e7eb" fillColor="#de1f25" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-black text-[#de1f25]">{progress}%</span>
                    <span className="text-[7px] text-gray-400 uppercase font-bold leading-none">Progress</span>
                </div>
            </div>
        </div>
    );
}

/* ── Payment Banner (approved, no receipt) ──────────────── */
function PaymentBanner({ inv, onReceiptUploaded }) {
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied]       = useState(false);
    const fileRef                   = useRef(null);
    const hasBankInfo               = !!inv.ceoPaymentAccount?.accountNumber;
    const hasReceipt                = !!inv.paymentReceipt;

    const copy = () => {
        if (!hasBankInfo) return;
        navigator.clipboard.writeText(inv.ceoPaymentAccount.accountNumber);
        setCopied(true);
        toast.success('Account number copied!');
        setTimeout(() => setCopied(false), 3000);
    };

    const upload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const form = new FormData();
            form.append('receipt', file);
            await api.put(`/investments/${inv._id}/receipt`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Receipt uploaded! Management will review and start your investment.');
            onReceiptUploaded();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload receipt');
        } finally { setUploading(false); }
    };

    if (!hasBankInfo) {
        return (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-blue-700 font-medium">
                Payment account details will appear once the CEO assigns a bank account.
            </div>
        );
    }

    if (hasReceipt) {
        return (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-emerald-800">Receipt Uploaded ✓</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Awaiting manager review to start your investment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-[10px] font-bold text-[#de1f25] uppercase tracking-widest flex items-center gap-1">
                <Banknote size={11} /> Make Payment To
            </p>
            <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Bank</span>
                    <span className="font-bold text-gray-900">{inv.ceoPaymentAccount.bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Account Name</span>
                    <span className="font-bold text-gray-900 text-xs text-right max-w-[60%]">{inv.ceoPaymentAccount.accountName}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
                    <span className="text-gray-400 text-xs">Account Number</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-gray-900 tracking-widest text-sm">{inv.ceoPaymentAccount.accountNumber}</span>
                        <button onClick={copy} className={`p-1 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                            {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between bg-[#de1f25]/5 rounded-xl px-3 py-2">
                    <span className="text-xs text-[#de1f25] font-semibold">Amount to Send</span>
                    <span className="font-black text-[#de1f25]">₦{inv.amountToInvest?.toLocaleString()}</span>
                </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={upload} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full flex items-center justify-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-60 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-[#de1f25]/20 active:scale-[0.98]">
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploading ? 'Uploading...' : 'Attach Payment Receipt'}
            </button>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════ */
/*  MAIN INVESTOR DASHBOARD                                   */
/* ══════════════════════════════════════════════════════════ */
export default function InvestorDashboard() {
    const { user }  = useAuthStore();
    const [investments, setInvestments] = useState([]);
    const [projects, setProjects]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [profileCompletion, setProfileCompletion] = useState(null);
    const [activeCardIndex, setActiveCardIndex]     = useState(0);

    /* running = reviewing | approved | active */
    const runningInvestments = investments.filter(i => ['reviewing', 'approved', 'active'].includes(i.status));
    const currentInv         = runningInvestments[activeCardIndex] || null;

    /* carousel refs for touch/swipe */
    const carouselRef = useRef(null);
    const touchStart  = useRef(null);

    useEffect(() => { fetchData(); }, []);

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
        } catch {
            toast.error('Failed to load investments');
        } finally {
            setLoading(false);
        }
    };

    const totalInvested    = investments.reduce((s, i) => s + (i.amountToInvest || 0), 0);
    const totalExpectedROI = investments.reduce((s, i) => s + (i.expectedROI || 0), 0);

    /* swipe handlers */
    const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
    const onTouchEnd   = (e) => {
        if (touchStart.current === null) return;
        const delta = touchStart.current - e.changedTouches[0].clientX;
        if (delta > 40 && activeCardIndex < runningInvestments.length - 1) setActiveCardIndex(i => i + 1);
        if (delta < -40 && activeCardIndex > 0) setActiveCardIndex(i => i - 1);
        touchStart.current = null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen gap-3 bg-white">
                <Loader2 size={26} className="animate-spin text-[#de1f25]" />
                <span className="text-gray-400 font-medium text-sm">Loading portfolio...</span>
            </div>
        );
    }

    /* ────────────────────────────────────── */
    /* MOBILE VIEW                            */
    /* ────────────────────────────────────── */
    return (
        <div className="space-y-0">

            {/* ── MOBILE LAYOUT ── */}
            <div className="lg:hidden pb-24 bg-gray-50 min-h-screen">

                {/* Header */}
                <div className="bg-white px-5 pt-6 pb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#de1f25] to-orange-500 flex items-center justify-center text-white font-bold text-base shadow-md">
                            {user?.firstName?.[0]}{user?.surname?.[0]}
                        </div>
                        <div>
                            <p className="text-base font-black text-gray-900 leading-tight">
                                Hello, {user?.firstName} 👋
                            </p>
                            <p className="text-[11px] text-gray-400">Welcome back to Living Vine Properties</p>
                        </div>
                    </div>
                    <Link href="/investor/notifications"
                        className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                        <Bell size={18} />
                    </Link>
                </div>

                {/* Profile completion banner */}
                {profileCompletion && profileCompletion.percent < 100 && (
                    <div className="mx-4 mt-3">
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-amber-100 shadow-sm p-3.5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                <Settings size={14} className="text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800">Profile {profileCompletion.percent}% complete</p>
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                                    <div className="h-full rounded-full bg-[#de1f25] transition-all" style={{ width: `${profileCompletion.percent}%` }} />
                                </div>
                            </div>
                            <Link href="/investor/account-settings" className="text-[10px] font-bold text-[#de1f25] shrink-0">Complete</Link>
                        </motion.div>
                    </div>
                )}

                {/* ── Current Investment label ── */}
                <div className="px-5 pt-5 pb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-[#de1f25] uppercase tracking-widest">Current Investment</p>
                    {runningInvestments.length > 0 && (
                        <p className="text-[10px] text-gray-400 font-medium">{activeCardIndex + 1} / {runningInvestments.length}</p>
                    )}
                </div>

                {/* ── VISA CARD CAROUSEL ── */}
                {runningInvestments.length === 0 ? (
                    <div className="mx-4">
                        <div className="relative rounded-[22px] overflow-hidden bg-gradient-to-br from-[#7a1010] via-[#b91c1c] to-[#7f1d1d] p-5 shadow-2xl"
                            style={{ aspectRatio: '1.586 / 1' }}>
                            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
                            <div className="flex flex-col items-center justify-center h-full gap-3 relative z-10">
                                <p className="text-white/60 text-sm font-semibold">No Active Portfolio</p>
                                <Link href="/investor/new-investment"
                                    className="flex items-center gap-2 bg-white text-[#de1f25] font-bold text-xs px-4 py-2 rounded-xl shadow-md">
                                    Start Investing <ArrowRight size={13} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative px-4"
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                        ref={carouselRef}>

                        {/* Stacked card peek effect */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCardIndex}
                                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -60, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
                                <VisaCard inv={runningInvestments[activeCardIndex]} index={activeCardIndex} isActive />
                            </motion.div>
                        </AnimatePresence>

                        {/* Nav arrows */}
                        {runningInvestments.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveCardIndex(i => Math.max(0, i - 1))}
                                    disabled={activeCardIndex === 0}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center text-gray-700 disabled:opacity-0 transition-opacity z-10">
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={() => setActiveCardIndex(i => Math.min(runningInvestments.length - 1, i + 1))}
                                    disabled={activeCardIndex === runningInvestments.length - 1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center text-gray-700 disabled:opacity-0 transition-opacity z-10">
                                    <ChevronRight size={14} />
                                </button>
                            </>
                        )}

                        {/* Dot indicators */}
                        {runningInvestments.length > 1 && (
                            <div className="flex justify-center gap-1.5 mt-3">
                                {runningInvestments.map((_, i) => (
                                    <button key={i} onClick={() => setActiveCardIndex(i)}
                                        className={`rounded-full transition-all ${i === activeCardIndex ? 'w-5 h-1.5 bg-[#de1f25]' : 'w-1.5 h-1.5 bg-gray-300'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Below card: countdown or payment prompt ── */}
                {currentInv && (
                    <div className="px-4 mt-4 space-y-3">

                        {/* Reviewing */}
                        {currentInv.status === 'reviewing' && (
                            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                    <Clock size={16} className="text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Awaiting CEO Approval</p>
                                    <p className="text-xs text-gray-400 mt-0.5">You will be notified once your application is reviewed.</p>
                                </div>
                            </div>
                        )}

                        {/* Approved: payment section */}
                        {currentInv.status === 'approved' && (
                            <PaymentBanner inv={currentInv} onReceiptUploaded={fetchData} />
                        )}

                        {/* Active: countdown */}
                        {currentInv.status === 'active' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                <CountdownTimer inv={currentInv} />
                            </div>
                        )}

                        {/* Total Returns */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                <TrendingUp size={17} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                                    Total Returns (Estimated)
                                </p>
                                <p className="text-xl font-black text-gray-900 mt-0.5">
                                    ₦{(currentInv.expectedROI || 0).toLocaleString()}.00
                                </p>
                            </div>
                        </div>

                        {/* View details link */}
                        <Link href={`/investor/investment/${currentInv._id}`}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                            <Eye size={14} /> View Full Details
                        </Link>
                    </div>
                )}

                {/* ── Start New Investment CTA ── */}
                <div className="px-4 mt-4">
                    <Link href="/investor/new-investment"
                        className="w-full flex items-center justify-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#de1f25]/25 transition-all text-sm active:scale-[0.98]">
                        Start New Investment <ArrowRight size={16} />
                    </Link>
                </div>

                {/* ── Explore Properties ── */}
                {projects.length > 0 && (
                    <div className="px-4 mt-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-black text-gray-900">Explore Properties</p>
                            <Link href="/projects" className="text-xs text-[#de1f25] font-bold">View all</Link>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 snap-x -mx-0" style={{ scrollbarWidth: 'none' }}>
                            {projects.slice(0, 6).map(proj => (
                                <div key={proj._id} className="shrink-0 w-40 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 snap-start">
                                    <div className="h-24 w-full bg-cover bg-center bg-gray-100" style={{ backgroundImage: `url('${proj.image || '/lagos.jpg'}')` }} />
                                    <div className="p-2.5">
                                        <div className="text-[10px] font-bold text-gray-900 leading-tight truncate">{proj.title}</div>
                                        <div className="text-[9px] text-gray-400 truncate mt-0.5">{proj.location}</div>
                                        <div className="text-[9px] font-bold text-[#de1f25] mt-1 uppercase tracking-wider">{proj.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Dot strip */}
                        <div className="flex justify-center gap-1 mt-2">
                            {projects.slice(0, 6).map((_, i) => (
                                <div key={i} className={`rounded-full ${i === 0 ? 'w-4 h-1 bg-[#de1f25]' : 'w-1 h-1 bg-gray-300'}`} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════════ */}
            {/* DESKTOP VIEW                                 */}
            {/* ════════════════════════════════════════════ */}
            <div className="hidden lg:block space-y-6 pb-12">

                {/* Header row */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Hello, {user?.firstName} 👋</h2>
                        <p className="text-gray-400 text-sm mt-0.5">Welcome back to Living Vine Properties</p>
                    </div>
                    <Link href="/investor/new-investment"
                        className="flex items-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-md shadow-[#de1f25]/20 text-sm">
                        <PlusCircle size={18} /> Start New Investment
                    </Link>
                </div>

                {/* KPI summary row */}
                <div className="grid grid-cols-3 gap-5">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-gray-400">
                            <Wallet size={18} className="text-[#de1f25]" />
                            <p className="text-xs font-semibold uppercase tracking-wider">Total Invested</p>
                        </div>
                        <p className="text-2xl font-black text-gray-900">₦{totalInvested.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-gray-400">
                            <TrendingUp size={18} className="text-emerald-500" />
                            <p className="text-xs font-semibold uppercase tracking-wider">Expected Returns</p>
                        </div>
                        <p className="text-2xl font-black text-emerald-700">₦{totalExpectedROI.toLocaleString()}</p>
                        <p className="text-xs text-emerald-500 mt-1 font-medium">+₦{(totalExpectedROI - totalInvested).toLocaleString()} profit</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#7a1010] to-[#b91c1c] p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-red-200 mb-2">Running Portfolios</p>
                        <p className="text-3xl font-black relative z-10">{runningInvestments.length}</p>
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-3 gap-6">

                    {/* Carousel + details — 2/3 */}
                    <div className="col-span-2 space-y-5">
                        <p className="text-xs font-bold text-[#de1f25] uppercase tracking-widest">Current Investment</p>

                        {runningInvestments.length === 0 ? (
                            <div className="relative rounded-[22px] overflow-hidden bg-gradient-to-br from-[#7a1010] via-[#b91c1c] to-[#7f1d1d] p-8 shadow-2xl text-center"
                                style={{ aspectRatio: '2.2 / 1' }}>
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <p className="text-white/60 font-semibold">No Active Portfolio</p>
                                    <Link href="/investor/new-investment"
                                        className="flex items-center gap-2 bg-white text-[#de1f25] font-bold text-sm px-5 py-2.5 rounded-xl shadow-md">
                                        Start Investing <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                                <AnimatePresence mode="wait">
                                    <motion.div key={activeCardIndex}
                                        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
                                        <VisaCard inv={runningInvestments[activeCardIndex]} index={activeCardIndex} isActive />
                                    </motion.div>
                                </AnimatePresence>

                                {runningInvestments.length > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => setActiveCardIndex(i => Math.max(0, i - 1))}
                                                disabled={activeCardIndex === 0}
                                                className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all">
                                                <ChevronLeft size={14} />
                                            </button>
                                            <button onClick={() => setActiveCardIndex(i => Math.min(runningInvestments.length - 1, i + 1))}
                                                disabled={activeCardIndex === runningInvestments.length - 1}
                                                className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all">
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {runningInvestments.map((_, i) => (
                                                <button key={i} onClick={() => setActiveCardIndex(i)}
                                                    className={`rounded-full transition-all ${i === activeCardIndex ? 'w-5 h-1.5 bg-[#de1f25]' : 'w-1.5 h-1.5 bg-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Below-card content */}
                        {currentInv && (
                            <div className="space-y-4">
                                {currentInv.status === 'reviewing' && (
                                    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                            <Clock size={18} className="text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Awaiting CEO Approval</p>
                                            <p className="text-sm text-gray-400 mt-0.5">Your application is under review. You will be notified once approved.</p>
                                        </div>
                                    </div>
                                )}

                                {currentInv.status === 'approved' && (
                                    <PaymentBanner inv={currentInv} onReceiptUploaded={fetchData} />
                                )}

                                {currentInv.status === 'active' && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <CountdownTimer inv={currentInv} />
                                    </div>
                                )}

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                        <TrendingUp size={18} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Returns (Estimated)</p>
                                        <p className="text-2xl font-black text-gray-900 mt-0.5">₦{(currentInv.expectedROI || 0).toLocaleString()}.00</p>
                                    </div>
                                    <Link href={`/investor/investment/${currentInv._id}`}
                                        className="ml-auto flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                                        <Eye size={14} /> Details
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column — account officer */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                    <UserCheck size={16} className="text-orange-800" />
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
                                            {user.accountOfficer.firstName?.[0]}{user.accountOfficer.surname?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{user.accountOfficer.firstName} {user.accountOfficer.surname}</p>
                                            <span className="text-[10px] text-orange-700 capitalize bg-orange-50 px-2 py-0.5 rounded-full font-semibold">
                                                {user.accountOfficer.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2 border-t border-gray-50">
                                        <a href={`mailto:${user.accountOfficer.email}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#de1f25] transition-colors">
                                            <Mail size={13} className="text-gray-300" />
                                            <span className="truncate text-xs">{user.accountOfficer.email}</span>
                                        </a>
                                        {user.accountOfficer.phoneNumber && (
                                            <a href={`tel:${user.accountOfficer.phoneNumber}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#de1f25] transition-colors">
                                                <Phone size={13} className="text-gray-300" />
                                                <span className="text-xs">{user.accountOfficer.phoneNumber}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <UserCheck size={24} className="text-gray-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No officer assigned</p>
                                </div>
                            )}
                        </div>

                        {/* All investments summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">All Investments</p>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {investments.map((inv, i) => (
                                    <Link key={inv._id} href={`/investor/investment/${inv._id}`}
                                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-gray-900 truncate">₦{inv.amountToInvest?.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">{inv._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                                            inv.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                            inv.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                            inv.status === 'reviewing' ? 'bg-amber-100 text-amber-700' :
                                            'bg-gray-100 text-gray-600'}`}>
                                            {inv.status}
                                        </span>
                                    </Link>
                                ))}
                                {investments.length === 0 && (
                                    <p className="text-xs text-gray-300 text-center py-4">No investments yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Explore Properties */}
                {projects.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-black text-gray-900">Explore Properties</p>
                            <Link href="/projects" className="text-xs text-[#de1f25] font-bold hover:underline">View all</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {projects.slice(0, 4).map(proj => (
                                <div key={proj._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="h-32 w-full bg-cover bg-center bg-gray-100" style={{ backgroundImage: `url('${proj.image || '/lagos.jpg'}')` }} />
                                    <div className="p-3">
                                        <p className="text-xs font-bold text-gray-900 leading-tight truncate">{proj.title}</p>
                                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{proj.location}</p>
                                        <p className="text-[10px] font-bold text-[#de1f25] mt-1.5 uppercase tracking-wider">{proj.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
