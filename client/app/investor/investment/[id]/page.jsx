'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
    User, Mail, Phone, MapPin, Briefcase, Clock, TrendingUp,
    CreditCard, Shield, Users, MessageSquare, Send, ChevronLeft,
    CheckCircle, XCircle, RotateCcw, Banknote, Calendar, Hash,
    AlertTriangle, Loader2, Building2, Upload, Receipt, Copy,
    PlayCircle, Eye, ExternalLink
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────── */
const fmt     = (n) => n ? `₦${Number(n).toLocaleString()}` : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const maturityLabel = {
    rollover_all:  'Rollover Capital + ROI',
    withdraw_roi:  'Withdraw ROI, Rollover Capital',
    liquidate_all: 'Liquidate Completely',
};

const STATUS_CONFIG = {
    reviewing:  { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400' },
    approved:   { color: 'bg-blue-100   text-blue-800   border-blue-200',   dot: 'bg-blue-500'  },
    active:     { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
    liquidated: { color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
    declined:   { color: 'bg-red-100    text-red-800    border-red-200',    dot: 'bg-red-500'   },
    retreated:  { color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500'},
};

/* ── small reusable row ──────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, mono = false, sensitive = false }) {
    const [show, setShow] = useState(!sensitive);
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} className="text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5">{label}</p>
                {sensitive && !show ? (
                    <button onClick={() => setShow(true)} className="text-sm text-primary font-medium underline underline-offset-2">
                        Click to reveal
                    </button>
                ) : (
                    <p className={`text-sm font-medium text-gray-800 break-words ${mono ? 'font-mono tracking-widest' : ''}`}>
                        {value || '—'}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ── section card ────────────────────────────────────────── */
function Section({ title, accent = '#de1f25', children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <span className="w-1 h-5 rounded-full" style={{ background: accent }} />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">{title}</h3>
            </div>
            <div className="px-6 pb-2">{children}</div>
        </div>
    );
}

/* ══════════════════ MAIN PAGE ══════════════════════════════ */
export default function InvestmentReviewPage() {
    const { id }     = useParams();
    const router     = useRouter();
    const { user }   = useAuthStore();

    const [inv, setInv]                 = useState(null);
    const [loading, setLoading]         = useState(true);
    const [comments, setComments]       = useState([]);
    const [msg, setMsg]                 = useState('');
    const [sending, setSending]         = useState(false);
    const [uploading, setUploading]     = useState(false);
    const [copied, setCopied]           = useState(false);

    // CEO / Management decision state
    const [newStatus, setNewStatus]             = useState('');
    const [companyAccountId, setCompanyAccountId] = useState('');
    const [companyAccounts, setCompanyAccounts]   = useState([]);
    const [deciding, setDeciding]               = useState(false);

    const commentBottom = useRef(null);
    const fileRef       = useRef(null);

    const isCEO        = user?.role === 'ceo' || user?.role === 'superadmin' || user?.role === 'management';
    const isManagement = user?.role === 'management' || isCEO;
    const isInvestor   = !isManagement;

    /* fetch investment + company accounts */
    useEffect(() => {
        const load = async () => {
            try {
                const requests = [
                    api.get(`/investments/${id}`),
                    api.get(`/comments/${id}`),
                ];
                if (isCEO) {
                    requests.push(api.get('/finance/accounts').catch(() => ({ data: [] })));
                }
                const results  = await Promise.all(requests);
                const invData  = results[0].data;
                const cmtData  = results[1].data;
                setInv(invData);
                setNewStatus(invData.status);
                if (invData.ceoPaymentAccount?.accountId) {
                    setCompanyAccountId(invData.ceoPaymentAccount.accountId);
                }
                setComments(cmtData);
                if (results[2]) setCompanyAccounts(results[2].data || []);
            } catch {
                toast.error('Failed to load investment details');
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id, user?.role]);

    useEffect(() => {
        commentBottom.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    /* Post comment */
    const postComment = async (e) => {
        e.preventDefault();
        if (!msg.trim()) return;
        setSending(true);
        try {
            const { data } = await api.post(`/comments/${id}`, { message: msg });
            setComments(prev => [...prev, data]);
            setMsg('');
        } catch { toast.error('Failed to send message'); }
        finally { setSending(false); }
    };

    /* CEO / Manager: update status */
    const handleDecision = async () => {
        if (!newStatus) return;
        if (isCEO && ['approved'].includes(newStatus) && !companyAccountId) {
            toast.error('Please select a company bank account for the investor to pay into.');
            return;
        }
        setDeciding(true);
        try {
            const payload = { status: newStatus };
            if (isCEO && companyAccountId) payload.companyAccountId = companyAccountId;
            const { data } = await api.put(`/investments/${id}/status`, payload);
            setInv(data);
            toast.success(`Investment status updated to "${newStatus}"`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setDeciding(false);
        }
    };

    /* Manager: start investment directly */
    const handleStartInvestment = async () => {
        setDeciding(true);
        try {
            const { data } = await api.put(`/investments/${id}/status`, { status: 'active' });
            setInv(data);
            toast.success('Investment started! The countdown timer is now active.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start investment');
        } finally {
            setDeciding(false);
        }
    };

    /* Investor: upload payment receipt */
    const handleReceiptUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const form = new FormData();
            form.append('receipt', file);
            const { data } = await api.put(`/investments/${id}/receipt`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setInv(prev => ({ ...prev, paymentReceipt: data.paymentReceipt, receiptUploadedAt: new Date().toISOString() }));
            toast.success('Receipt uploaded! Management will review and start your investment.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload receipt');
        } finally {
            setUploading(false);
        }
    };

    /* Copy account number */
    const copyAccNumber = () => {
        if (!inv?.ceoPaymentAccount?.accountNumber) return;
        navigator.clipboard.writeText(inv.ceoPaymentAccount.accountNumber);
        setCopied(true);
        toast.success('Account number copied!');
        setTimeout(() => setCopied(false), 3000);
    };

    /* ── loading ─────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!inv) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle size={40} className="text-yellow-500" />
                <p className="text-gray-600 font-medium">Investment record not found.</p>
                <button onClick={() => router.back()} className="text-sm text-primary underline">Go Back</button>
            </div>
        );
    }

    const sc = STATUS_CONFIG[inv.status] || STATUS_CONFIG.reviewing;
    const isApproved = inv.status === 'approved';
    const hasReceipt = !!inv.paymentReceipt;

    /* ── render ──────────────────────────────────────────── */
    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">

            {/* ── Page header ── */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                    <ChevronLeft size={22} />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                        Investment Review — {inv.name}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {inv._id}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${sc.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {inv.status}
                </span>
            </div>

            {/* ── Summary banner ── */}
            <div className="bg-gradient-to-r from-[#de1f25] to-orange-600 rounded-2xl p-6 text-white flex flex-wrap gap-6">
                <div>
                    <p className="text-orange-100 text-xs font-medium mb-1">Capital Invested</p>
                    <p className="text-3xl font-black">{fmt(inv.amountToInvest)}</p>
                </div>
                <div>
                    <p className="text-orange-100 text-xs font-medium mb-1">Expected ROI</p>
                    <p className="text-3xl font-black">{fmt(inv.expectedROI)}</p>
                </div>
                <div>
                    <p className="text-orange-100 text-xs font-medium mb-1">Duration</p>
                    <p className="text-3xl font-black">{inv.durationInMonths} <span className="text-xl font-semibold">months</span></p>
                </div>
                <div>
                    <p className="text-orange-100 text-xs font-medium mb-1">Start Date</p>
                    <p className="text-xl font-bold">{fmtDate(inv.startDate)}</p>
                </div>
            </div>

            {/* ── INVESTOR: Payment Account & Receipt Section ── */}
            {isInvestor && isApproved && (
                <div className="space-y-4">
                    {/* Bank details card */}
                    {inv.ceoPaymentAccount?.accountNumber ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Banknote size={18} className="text-blue-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 text-sm">Payment Account</h3>
                                    <p className="text-xs text-blue-600">Transfer your investment amount to this account</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 space-y-3 border border-blue-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 font-medium">Bank Name</span>
                                    <span className="font-bold text-gray-900">{inv.ceoPaymentAccount.bankName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 font-medium">Account Name</span>
                                    <span className="font-bold text-gray-900">{inv.ceoPaymentAccount.accountName}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                    <span className="text-xs text-gray-500 font-medium">Account Number</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-gray-900 text-lg tracking-widest">{inv.ceoPaymentAccount.accountNumber}</span>
                                        <button onClick={copyAccNumber}
                                            className={`p-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-700'}`}>
                                            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-lg px-3 py-2 flex items-center justify-between border border-blue-100">
                                    <span className="text-xs text-blue-700 font-semibold">Amount to Transfer</span>
                                    <span className="font-black text-blue-900 text-sm">{fmt(inv.amountToInvest)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700">
                            Payment account details will be shown here once the CEO assigns a bank account.
                        </div>
                    )}

                    {/* Receipt upload */}
                    <div className={`rounded-2xl border p-5 ${hasReceipt ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'} shadow-sm`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${hasReceipt ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                <Receipt size={18} className={hasReceipt ? 'text-emerald-700' : 'text-gray-500'} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm ${hasReceipt ? 'text-emerald-900' : 'text-gray-900'}`}>Payment Receipt</h3>
                                <p className={`text-xs ${hasReceipt ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {hasReceipt
                                        ? `Uploaded on ${fmtDate(inv.receiptUploadedAt)} · Awaiting activation`
                                        : 'After making the transfer, upload your receipt here'}
                                </p>
                            </div>
                            {hasReceipt && (
                                <a href={inv.paymentReceipt} target="_blank" rel="noreferrer"
                                    className="ml-auto flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline">
                                    View <ExternalLink size={12} />
                                </a>
                            )}
                        </div>
                        {!hasReceipt && inv.ceoPaymentAccount?.accountNumber && (
                            <>
                                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleReceiptUpload} />
                                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                                    className="w-full flex items-center justify-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-md shadow-[#de1f25]/20">
                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {uploading ? 'Uploading...' : 'Attach Payment Receipt'}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-2">Accepted formats: JPG, PNG, PDF</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">

                {/* ── 1. Investor Information ── */}
                <Section title="Investor Information" accent="#de1f25">
                    <InfoRow icon={User}   label="Full Name"       value={inv.name} />
                    <InfoRow icon={Mail}   label="Email Address"   value={inv.email} />
                    <InfoRow icon={Phone}  label="Phone Number"    value={inv.phoneNumber} />
                    <InfoRow icon={MapPin} label="Contact Address" value={inv.contactAddress} />
                </Section>

                {/* ── 2. Investment Plan ── */}
                <Section title="Investment Plan Details" accent="#16a34a">
                    <InfoRow icon={Banknote}   label="Amount to Invest"       value={fmt(inv.amountToInvest)} />
                    <InfoRow icon={TrendingUp} label="Expected Total Returns" value={fmt(inv.expectedROI)} />
                    <InfoRow icon={Clock}      label="Duration"               value={`${inv.durationInMonths} months`} />
                    <InfoRow icon={Calendar}   label="Start Date"             value={fmtDate(inv.startDate)} />
                    <InfoRow icon={RotateCcw}  label="On Maturity"            value={maturityLabel[inv.principalActionAfterMaturity] || inv.principalActionAfterMaturity} />
                </Section>

                {/* ── 3. Identity & KYC ── */}
                <Section title="Identity & KYC" accent="#7c3aed">
                    <InfoRow icon={Hash}   label="NIN" value={inv.nin} mono sensitive />
                    <InfoRow icon={Shield} label="BVN" value={inv.bvn} mono sensitive />
                </Section>

                {/* ── 4. Payout Account ── */}
                <Section title="ROI Domiciliation Account" accent="#0ea5e9">
                    <InfoRow icon={Building2}  label="Bank Name"      value={inv.accountDetails?.bankName} />
                    <InfoRow icon={CreditCard} label="Account Number" value={inv.accountDetails?.accountNumber} mono sensitive />
                    <InfoRow icon={User}       label="Account Name"   value={inv.accountDetails?.accountName} />
                </Section>

                {/* ── 5. Next of Kin ── */}
                <Section title="Next of Kin" accent="#f59e0b">
                    <InfoRow icon={User}   label="Full Name"    value={inv.nextOfKin?.fullName} />
                    <InfoRow icon={Users}  label="Relationship" value={inv.nextOfKin?.relationship} />
                    <InfoRow icon={Phone}  label="Phone Number" value={inv.nextOfKin?.phoneNumber} />
                    <InfoRow icon={MapPin} label="Address"      value={inv.nextOfKin?.address} />
                </Section>

                {/* ── 6. CEO Payment Account ── */}
                {inv.ceoPaymentAccount?.bankName && (
                    <Section title="Company Payment Account (Investor Pays Into)" accent="#de1f25">
                        <InfoRow icon={Building2}  label="Bank Name"      value={inv.ceoPaymentAccount.bankName} />
                        <InfoRow icon={CreditCard} label="Account Number" value={inv.ceoPaymentAccount.accountNumber} mono sensitive />
                        <InfoRow icon={User}       label="Account Name"   value={inv.ceoPaymentAccount.accountName} />
                    </Section>
                )}
            </div>

            {/* ── MANAGEMENT / CEO: Receipt Preview + Start Investment ── */}
            {isManagement && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <Receipt size={16} className="text-[#de1f25]" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Payment Receipt</h3>
                    </div>
                    <div className="p-6">
                        {hasReceipt ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <CheckCircle size={18} />
                                        <p className="font-bold text-sm">Receipt Attached</p>
                                    </div>
                                    <span className="text-xs text-gray-400">Uploaded: {fmtDate(inv.receiptUploadedAt)}</span>
                                </div>
                                {/* Preview */}
                                {inv.paymentReceipt?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                    <img src={inv.paymentReceipt} alt="Payment Receipt"
                                        className="w-full max-h-96 object-contain rounded-xl border border-gray-200 shadow-sm" />
                                ) : (
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                            <Receipt size={20} className="text-red-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">payment_receipt.pdf</p>
                                            <p className="text-xs text-gray-400">PDF Document</p>
                                        </div>
                                        <a href={inv.paymentReceipt} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 bg-[#de1f25] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#b0181d] transition-colors shrink-0">
                                            <ExternalLink size={13} /> Open
                                        </a>
                                    </div>
                                )}

                                {/* Start Investment button — available to both managers & CEO when status=approved */}
                                {isApproved && (
                                    <button onClick={handleStartInvestment} disabled={deciding}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm">
                                        {deciding ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={18} />}
                                        {deciding ? 'Starting Investment...' : '🚀 Start Investment & Begin Countdown'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-6 gap-3 text-center">
                                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                                    <Clock size={22} className="text-amber-500" />
                                </div>
                                <p className="font-semibold text-gray-700 text-sm">No receipt uploaded yet</p>
                                <p className="text-xs text-gray-400 max-w-xs">The investor has not attached a payment receipt. The investment cannot be started until the receipt is uploaded.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── CEO / Management Decision Panel ── */}
            {isManagement && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <Shield size={16} className="text-[#de1f25]" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                            Decision Panel (CEO / Manager)
                        </h3>
                    </div>

                    {/* Manager read-only notice (can still start via receipt panel above) */}
                    {!isCEO && (
                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-amber-900 text-sm">View Only — CEO Action Required</p>
                                    <p className="text-amber-700 text-xs mt-1">Only the CEO can approve, decline, or liquidate investments. Once the investor uploads a receipt, you can start the investment using the panel above.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-1">Current Status</p>
                                    <p className="font-bold capitalize text-gray-900">{inv.status}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-1">Capital</p>
                                    <p className="font-bold text-gray-900">{fmt(inv.amountToInvest)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CEO full panel */}
                    {isCEO && (
                        <div className="p-6 space-y-6">
                            {/* Status selector */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Update Investment Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['reviewing', 'approved', 'active', 'declined', 'retreated', 'liquidated'].map(s => (
                                        <button key={s} onClick={() => setNewStatus(s)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                                                newStatus === s
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'
                                            }`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Company account selector */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Company Account for Investor to Pay Into
                                    <span className="text-gray-400 font-normal ml-2">(investor will see this on approval)</span>
                                </label>
                                {companyAccounts.length === 0 ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                                        No company accounts registered yet. <a href="/crm/ceo/finance" className="font-bold underline">Add one in Finance →</a>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {companyAccounts.map(acc => (
                                            <button key={acc._id} type="button" onClick={() => setCompanyAccountId(acc._id)}
                                                className={`text-left p-4 rounded-xl border transition-all ${
                                                    companyAccountId === acc._id
                                                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200'
                                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                }`}>
                                                <p className="font-bold text-sm text-gray-900">{acc.bankName}</p>
                                                <p className="font-mono text-xs text-gray-500 tracking-widest mt-0.5">{acc.accountNumber}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{acc.accountName}</p>
                                                <p className="text-xs font-bold text-green-700 mt-1">Bal: ₦{acc.balance?.toLocaleString()}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={handleDecision} disabled={deciding || newStatus === inv.status}
                                className="flex items-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#de1f25]/20">
                                {deciding ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                {deciding ? 'Saving Decision...' : 'Save Decision'}
                            </button>

                            {newStatus === inv.status && (
                                <p className="text-xs text-gray-400">Select a different status above to enable saving.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Comments / Messaging ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <MessageSquare size={16} className="text-gray-400" />
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Internal Notes & Messages</h3>
                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">{comments.length}</span>
                </div>

                <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">No messages yet. Start the conversation.</p>
                    ) : comments.map((c, i) => {
                        const sender = c.userId || c.author;
                        const isMe = sender?._id === user?._id || c.authorName === `${user?.firstName} ${user?.surname}`;
                        const displayName = sender ? `${sender.firstName} ${sender.surname}` : (c.authorName || 'Unknown');
                        const displayMessage = c.message || c.text;
                        return (
                            <div key={c._id || i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                                    {(displayName || 'U')[0].toUpperCase()}
                                </div>
                                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    <p className={`text-xs text-gray-400 ${isMe ? 'text-right' : ''}`}>
                                        {displayName} · {fmtDate(c.createdAt)}
                                    </p>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                        {displayMessage}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={commentBottom} />
                </div>

                <form onSubmit={postComment} className="px-6 pb-6 pt-2 flex gap-3">
                    <input type="text" value={msg} onChange={e => setMsg(e.target.value)}
                        placeholder="Add a note or message..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 text-sm outline-none bg-gray-50" />
                    <button type="submit" disabled={sending || !msg.trim()}
                        className="bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
