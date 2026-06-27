'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    PlusCircle, TrendingUp, Calendar, Wallet, ArrowRight, Eye,
    Star, UserCheck, Phone, Mail, Settings, CheckCircle2, ChevronRight,
    Copy, Upload, CheckCircle, Clock, Loader2, Building2, CreditCard,
    Receipt, Banknote, PlayCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ── Circular progress ring ──────────────────────────────── */
function ProgressRing({ pct = 0, r = 26, stroke = 4, trackColor = '#e5e7eb', fillColor = '#16a34a' }) {
    const circ = 2 * Math.PI * r;
    const strokeDashoffset = circ - (circ * pct) / 100;
    return (
        <svg width={r * 2 + stroke * 2} height={r * 2 + stroke * 2} className="rotate-[-90deg]">
            <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
            <circle
                cx={r + stroke} cy={r + stroke} r={r}
                fill="none" stroke={fillColor} strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={isNaN(strokeDashoffset) ? circ : strokeDashoffset}
                strokeLinecap="round"
            />
        </svg>
    );
}

const pad = (n) => String(n).padStart(2, '0');

/* ── Investment status colours ───────────────────────────── */
const STATUS_STYLES = {
    reviewing:  { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-400',   label: 'Under Review'          },
    approved:   { bg: 'bg-blue-50',    border: 'border-blue-200',    badge: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-500',   label: 'Approved — Awaiting Payment' },
    active:     { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', label: 'Active'               },
};

/* ─────────────────────────────────────────────────────────── */
/* RunningInvestmentCard                                       */
/* ─────────────────────────────────────────────────────────── */
function RunningInvestmentCard({ inv, onReceiptUploaded }) {
    const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [progress, setProgress]   = useState(0);
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied]       = useState(false);
    const fileRef = useRef(null);

    const isActive   = inv.status === 'active';
    const isApproved = inv.status === 'approved';
    const hasReceipt = !!inv.paymentReceipt;
    const hasBankInfo = inv.ceoPaymentAccount?.accountNumber;

    /* Countdown — only runs for active investments */
    useEffect(() => {
        if (!isActive) return;
        const tick = () => {
            const start = new Date(inv.startDate || inv.createdAt).getTime();
            const end   = start + (inv.durationInMonths || 6) * 30 * 24 * 60 * 60 * 1000;
            const now   = Date.now();
            const remaining = end - now;

            if (remaining <= 0) {
                setCountdown({ d: 0, h: 0, m: 0, s: 0 });
                setProgress(100);
                return;
            }
            const total   = end - start;
            const elapsed = now - start;
            setProgress(Math.min(Math.round((elapsed / total) * 100), 100));
            setCountdown({
                d: Math.floor(remaining / (1000 * 60 * 60 * 24)),
                h: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((remaining % (1000 * 60)) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [inv, isActive]);

    /* Copy account number to clipboard */
    const copyAccountNumber = () => {
        if (!hasBankInfo) return;
        navigator.clipboard.writeText(inv.ceoPaymentAccount.accountNumber);
        setCopied(true);
        toast.success('Account number copied!');
        setTimeout(() => setCopied(false), 3000);
    };

    /* Upload receipt */
    const handleFileChange = async (e) => {
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
        } finally {
            setUploading(false);
        }
    };

    const ss = STATUS_STYLES[inv.status] || STATUS_STYLES.reviewing;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border ${ss.border} ${ss.bg} overflow-hidden shadow-sm`}
        >
            {/* Card header */}
            <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ss.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                            {ss.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{inv._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <p className="text-xl font-black text-gray-900 mt-1.5">₦{inv.amountToInvest?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{inv.durationInMonths} months · Expected ROI: <span className="font-bold text-emerald-700">₦{inv.expectedROI?.toLocaleString()}</span></p>
                </div>
                <Link href={`/investor/investment/${inv._id}`}
                    className="shrink-0 p-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-[#de1f25] transition-all shadow-sm">
                    <Eye size={15} />
                </Link>
            </div>

            {/* ── REVIEWING: waiting for CEO ── */}
            {inv.status === 'reviewing' && (
                <div className="px-4 pb-4">
                    <div className="bg-amber-100/60 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                        <Clock size={14} className="text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 font-semibold">Awaiting CEO approval. You will be notified once reviewed.</p>
                    </div>
                </div>
            )}

            {/* ── APPROVED: show bank details + receipt upload ── */}
            {isApproved && (
                <div className="px-4 pb-4 space-y-3">
                    {hasBankInfo ? (
                        <div className="bg-white border border-blue-200 rounded-xl p-3 shadow-sm">
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Banknote size={11} /> Payment Account — Transfer your investment amount here
                            </p>
                            <div className="space-y-1 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-xs">Bank</span>
                                    <span className="font-bold text-gray-900">{inv.ceoPaymentAccount.bankName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-xs">Account Name</span>
                                    <span className="font-bold text-gray-900">{inv.ceoPaymentAccount.accountName}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-500 text-xs">Account Number</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-black text-gray-900 tracking-widest">{inv.ceoPaymentAccount.accountNumber}</span>
                                        <button onClick={copyAccountNumber}
                                            className={`p-1 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600'}`}>
                                            {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-blue-100">
                                <p className="text-[10px] text-blue-700 font-semibold">Transfer Amount: <span className="font-black">₦{inv.amountToInvest?.toLocaleString()}</span></p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 font-medium">
                            Payment account details will appear here once the CEO assigns a bank account.
                        </div>
                    )}

                    {/* Receipt upload section */}
                    {hasReceipt ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                            <Receipt size={14} className="text-emerald-600 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-emerald-800">Receipt Uploaded ✓</p>
                                <p className="text-[10px] text-emerald-600 mt-0.5">Awaiting manager/CEO review to start your investment.</p>
                            </div>
                        </div>
                    ) : hasBankInfo ? (
                        <div>
                            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="w-full flex items-center justify-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-60 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-[#de1f25]/20 active:scale-98"
                            >
                                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                {uploading ? 'Uploading Receipt...' : 'Attach Payment Receipt'}
                            </button>
                            <p className="text-[10px] text-gray-400 text-center mt-1">Upload your bank transfer receipt (JPG, PNG, or PDF)</p>
                        </div>
                    ) : null}
                </div>
            )}

            {/* ── ACTIVE: countdown timer ── */}
            {isActive && (
                <div className="px-4 pb-4">
                    <div className="bg-white border border-emerald-200 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Time to Maturity</p>
                                <div className="flex gap-3 items-end">
                                    {[{ v: pad(countdown.d), l: 'DAYS' }, { v: pad(countdown.h), l: 'HRS' }, { v: pad(countdown.m), l: 'MINS' }, { v: pad(countdown.s), l: 'SECS' }].map(({ v, l }, i) => (
                                        <div key={i} className="text-center">
                                            <div className="text-lg font-black text-gray-800 tabular-nums leading-none">{v}</div>
                                            <div className="text-[7px] text-gray-400 font-bold tracking-wider mt-0.5">{l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative shrink-0">
                                <ProgressRing pct={progress} r={24} stroke={4} fillColor="#10b981" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-[9px] font-black text-emerald-600">{progress}%</span>
                                    <span className="text-[5px] text-gray-400 uppercase font-bold">Done</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN INVESTOR DASHBOARD                                    */
/* ═══════════════════════════════════════════════════════════ */
export default function InvestorDashboard() {
    const { user } = useAuthStore();
    const [investments, setInvestments] = useState([]);
    const [projects, setProjects]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [profileCompletion, setProfileCompletion] = useState(null);

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

    /* Running investments = reviewing, approved, active */
    const runningInvestments = investments.filter(i => ['reviewing', 'approved', 'active'].includes(i.status));

    const totalInvested    = investments.reduce((acc, i) => acc + (i.amountToInvest || 0), 0);
    const totalExpectedROI = investments.reduce((acc, i) => acc + (i.expectedROI || 0), 0);
    const totalProfit      = totalExpectedROI - totalInvested;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 gap-3">
                <Loader2 size={24} className="animate-spin text-[#de1f25]" />
                <span className="text-gray-500">Loading your portfolio...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ── Profile Completion Banner ─────────────────── */}
            {profileCompletion && profileCompletion.percent < 100 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden relative">
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
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${profileCompletion.percent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: profileCompletion.percent >= 80 ? '#22c55e' : profileCompletion.percent >= 50 ? '#f59e0b' : '#de1f25' }} />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {profileCompletion.checks.filter(c => !c.done).slice(0, 5).map(c => (
                                <Link key={c.key} href="/investor/account-settings"
                                    className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 hover:bg-[#de1f25]/10 hover:text-[#de1f25] text-gray-500 rounded-full transition-colors flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full border border-gray-400" />
                                    {c.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Profile Complete celebration ── */}
            {profileCompletion && profileCompletion.percent === 100 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <p className="text-sm font-semibold text-green-800">Your profile is 100% complete — thank you! 🎉</p>
                </motion.div>
            )}

            {/* ════════════════════════════════════════════ */}
            {/* MOBILE VIEW                                  */}
            {/* ════════════════════════════════════════════ */}
            <div className="lg:hidden space-y-5 pb-20">

                <div className="flex items-center justify-between px-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Running Portfolios ({runningInvestments.length})
                    </div>
                    <Link href="/investor/new-investment"
                        className="flex items-center gap-1 text-[10px] font-bold text-[#de1f25]">
                        <PlusCircle size={12} /> New
                    </Link>
                </div>

                {runningInvestments.length === 0 ? (
                    <div className="bg-gradient-to-br from-orange-950 to-orange-900 rounded-2xl p-6 shadow-lg relative overflow-hidden text-white text-center">
                        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                        <h4 className="font-serif font-bold text-lg mb-2">No Active Portfolio</h4>
                        <p className="text-xs text-orange-200 mb-5 max-w-xs mx-auto leading-relaxed">
                            Create your first land banking portfolio to start generating high-yield returns.
                        </p>
                        <Link href="/investor/new-investment"
                            className="inline-flex items-center justify-center gap-2 bg-white text-orange-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95">
                            Start Investing <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {runningInvestments.map(inv => (
                            <RunningInvestmentCard key={inv._id} inv={inv} onReceiptUploaded={fetchData} />
                        ))}
                    </div>
                )}

                {/* Returns summary */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <TrendingUp className="text-emerald-600" size={18} />
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Expected Net Return (All)</div>
                        <div className="text-base font-black text-gray-800 mt-0.5">₦{totalExpectedROI.toLocaleString()}.00</div>
                    </div>
                </div>

                {/* Account Officer — Mobile */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <UserCheck className="text-orange-800" size={14} />
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Your Account Officer</span>
                    </div>
                    {user?.accountOfficer ? (
                        <div className="space-y-1.5">
                            <p className="font-bold text-gray-900 text-sm">{user.accountOfficer.firstName} {user.accountOfficer.surname}</p>
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
                        </div>
                    )}
                </div>

                {/* Explore Properties */}
                {projects.length > 0 && (
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center px-1">
                            <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Explore Portfolios</div>
                            <Link href="/projects" className="text-[9px] text-primary font-bold">View all</Link>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x" style={{ scrollbarWidth: 'none' }}>
                            {projects.map(proj => (
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
                )}
            </div>

            {/* ════════════════════════════════════════════ */}
            {/* DESKTOP VIEW                                 */}
            {/* ════════════════════════════════════════════ */}
            <div className="hidden lg:block space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h2>
                        <p className="text-gray-500">Here is what is happening with your investments.</p>
                    </div>
                    <Link href="/investor/new-investment"
                        className="flex items-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-[#de1f25]/20 animate-pulse">
                        <PlusCircle size={20} />
                        Start New Investment
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <Wallet size={20} className="text-[#de1f25]" />
                            <h3 className="font-medium">Total Invested</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">₦{totalInvested.toLocaleString()}</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <TrendingUp size={20} className="text-green-600" />
                            <h3 className="font-medium">Expected Returns</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-700">₦{totalExpectedROI.toLocaleString()}</p>
                        <p className="text-sm text-green-600 mt-1 font-medium">+₦{totalProfit.toLocaleString()} profit</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-orange-900 to-orange-800 p-6 rounded-2xl border border-orange-850 shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-700 rounded-full blur-2xl opacity-50" />
                        <h3 className="font-medium text-orange-200 mb-1 relative z-10">Running Portfolios</h3>
                        <p className="text-3xl font-bold relative z-10">{runningInvestments.length}</p>
                    </motion.div>
                </div>

                {/* Running Investment Cards Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Running Investments</h3>
                        <Link href="/investor/history" className="text-sm text-[#de1f25] font-medium hover:underline flex items-center gap-1">
                            View History <ArrowRight size={14} />
                        </Link>
                    </div>

                    {runningInvestments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="text-gray-350" size={32} />
                            </div>
                            <p className="mb-4">You have no active investments yet.</p>
                            <Link href="/investor/new-investment" className="text-[#de1f25] font-medium hover:text-[#b0181d]">
                                Start your first investment →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {runningInvestments.map(inv => (
                                <RunningInvestmentCard key={inv._id} inv={inv} onReceiptUploaded={fetchData} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Two-column: investments table + account officer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* All investments table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">All Investments</h3>
                        </div>
                        {investments.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No investments yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Reference</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Capital</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Duration</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Status</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {investments.map(inv => (
                                            <tr key={inv._id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900">Real Estate Yield Portfolio</p>
                                                    <p className="text-xs text-gray-400 font-mono uppercase">{inv._id.slice(0, 8)}</p>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">₦{inv.amountToInvest?.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-gray-600 font-medium">{inv.durationInMonths} Months</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                                                            ${inv.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                            inv.status === 'approved' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                            inv.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                            inv.status === 'declined' ? 'bg-red-100 text-red-800 border-red-200' :
                                                            'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                                            {inv.status}
                                                        </span>
                                                        {inv.status === 'approved' && inv.paymentReceipt && (
                                                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                                                <Receipt size={10} /> Receipt uploaded
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/investor/investment/${inv._id}`}
                                                        className="inline-flex items-center gap-1 bg-[#de1f25]/10 hover:bg-[#de1f25]/20 text-[#de1f25] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                        <Eye size={14} /> View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Account Officer */}
                    <div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
                                        <a href={`mailto:${user.accountOfficer.email}`}
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#de1f25] transition-colors group">
                                            <Mail size={14} className="text-gray-400 group-hover:text-[#de1f25]" />
                                            <span className="truncate">{user.accountOfficer.email}</span>
                                        </a>
                                        {user.accountOfficer.phoneNumber && (
                                            <a href={`tel:${user.accountOfficer.phoneNumber}`}
                                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#de1f25] transition-colors group">
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
