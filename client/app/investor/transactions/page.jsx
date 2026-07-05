'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import {
    Receipt, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle,
    ChevronDown, ChevronUp, ArrowUpRight, Calendar, Banknote, Filter,
    RefreshCw, Building2
} from 'lucide-react';

const STATUS_CONFIG = {
    reviewing: { label: 'Under Review',  color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: Clock,         dot: 'bg-amber-400' },
    approved:  { label: 'Approved',      color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle2,  dot: 'bg-blue-400' },
    active:    { label: 'Active',        color: 'bg-green-100 text-green-700 border-green-200',    icon: TrendingUp,    dot: 'bg-green-400' },
    declined:  { label: 'Declined',      color: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle,       dot: 'bg-red-400' },
    liquidated:{ label: 'Liquidated',    color: 'bg-purple-100 text-purple-700 border-purple-200', icon: ArrowUpRight,  dot: 'bg-purple-400' },
    retreated: { label: 'Retreated',     color: 'bg-gray-100 text-gray-600 border-gray-200',       icon: AlertCircle,   dot: 'bg-gray-400' },
};

function formatCurrency(amount) {
    return `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getMaturityDate(investment) {
    if (!investment.startDate || !investment.durationInMonths) return null;
    const d = new Date(investment.startDate);
    d.setMonth(d.getMonth() + investment.durationInMonths);
    return d;
}

function StatusTimeline({ investment }) {
    const ORDER = ['reviewing', 'approved', 'active', 'liquidated'];
    const currentIdx = ORDER.indexOf(investment.status);

    return (
        <div className="flex items-center gap-1.5 mt-4">
            {ORDER.map((s, i) => {
                const cfg = STATUS_CONFIG[s];
                const isReached = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                    <div key={s} className="flex items-center gap-1.5 flex-1">
                        <div className={`flex flex-col items-center gap-1 flex-1`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                                ${isCurrent ? `${cfg.dot} text-white shadow-md scale-110` : isReached ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                                {i + 1}
                            </div>
                            <span className={`text-[8px] font-semibold uppercase tracking-wide leading-tight text-center ${isCurrent ? 'text-gray-700' : isReached ? 'text-green-600' : 'text-gray-300'}`}>
                                {cfg.label}
                            </span>
                        </div>
                        {i < ORDER.length - 1 && (
                            <div className={`h-0.5 w-6 rounded-full transition-all ${isReached && i < currentIdx ? 'bg-green-400' : 'bg-gray-100'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function InvestmentCard({ investment }) {
    const [expanded, setExpanded] = useState(false);
    const cfg = STATUS_CONFIG[investment.status] || STATUS_CONFIG.reviewing;
    const StatusIcon = cfg.icon;
    const maturity = getMaturityDate(investment);

    return (
        <motion.div
            layout
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Card Header */}
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color.split(' ')[0]}`}>
                            <StatusIcon size={18} className={cfg.color.split(' ')[1]} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{investment.name || 'Investment'}</p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Calendar size={10} /> {formatDate(investment.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="font-black text-gray-900 text-sm">{formatCurrency(investment.amountToInvest)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                            {cfg.label}
                        </span>
                    </div>
                </div>

                {/* Quick stats row */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[10px] text-gray-400 font-medium">Duration</p>
                        <p className="text-xs font-bold text-gray-700">{investment.durationInMonths || '—'}mo</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[10px] text-gray-400 font-medium">Expected ROI</p>
                        <p className="text-xs font-bold text-green-600">{formatCurrency(investment.expectedROI)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[10px] text-gray-400 font-medium">Matures</p>
                        <p className="text-xs font-bold text-gray-700">{maturity ? formatDate(maturity) : '—'}</p>
                    </div>
                </div>

                {/* Expand toggle */}
                <div className="flex justify-center mt-2">
                    <div className={`text-gray-300 transition-transform ${expanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-gray-100 p-4 space-y-4">
                            {/* Status Timeline */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Investment Progress</p>
                                <StatusTimeline investment={investment} />
                            </div>

                            {/* Details Table */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Transaction Details</p>
                                <div className="space-y-2 text-sm">
                                    {[
                                        { label: 'Investment ID', value: investment._id?.slice(-8).toUpperCase() },
                                        { label: 'Principal Amount', value: formatCurrency(investment.amountToInvest) },
                                        { label: 'Expected Return', value: formatCurrency(investment.expectedROI), highlight: true },
                                        { label: 'Duration', value: `${investment.durationInMonths} months` },
                                        { label: 'Start Date', value: formatDate(investment.startDate) },
                                        { label: 'Maturity Date', value: maturity ? formatDate(maturity) : '—' },
                                        { label: 'After Maturity', value: investment.principalActionAfterMaturity || '—' },
                                        { label: 'Payment Receipt', value: investment.paymentReceipt ? '✅ Uploaded' : '⏳ Not yet uploaded' },
                                    ].map(({ label, value, highlight }) => (
                                        <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                                            <span className="text-gray-500 text-xs">{label}</span>
                                            <span className={`font-semibold text-xs ${highlight ? 'text-green-600' : 'text-gray-800'}`}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bank Account */}
                            {investment.accountDetails?.bankName && (
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                        <Banknote size={12} /> Returns Account
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">{investment.accountDetails.accountName}</p>
                                    <p className="text-xs text-gray-500">{investment.accountDetails.bankName} · {investment.accountDetails.accountNumber}</p>
                                </div>
                            )}

                            {/* CEO Payment Account (if approved) */}
                            {investment.ceoPaymentAccount?.bankName && (
                                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                    <p className="text-xs font-bold text-blue-600 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                        <Building2 size={12} /> Pay Investment To
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">{investment.ceoPaymentAccount.accountName}</p>
                                    <p className="text-xs text-gray-500">{investment.ceoPaymentAccount.bankName} · {investment.ceoPaymentAccount.accountNumber}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function TransactionsPage() {
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const fetchInvestments = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const { data } = await api.get('/investments/my');
            setInvestments(data || []);
        } catch (err) {
            console.error('Error loading transactions:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchInvestments(); }, []);

    const filtered = filter === 'all' ? investments : investments.filter(i => i.status === filter);

    const totalInvested = investments.reduce((sum, i) => sum + (i.amountToInvest || 0), 0);
    const totalROI = investments.filter(i => i.status === 'active' || i.status === 'approved').reduce((sum, i) => sum + (i.expectedROI || 0), 0);
    const activeCount = investments.filter(i => i.status === 'active').length;

    const FILTER_TABS = [
        { key: 'all',        label: 'All' },
        { key: 'reviewing',  label: 'Reviewing' },
        { key: 'approved',   label: 'Approved' },
        { key: 'active',     label: 'Active' },
        { key: 'liquidated', label: 'Liquidated' },
    ];

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-3 border-[#de1f25]/20 border-t-[#de1f25] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Loading transactions...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-gray-900">Transactions</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Your complete investment history</p>
                </div>
                <button
                    onClick={() => fetchInvestments(true)}
                    disabled={refreshing}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-[#de1f25] to-orange-500 rounded-2xl p-4 text-white">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Total Invested</p>
                    <p className="text-lg font-black leading-tight">₦{(totalInvested / 1000000).toFixed(1)}M</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{investments.length} investment{investments.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl p-4 text-white">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Expected ROI</p>
                    <p className="text-lg font-black leading-tight">₦{(totalROI / 1000000).toFixed(1)}M</p>
                    <p className="text-[10px] opacity-70 mt-0.5">Active plans</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-400 rounded-2xl p-4 text-white">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Active</p>
                    <p className="text-lg font-black leading-tight">{activeCount}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">Running now</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {FILTER_TABS.map(tab => {
                    const count = tab.key === 'all' ? investments.length : investments.filter(i => i.status === tab.key).length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                                filter === tab.key
                                    ? 'bg-[#de1f25] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === tab.key ? 'bg-white/20' : 'bg-gray-200'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Investment List */}
            <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Receipt size={28} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No {filter !== 'all' ? filter : ''} transactions found</p>
                        <p className="text-gray-400 text-sm mt-1">Your investments will appear here</p>
                    </motion.div>
                ) : (
                    <motion.div key="list" className="space-y-3">
                        {filtered.map((inv, i) => (
                            <motion.div
                                key={inv._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <InvestmentCard investment={inv} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
