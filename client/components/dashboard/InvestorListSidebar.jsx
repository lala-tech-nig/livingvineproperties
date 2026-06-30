'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Download, User, Briefcase,
    TrendingUp, Loader2, Phone, Mail, MapPin,
    ShieldCheck, AlertCircle, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function InvestorListSidebar({ isOpen, onClose }) {
    const [investors, setInvestors] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActivity, setFilterActivity] = useState('all'); // 'all', 'has-investments', 'no-investments'
    const [filterMaturity, setFilterMaturity] = useState('all'); // 'all', '7d', '30d', '90d', '180d'
    const [capitalPreset, setCapitalPreset] = useState('all'); // 'all', '0-1m', '1m-10m', '10m-50m', '50m+', 'custom'
    const [minCapital, setMinCapital] = useState('');
    const [maxCapital, setMaxCapital] = useState('');

    // Detailed view state
    const [selectedInvestorId, setSelectedInvestorId] = useState(null);
    const [detailTab, setDetailTab] = useState('profile'); // 'profile' or 'portfolios'

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, investmentsRes] = await Promise.all([
                api.get('/users/investors'),
                api.get('/investments')
            ]);
            setInvestors(invRes.data || []);
            setInvestments(investmentsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch sidebar data', error);
            toast.error('Failed to load investor list');
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic investor insights in memory
    const processedInvestors = useMemo(() => {
        return investors.map(investor => {
            const userInvestments = investments.filter(
                inv => inv.user?._id === investor._id || inv.user === investor._id
            );
            
            const activePortfolios = userInvestments.filter(
                inv => ['active', 'approved'].includes(inv.status)
            );
            
            const totalActiveCapital = activePortfolios.reduce(
                (sum, inv) => sum + (inv.amountToInvest || 0), 
                0
            );
            
            const totalCapitalAll = userInvestments.reduce(
                (sum, inv) => sum + (inv.amountToInvest || 0), 
                0
            );

            let nextMaturityDate = null;
            let daysToMaturity = null;
            
            activePortfolios.forEach(inv => {
                if (inv.startDate && inv.durationInMonths) {
                    const start = new Date(inv.startDate);
                    const end = new Date(start.setMonth(start.getMonth() + inv.durationInMonths));
                    const diffTime = end.getTime() - new Date().getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (nextMaturityDate === null || end < nextMaturityDate) {
                        nextMaturityDate = end;
                        daysToMaturity = diffDays;
                    }
                }
            });

            return {
                ...investor,
                investments: userInvestments,
                activePortfolios,
                totalActiveCapital,
                totalCapitalAll,
                activePortfoliosCount: activePortfolios.length,
                totalPortfoliosCount: userInvestments.length,
                nextMaturityDate,
                daysToMaturity
            };
        });
    }, [investors, investments]);

    // Handle Capital Preset changes
    useEffect(() => {
        if (capitalPreset === 'all') {
            setMinCapital('');
            setMaxCapital('');
        } else if (capitalPreset === '0-1m') {
            setMinCapital(0);
            setMaxCapital(1000000);
        } else if (capitalPreset === '1m-10m') {
            setMinCapital(1000000);
            setMaxCapital(10000000);
        } else if (capitalPreset === '10m-50m') {
            setMinCapital(10000000);
            setMaxCapital(50000000);
        } else if (capitalPreset === '50m+') {
            setMinCapital(50000000);
            setMaxCapital('');
        }
    }, [capitalPreset]);

    // Filter investors list
    const filteredInvestors = useMemo(() => {
        return processedInvestors.filter(inv => {
            // Search Query
            const query = searchQuery.trim().toLowerCase();
            if (query) {
                const fullName = `${inv.firstName || ''} ${inv.surname || ''}`.toLowerCase();
                const email = (inv.email || '').toLowerCase();
                const phone = (inv.phoneNumber || '');
                const state = (inv.state || '').toLowerCase();
                
                if (!fullName.includes(query) && !email.includes(query) && !phone.includes(query) && !state.includes(query)) {
                    return false;
                }
            }

            // Current Investments running
            if (filterActivity === 'no-investments' && inv.activePortfoliosCount > 0) {
                return false;
            }
            if (filterActivity === 'has-investments' && inv.activePortfoliosCount === 0) {
                return false;
            }

            // Capital Range Filter
            const min = minCapital === '' ? null : Number(minCapital);
            const max = maxCapital === '' ? null : Number(maxCapital);
            if (min !== null && inv.totalActiveCapital < min) return false;
            if (max !== null && inv.totalActiveCapital > max) return false;

            // Maturity filter
            if (filterMaturity !== 'all') {
                if (inv.daysToMaturity === null) return false;
                const days = inv.daysToMaturity;
                
                if (filterMaturity === '7d' && days > 7) return false;
                if (filterMaturity === '30d' && days > 30) return false;
                if (filterMaturity === '90d' && days > 90) return false;
                if (filterMaturity === '180d' && days > 180) return false;
            }

            return true;
        });
    }, [processedInvestors, searchQuery, filterActivity, minCapital, maxCapital, filterMaturity]);

    const selectedInvestor = useMemo(() => {
        if (!selectedInvestorId) return null;
        return processedInvestors.find(inv => inv._id === selectedInvestorId);
    }, [processedInvestors, selectedInvestorId]);

    // CSV Exporter
    const handleExportCSV = () => {
        if (filteredInvestors.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = [
            'First Name',
            'Surname',
            'Email',
            'Phone',
            'State/Location',
            'Gender',
            'Religion',
            'Active Investments Count',
            'Total Active Capital (NGN)',
            'Total Portfolios (All-Time)',
            'Next Maturity Date',
            'Account Officer'
        ];

        const rows = filteredInvestors.map(inv => [
            inv.firstName || '',
            inv.surname || '',
            inv.email || '',
            inv.phoneNumber ? `="${inv.phoneNumber}"` : '', // escape phone numbers
            inv.state || '',
            inv.gender || '',
            inv.religion || '',
            inv.activePortfoliosCount,
            inv.totalActiveCapital,
            inv.totalPortfoliosCount,
            inv.nextMaturityDate ? new Date(inv.nextMaturityDate).toLocaleDateString() : 'N/A',
            inv.accountOfficer ? `${inv.accountOfficer.firstName} ${inv.accountOfficer.surname}` : 'Unassigned'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(val => {
                if (typeof val === 'string') {
                    return `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `investor_list_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Export downloaded successfully!");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[990]"
                    />

                    {/* Drawer container */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-screen w-full md:w-[600px] bg-slate-900 border-l border-slate-800 shadow-2xl z-[991] flex flex-col text-slate-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#de1f25]/10 flex items-center justify-center text-[#de1f25]">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold tracking-tight">Investor Intelligence Hub</h2>
                                    <p className="text-xs text-slate-400">Advanced demographic filtering & client insights</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Loading Overlay */}
                        {loading && (
                            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50">
                                <Loader2 className="animate-spin text-[#de1f25] mb-3" size={32} />
                                <p className="text-sm text-slate-400 font-medium">Synchronizing records...</p>
                            </div>
                        )}

                        {!loading && !selectedInvestorId && (
                            <>
                                {/* Filter Section */}
                                <div className="p-5 border-b border-slate-800 bg-slate-900/60 space-y-4 shrink-0">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Search by name, email, phone, or state..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-[#de1f25]/50 focus:ring-1 focus:ring-[#de1f25]/50 outline-none text-sm transition-all placeholder:text-slate-500 text-white"
                                        />
                                    </div>

                                    {/* Grid of filters */}
                                    <div className="grid grid-cols-2 gap-3.5">
                                        {/* Status Filter */}
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Investments Status</label>
                                            <select
                                                value={filterActivity}
                                                onChange={e => setFilterActivity(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:border-[#de1f25]/50 outline-none cursor-pointer text-white"
                                            >
                                                <option value="all">All Investors</option>
                                                <option value="has-investments">Active Investments</option>
                                                <option value="no-investments">Zero Active Investments</option>
                                            </select>
                                        </div>

                                        {/* Maturity Due Dates */}
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Maturing Within</label>
                                            <select
                                                value={filterMaturity}
                                                onChange={e => setFilterMaturity(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:border-[#de1f25]/50 outline-none cursor-pointer text-white"
                                            >
                                                <option value="all">Any Timeline</option>
                                                <option value="7d">Next 7 Days</option>
                                                <option value="30d">Next 30 Days</option>
                                                <option value="90d">Next 90 Days</option>
                                                <option value="180d">Next 6 Months</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Capital & Export */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Active Investment Capital</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {[
                                                    { label: 'All Capital', value: 'all' },
                                                    { label: 'Under ₦1M', value: '0-1m' },
                                                    { label: '₦1M - ₦10M', value: '1m-10m' },
                                                    { label: '₦10M - ₦50M', value: '10m-50m' },
                                                    { label: '₦50M+', value: '50m+' },
                                                    { label: 'Custom Range', value: 'custom' }
                                                ].map(preset => (
                                                    <button
                                                        key={preset.value}
                                                        onClick={() => setCapitalPreset(preset.value)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs transition-all font-semibold border ${
                                                            capitalPreset === preset.value
                                                                ? 'bg-[#de1f25] border-[#de1f25] text-white shadow-sm'
                                                                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                                                        }`}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {capitalPreset === 'custom' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="grid grid-cols-2 gap-3"
                                            >
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-semibold">₦</span>
                                                    <input
                                                        type="number"
                                                        value={minCapital}
                                                        onChange={e => setMinCapital(e.target.value)}
                                                        placeholder="Min active capital"
                                                        className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl outline-none text-xs text-white"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-semibold">₦</span>
                                                    <input
                                                        type="number"
                                                        value={maxCapital}
                                                        onChange={e => setMaxCapital(e.target.value)}
                                                        placeholder="Max active capital"
                                                        className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl outline-none text-xs text-white"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-800">
                                            <p className="text-xs text-slate-400 font-medium">
                                                Found <span className="text-white font-bold">{filteredInvestors.length}</span> investor{filteredInvestors.length !== 1 ? 's' : ''}
                                            </p>
                                            <button
                                                onClick={handleExportCSV}
                                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all shadow-md shadow-emerald-950/20"
                                            >
                                                <Download size={14} /> Export CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* List Container */}
                                <div className="flex-1 overflow-y-auto divide-y divide-slate-800 bg-slate-900/20">
                                    {filteredInvestors.length === 0 ? (
                                        <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                                            <User size={36} className="opacity-20 mb-2.5" />
                                            <p className="text-sm font-semibold">No matching investors found</p>
                                            <p className="text-xs text-slate-400 mt-1">Adjust search tags or filter presets.</p>
                                        </div>
                                    ) : (
                                        filteredInvestors.map(inv => {
                                            const initials = `${inv.firstName?.[0] || ''}${inv.surname?.[0] || ''}`;
                                            return (
                                                <button
                                                    key={inv._id}
                                                    onClick={() => {
                                                        setSelectedInvestorId(inv._id);
                                                        setDetailTab('profile');
                                                    }}
                                                    className="w-full text-left p-4 hover:bg-slate-800/40 transition-all flex items-center justify-between gap-4 group"
                                                >
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#de1f25]/80 to-amber-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
                                                            {inv.profileImage ? (
                                                                <img
                                                                    src={inv.profileImage}
                                                                    alt=""
                                                                    className="w-full h-full rounded-full object-cover"
                                                                />
                                                            ) : initials}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                                <h4 className="font-bold text-sm text-slate-200 group-hover:text-white truncate max-w-[150px]">
                                                                    {inv.firstName} {inv.surname}
                                                                </h4>
                                                                {inv.state && (
                                                                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5 whitespace-nowrap">
                                                                        <MapPin size={10} className="shrink-0" />
                                                                        {inv.state}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 truncate mt-0.5">{inv.email}</p>
                                                            <div className="flex gap-2.5 items-center mt-1">
                                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                                                    {inv.activePortfoliosCount} Active
                                                                </span>
                                                                {inv.totalActiveCapital > 0 && (
                                                                    <span className="text-[10px] font-semibold text-emerald-400">
                                                                        ₦{inv.totalActiveCapital.toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {inv.daysToMaturity !== null && inv.daysToMaturity <= 30 && (
                                                            <div className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
                                                                inv.daysToMaturity <= 7
                                                                    ? 'bg-rose-950 border border-rose-800 text-rose-300'
                                                                    : 'bg-amber-950 border border-amber-800 text-amber-300'
                                                            }`}>
                                                                {inv.daysToMaturity <= 0 ? 'Due' : `${inv.daysToMaturity}d left`}
                                                            </div>
                                                        )}
                                                        <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        )}

                        {/* Detailed Profile View */}
                        {!loading && selectedInvestor && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Details Sub-Header */}
                                <div className="p-5 bg-slate-950/60 border-b border-slate-800 shrink-0 flex items-start gap-4">
                                    <button
                                        onClick={() => setSelectedInvestorId(null)}
                                        className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white mt-1 shrink-0"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#de1f25]/80 to-amber-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
                                                {selectedInvestor.profileImage ? (
                                                    <img
                                                        src={selectedInvestor.profileImage}
                                                        alt=""
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : `${selectedInvestor.firstName?.[0] || ''}${selectedInvestor.surname?.[0] || ''}`}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-extrabold text-base text-white truncate">
                                                    {selectedInvestor.firstName} {selectedInvestor.surname}
                                                </h3>
                                                <p className="text-xs text-slate-400 capitalize mt-0.5">
                                                    {selectedInvestor.gender || 'Investor'} · {selectedInvestor.religion || 'Demographic details pending'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contact Action Bar */}
                                        <div className="flex gap-2 mt-4">
                                            <a
                                                href={`mailto:${selectedInvestor.email}`}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-xs font-semibold transition-all text-slate-300"
                                            >
                                                <Mail size={12} /> Email
                                            </a>
                                            {selectedInvestor.phoneNumber && (
                                                <a
                                                    href={`https://wa.me/${selectedInvestor.phoneNumber.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl text-xs font-semibold transition-all"
                                                >
                                                    <Phone size={12} /> WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Navigation */}
                                <div className="flex border-b border-slate-800 bg-slate-950/20 shrink-0">
                                    <button
                                        onClick={() => setDetailTab('profile')}
                                        className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 ${
                                            detailTab === 'profile'
                                                ? 'border-[#de1f25] text-white bg-slate-800/10'
                                                : 'border-transparent text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-1.5 font-bold">
                                            <User size={14} /> Profile & Demographics
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setDetailTab('portfolios')}
                                        className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 ${
                                            detailTab === 'portfolios'
                                                ? 'border-[#de1f25] text-white bg-slate-800/10'
                                                : 'border-transparent text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-1.5 font-bold">
                                            <Briefcase size={14} /> Portfolios ({selectedInvestor.investments?.length || 0})
                                        </div>
                                    </button>
                                </div>

                                {/* Detail Content Panel */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/10">
                                    {detailTab === 'profile' ? (
                                        <div className="space-y-5">
                                            {/* Overview Stats */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Capital</p>
                                                    <p className="text-base font-extrabold text-emerald-400 mt-1">₦{selectedInvestor.totalActiveCapital.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Active Portfolios</p>
                                                    <p className="text-base font-extrabold text-white mt-1">{selectedInvestor.activePortfoliosCount}</p>
                                                </div>
                                            </div>

                                            {/* Details Section */}
                                            <div className="bg-slate-950 border border-slate-800/60 rounded-2xl p-5 space-y-4">
                                                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider pb-2.5 border-b border-slate-800/60">Demographic Data</h4>
                                                
                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="text-slate-500 block mb-1">State of Residence</span>
                                                        <span className="font-semibold text-slate-200">{selectedInvestor.state || 'Pending Profile Setup'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block mb-1">Occupation</span>
                                                        <span className="font-semibold text-slate-200">{selectedInvestor.occupation || 'Pending Profile Setup'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block mb-1">Date of Birth</span>
                                                        <span className="font-semibold text-slate-200">
                                                            {selectedInvestor.dob ? new Date(selectedInvestor.dob).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending Profile Setup'}
                                                        </span>
                                                    </div>
                                                    {selectedInvestor.age && (
                                                        <div>
                                                            <span className="text-slate-500 block mb-1">Age</span>
                                                            <span className="font-semibold text-slate-200">{selectedInvestor.age} years old</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-slate-500 block mb-1">Verification Status</span>
                                                        <span className="font-bold flex items-center gap-1 text-emerald-500">
                                                            <ShieldCheck size={12} /> KYC Completed
                                                        </span>
                                                    </div>
                                                    {selectedInvestor.address && (
                                                        <div className="col-span-2">
                                                            <span className="text-slate-500 block mb-1">Home Address</span>
                                                            <span className="font-semibold text-slate-200 block leading-relaxed">{selectedInvestor.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Assigned Officer */}
                                            {selectedInvestor.accountOfficer ? (
                                                <div className="bg-slate-950 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                                                        {selectedInvestor.accountOfficer.firstName?.[0]}{selectedInvestor.accountOfficer.surname?.[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] uppercase font-bold text-[#de1f25] tracking-wider">Account Officer</p>
                                                        <p className="font-bold text-slate-200 text-xs mt-0.5">
                                                            {selectedInvestor.accountOfficer.firstName} {selectedInvestor.accountOfficer.surname}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                                                            {selectedInvestor.accountOfficer.role} · {selectedInvestor.accountOfficer.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-4 flex items-start gap-3">
                                                    <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={16} />
                                                    <div>
                                                        <p className="text-xs font-bold text-amber-400">No Account Officer Assigned</p>
                                                        <p className="text-[10px] text-amber-300/70 mt-0.5">Assign an account officer through the staff registry panel.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedInvestor.investments?.length === 0 ? (
                                                <div className="p-10 text-center text-slate-500 flex flex-col items-center">
                                                    <Briefcase size={28} className="opacity-20 mb-2" />
                                                    <p className="text-xs font-semibold">No portfolios recorded</p>
                                                </div>
                                            ) : (
                                                selectedInvestor.investments.map(inv => {
                                                    const isMaturing = inv.status === 'active' || inv.status === 'approved';
                                                    
                                                    let maturityLabel = 'N/A';
                                                    if (isMaturing && inv.startDate && inv.durationInMonths) {
                                                        const start = new Date(inv.startDate);
                                                        const end = new Date(start.setMonth(start.getMonth() + inv.durationInMonths));
                                                        maturityLabel = end.toLocaleDateString();
                                                    }
                                                    
                                                    return (
                                                        <div key={inv._id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-3.5">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Invested Amount</p>
                                                                    <p className="text-base font-extrabold text-white mt-0.5">₦{inv.amountToInvest?.toLocaleString()}</p>
                                                                </div>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase border
                                                                    ${inv.status === 'reviewing' ? 'bg-yellow-950 border-yellow-800 text-yellow-300' :
                                                                    inv.status === 'approved' ? 'bg-green-950 border-green-800 text-green-300' :
                                                                    inv.status === 'active' ? 'bg-blue-950 border-blue-800 text-blue-300' :
                                                                    inv.status === 'declined' ? 'bg-rose-950 border-rose-800 text-rose-300' :
                                                                    'bg-slate-900 border-slate-800 text-slate-400'}`}>
                                                                    {inv.status}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/50 text-xs">
                                                                <div>
                                                                    <span className="text-slate-500 block mb-0.5">Duration</span>
                                                                    <span className="font-semibold text-slate-300">{inv.durationInMonths} Months</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500 block mb-0.5">Expected Return (ROI)</span>
                                                                    <span className="font-semibold text-emerald-400">
                                                                        {inv.expectedROI ? `₦${inv.expectedROI.toLocaleString()}` : 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500 block mb-0.5">Start Date</span>
                                                                    <span className="font-semibold text-slate-300">
                                                                        {inv.startDate ? new Date(inv.startDate).toLocaleDateString() : 'Pending Start'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500 block mb-0.5">Maturing Date</span>
                                                                    <span className="font-semibold text-slate-300">{maturityLabel}</span>
                                                                </div>
                                                            </div>

                                                            {/* Actions & Receipt */}
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-500 font-medium">
                                                                    Maturity Action: <span className="text-slate-300 font-bold capitalize">{inv.principalActionAfterMaturity || 'Payout'}</span>
                                                                </span>
                                                                {inv.paymentReceipt && (
                                                                    <a
                                                                        href={inv.paymentReceipt}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex items-center gap-1 text-[#de1f25] hover:text-[#b0181d] font-bold transition-all"
                                                                    >
                                                                        <FileText size={14} /> View Receipt
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
