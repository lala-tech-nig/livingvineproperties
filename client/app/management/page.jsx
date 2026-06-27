'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, AlertCircle, Eye, Users, UserCheck, Search, Filter,
    Phone, Mail, X, Gift, MapPin, RefreshCw, TrendingUp, Calendar, ChevronDown
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAnniversaryInfo(dateStr) {
    if (!dateStr) return null;
    const joined = new Date(dateStr);
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), joined.getMonth(), joined.getDate());
    if (thisYear < now) thisYear.setFullYear(now.getFullYear() + 1);
    const daysLeft = Math.ceil((thisYear - now) / (1000 * 60 * 60 * 24));
    const years = now.getFullYear() - joined.getFullYear() + (thisYear.getFullYear() > now.getFullYear() ? 0 : 1);
    return { daysLeft, years };
}

// ─── Investor Detail Modal ────────────────────────────────────────────────────
function InvestorModal({ investor, onClose }) {
    const ann = getAnniversaryInfo(investor.createdAt);
    const initials = `${investor.firstName?.[0] || ''}${investor.surname?.[0] || ''}`;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#de1f25] to-orange-700 p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-2xl">
                            {initials}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{investor.firstName} {investor.surname}</h3>
                            <p className="text-orange-200 text-sm">
                                {investor.gender ? <span className="capitalize">{investor.gender}</span> : 'Investor'}
                                {investor.religion ? <span className="capitalize"> · {investor.religion}</span> : ''}
                                {investor.state ? <span> · {investor.state}</span> : ''}
                            </p>
                            <span className={`mt-1.5 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${investor.isActive ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                                {investor.isActive ? '● Active' : '● Suspended'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Anniversary Alert */}
                    {ann && (
                        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${ann.daysLeft === 0 ? 'bg-amber-50 border-amber-300' : ann.daysLeft <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                            <Gift size={20} className={ann.daysLeft <= 30 ? 'text-amber-500' : 'text-gray-400'} />
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Investment Anniversary</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    Year {ann.years} milestone · {ann.daysLeft === 0 ? '🎉 Today! Send a celebration message!' : `${ann.daysLeft} day${ann.daysLeft !== 1 ? 's' : ''} away`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Date Joined</p>
                            <p className="font-semibold text-gray-900 text-sm">{new Date(investor.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        {investor.age && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Age</p>
                                <p className="font-semibold text-gray-900 text-sm">{investor.age} years old</p>
                            </div>
                        )}
                        {investor.state && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-medium mb-0.5">State</p>
                                <p className="font-semibold text-gray-900 text-sm">{investor.state}</p>
                            </div>
                        )}
                        {investor.idNumber && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-medium mb-0.5">ID Number</p>
                                <p className="font-semibold text-gray-900 text-sm">{investor.idNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* Account Officer */}
                    {investor.accountOfficer && (
                        <div className="border border-gray-100 rounded-2xl p-4">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Account Officer</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#de1f25] to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                                    {investor.accountOfficer.firstName?.[0]}{investor.accountOfficer.surname?.[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{investor.accountOfficer.firstName} {investor.accountOfficer.surname}</p>
                                    <p className="text-xs text-gray-500 capitalize">{investor.accountOfficer.role} · {investor.accountOfficer.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Actions */}
                    <div className="flex gap-3">
                        <a href={`mailto:${investor.email}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Mail size={16} className="text-gray-400" /> Email
                        </a>
                        {investor.phoneNumber && (
                            <a href={`https://wa.me/${investor.phoneNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-semibold text-white transition-colors">
                                <Phone size={16} /> WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function ManagementDashboard() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('investments');
    const [investments, setInvestments] = useState([]);
    const [investors, setInvestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [investorsLoading, setInvestorsLoading] = useState(false);

    // Investor registry state
    const [search, setSearch] = useState('');
    const [filterReligion, setFilterReligion] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterState, setFilterState] = useState('');
    const [selectedInvestor, setSelectedInvestor] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const { data } = await api.get('/investments');
                setInvestments(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const fetchInvestors = useCallback(async () => {
        setInvestorsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterReligion) params.set('religion', filterReligion);
            if (filterGender) params.set('gender', filterGender);
            if (filterState) params.set('state', filterState);
            const { data } = await api.get(`/users/investors?${params}`);
            setInvestors(data);
        } catch (e) {
            console.error(e);
        } finally {
            setInvestorsLoading(false);
        }
    }, [filterReligion, filterGender, filterState]);

    useEffect(() => {
        if (activeTab === 'investors') fetchInvestors();
    }, [activeTab, fetchInvestors]);

    const reviewingCount = investments.filter(i => i.status === 'reviewing').length;

    // Client-side search filter
    const filteredInvestors = investors.filter(inv =>
        `${inv.firstName} ${inv.surname} ${inv.email} ${inv.state || ''} ${inv.phoneNumber || ''}`.toLowerCase().includes(search.toLowerCase())
    );

    // Anniversary alerts
    const upcomingAnniversaries = investors.filter(inv => {
        const ann = getAnniversaryInfo(inv.createdAt);
        return ann && ann.daysLeft <= 30;
    });

    if (loading) return <div className="p-10 text-center text-white">Loading management terminal...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Management Overview</h2>
                    <p className="text-gray-400">Monitor investments and manage the full investor registry.</p>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-yellow-200 shadow-sm text-gray-900">
                    <div className="flex items-center gap-3 mb-2 text-yellow-600"><AlertCircle size={20} /><h3 className="font-medium">Pending Reviews</h3></div>
                    <p className="text-3xl font-bold">{reviewingCount}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-gray-900">
                    <div className="flex items-center gap-3 mb-2 text-gray-500"><Briefcase size={20} className="text-[#de1f25]" /><h3 className="font-medium">Total Portfolios</h3></div>
                    <p className="text-3xl font-bold">{investments.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-gray-900">
                    <div className="flex items-center gap-3 mb-2 text-gray-500"><Users size={20} className="text-purple-500" /><h3 className="font-medium">Registered Investors</h3></div>
                    <p className="text-3xl font-bold">{investors.length > 0 ? investors.length : '—'}</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm text-gray-900">
                    <div className="flex items-center gap-3 mb-2 text-amber-600"><Gift size={20} /><h3 className="font-medium">Anniversaries (30d)</h3></div>
                    <p className="text-3xl font-bold text-amber-600">{upcomingAnniversaries.length > 0 ? upcomingAnniversaries.length : '—'}</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-white/10 p-1 rounded-xl w-fit">
                {[
                    { key: 'investments', label: 'Investment Portfolios', icon: TrendingUp },
                    { key: 'investors', label: 'Investor Registry', icon: Users },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'}`}>
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Investments ── */}
            {activeTab === 'investments' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">All Client Investments</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                                    <th className="px-6 py-4 font-semibold">Investor Name</th>
                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investments.map(inv => (
                                    <tr key={inv._id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${inv.status === 'reviewing' ? 'bg-yellow-50/40' : ''}`}>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{inv.name}</p>
                                            <p className="text-xs text-gray-500">{inv.email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">₦{inv.amountToInvest?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                                                ${inv.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                inv.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                inv.status === 'active' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                inv.status === 'declined' ? 'bg-red-100 text-red-800 border-red-200' :
                                                'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                                {inv.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/investor/investment/${inv._id}`}
                                                className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl transition-colors ${inv.status === 'reviewing' ? 'bg-[#de1f25] text-white hover:bg-[#b0181d]' : 'text-[#de1f25] hover:text-orange-800 bg-[#de1f25]/10 hover:bg-[#de1f25]/20'}`}>
                                                <Eye size={16} /> Inspect
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Tab: Investor Registry ── */}
            {activeTab === 'investors' && (
                <div className="space-y-4">
                    {/* Anniversary Banner */}
                    {upcomingAnniversaries.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-900/30 border border-amber-700/40 rounded-2xl p-4 flex items-start gap-3">
                            <Gift className="text-amber-400 shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <p className="text-amber-300 font-bold text-sm">🎉 {upcomingAnniversaries.length} investor anniversar{upcomingAnniversaries.length > 1 ? 'ies' : 'y'} within 30 days</p>
                                <div className="flex flex-wrap gap-2 mt-1.5">
                                    {upcomingAnniversaries.slice(0, 4).map(inv => {
                                        const ann = getAnniversaryInfo(inv.createdAt);
                                        return (
                                            <button key={inv._id} onClick={() => setSelectedInvestor(inv)}
                                                className="text-xs bg-amber-800/40 text-amber-200 hover:bg-amber-700/50 px-2 py-0.5 rounded-full transition-colors">
                                                {inv.firstName} {inv.surname} — {ann?.daysLeft === 0 ? 'Today! 🎉' : `${ann?.daysLeft}d`}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                        <div className="flex-1 min-w-48 relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone, state..."
                                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#de1f25]/20 text-gray-700" />
                        </div>
                        <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none text-gray-700 bg-white">
                            <option value="">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <select value={filterReligion} onChange={e => setFilterReligion(e.target.value)}
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none text-gray-700 bg-white">
                            <option value="">All Religions</option>
                            <option value="muslim">Muslim</option>
                            <option value="christian">Christian</option>
                            <option value="other">Other</option>
                        </select>
                        <input value={filterState} onChange={e => setFilterState(e.target.value)} placeholder="Filter by state..."
                            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none text-gray-700 w-36" />
                        <button onClick={fetchInvestors} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#de1f25] hover:bg-[#b0181d] text-white rounded-xl text-sm font-semibold transition-colors">
                            <Filter size={14} /> Apply
                        </button>
                        {(filterGender || filterReligion || filterState) && (
                            <button onClick={() => { setFilterGender(''); setFilterReligion(''); setFilterState(''); }}
                                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                <X size={12} /> Clear
                            </button>
                        )}
                        <span className="ml-auto text-xs text-gray-400 font-medium">{filteredInvestors.length} investor{filteredInvestors.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
                        {investorsLoading ? (
                            <div className="p-10 text-center"><RefreshCw size={24} className="animate-spin mx-auto text-gray-300 mb-3" /><p className="text-gray-400 text-sm">Loading investor registry...</p></div>
                        ) : filteredInvestors.length === 0 ? (
                            <div className="p-12 text-center"><Users size={40} className="mx-auto mb-3 text-gray-200" /><p className="text-gray-400 font-medium">No investors found</p></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-5 py-3.5">Investor</th>
                                            <th className="px-5 py-3.5">Demographics</th>
                                            <th className="px-5 py-3.5">Account Officer</th>
                                            <th className="px-5 py-3.5">Date Joined</th>
                                            <th className="px-5 py-3.5">Anniversary</th>
                                            <th className="px-5 py-3.5">Status</th>
                                            <th className="px-5 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredInvestors.map(inv => {
                                            const ann = getAnniversaryInfo(inv.createdAt);
                                            return (
                                                <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#de1f25] to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                                {inv.firstName?.[0]}{inv.surname?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 text-sm">{inv.firstName} {inv.surname}</p>
                                                                <p className="text-xs text-gray-400">{inv.email}</p>
                                                                {inv.phoneNumber && <p className="text-xs text-gray-400">{inv.phoneNumber}</p>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex flex-wrap gap-1">
                                                            {inv.gender && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium capitalize">{inv.gender}</span>}
                                                            {inv.religion && <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium capitalize">{inv.religion}</span>}
                                                            {inv.state && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium"><MapPin size={8} className="inline mr-0.5" />{inv.state}</span>}
                                                            {inv.age && <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-medium">{inv.age}y</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {inv.accountOfficer ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[9px] font-bold">
                                                                    {inv.accountOfficer.firstName?.[0]}{inv.accountOfficer.surname?.[0]}
                                                                </div>
                                                                <span className="text-xs text-gray-600">{inv.accountOfficer.firstName} {inv.accountOfficer.surname}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-300 italic">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                                                        <div>
                                                            <p className="font-medium text-gray-700">{new Date(inv.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                            <p className="text-gray-400 text-[10px]">{Math.floor((Date.now() - new Date(inv.createdAt)) / (1000*60*60*24*365))}y {Math.floor(((Date.now() - new Date(inv.createdAt)) % (1000*60*60*24*365)) / (1000*60*60*24*30))}m ago</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {ann && (
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ann.daysLeft === 0 ? 'bg-amber-200 text-amber-800' : ann.daysLeft <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                {ann.daysLeft === 0 ? '🎉 Today!' : ann.daysLeft <= 7 ? `⏰ ${ann.daysLeft}d` : ann.daysLeft <= 30 ? `🔔 ${ann.daysLeft}d` : `${ann.daysLeft}d`}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${inv.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {inv.isActive ? 'Active' : 'Suspended'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button onClick={() => setSelectedInvestor(inv)}
                                                                className="text-xs font-semibold text-[#de1f25] bg-[#de1f25]/10 hover:bg-[#de1f25]/20 px-3 py-1.5 rounded-lg transition-colors">
                                                                View Info
                                                            </button>
                                                            <a href={`mailto:${inv.email}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Mail size={14} /></a>
                                                            {inv.phoneNumber && (
                                                                <a href={`https://wa.me/${inv.phoneNumber.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer"
                                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Phone size={14} /></a>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedInvestor && <InvestorModal investor={selectedInvestor} onClose={() => setSelectedInvestor(null)} />}
            </AnimatePresence>
        </div>
    );
}
