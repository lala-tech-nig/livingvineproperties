'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, AlertCircle, Eye, Users, UserCheck, Search, Filter,
    Phone, Mail, X, Gift, MapPin, RefreshCw, TrendingUp, Calendar, ChevronDown, Receipt,
    MessageSquare, Send, Loader2
} from 'lucide-react';
import { useRef } from 'react';

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
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [investorsLoading, setInvestorsLoading] = useState(false);

    // Investor registry state
    const [search, setSearch] = useState('');
    const [filterReligion, setFilterReligion] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterState, setFilterState] = useState('');
    const [selectedInvestor, setSelectedInvestor] = useState(null);

    // Support Chat State
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [loadingThreads, setLoadingThreads] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const chatBottomRef = useRef(null);

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
            
            const [invRes, staffRes] = await Promise.all([
                api.get(`/users/investors?${params}`),
                api.get('/users/all').catch(() => ({ data: [] }))
            ]);
            
            setInvestors(invRes.data);
            setStaff(staffRes.data.filter(u => u.role !== 'investor' && u.isActive));
        } catch (e) {
            console.error(e);
        } finally {
            setInvestorsLoading(false);
        }
    }, [filterReligion, filterGender, filterState]);

    const handleAssignOfficer = async (investorId, officerId) => {
        try {
            const { data } = await api.put(`/users/${investorId}/assign-officer`, { officerId });
            setInvestors(prev => prev.map(inv => inv._id === investorId ? { ...inv, accountOfficer: data.user.accountOfficer } : inv));
            toast.success('Account officer assigned successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to assign officer');
        }
    };

    const fetchThreads = useCallback(async () => {
        setLoadingThreads(true);
        try {
            const { data } = await api.get('/support/threads');
            setThreads(data);
        } catch (e) {
            console.error('Failed to fetch threads', e);
        } finally {
            setLoadingThreads(false);
        }
    }, []);

    const fetchChatMessages = useCallback(async (investorId) => {
        setLoadingChat(true);
        try {
            const { data } = await api.get(`/support/messages?investorId=${investorId}`);
            setChatMessages(data);
        } catch (e) {
            console.error('Failed to fetch messages', e);
        } finally {
            setLoadingChat(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'support') {
            fetchThreads();
        }
    }, [activeTab, fetchThreads]);

    useEffect(() => {
        if (selectedThread) {
            fetchChatMessages(selectedThread.investor._id);
            const interval = setInterval(() => {
                api.get(`/support/messages?investorId=${selectedThread.investor._id}`)
                    .then(({ data }) => setChatMessages(data))
                    .catch(console.error);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedThread, fetchChatMessages]);

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedThread) return;
        setSendingReply(true);
        try {
            const { data } = await api.post('/support/messages', {
                message: replyText,
                investorId: selectedThread.investor._id
            });
            setChatMessages(prev => [...prev, data]);
            setReplyText('');
            fetchThreads();
        } catch (err) {
            toast.error('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

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
                    { key: 'support', label: 'Support Messages', icon: MessageSquare },
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
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                                                    ${inv.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    inv.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    inv.status === 'active' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    inv.status === 'declined' ? 'bg-red-100 text-red-800 border-red-200' :
                                                    'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                                    {inv.status.toUpperCase()}
                                                </span>
                                                {inv.status === 'approved' && inv.paymentReceipt && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                                                        <Receipt size={10} /> Receipt attached
                                                    </span>
                                                )}
                                            </div>
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
                                                        <select
                                                            value={inv.accountOfficer?._id || ''}
                                                            onChange={(e) => handleAssignOfficer(inv._id, e.target.value)}
                                                            className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-1.5 outline-none text-gray-800 font-medium focus:ring-1 focus:ring-[#de1f25]/30 max-w-[160px]"
                                                        >
                                                            <option value="">— Unassigned —</option>
                                                            {staff.map(s => (
                                                                <option key={s._id} value={s._id}>
                                                                    {s.firstName} {s.surname} ({s.role})
                                                                </option>
                                                            ))}
                                                        </select>
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

            {/* ── Tab: Support Messages ── */}
            {activeTab === 'support' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[550px] text-gray-900 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    
                    {/* Threads List (Left Column) */}
                    <div className="md:col-span-1 border-r border-gray-100 flex flex-col h-full bg-gray-50/30">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Conversations</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                            {loadingThreads ? (
                                <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-gray-300" /></div>
                            ) : threads.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">No active support chats found.</div>
                            ) : (
                                threads.map(t => {
                                    const isSelected = selectedThread?.investor._id === t.investor._id;
                                    return (
                                        <button
                                            key={t.investor._id}
                                            onClick={() => setSelectedThread(t)}
                                            className={`w-full text-left p-4 transition-all flex items-start gap-3 hover:bg-gray-50 ${isSelected ? 'bg-amber-50/60 border-l-4 border-[#de1f25]' : ''}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#de1f25] to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {t.investor.firstName?.[0]}{t.investor.surname?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h4 className="font-bold text-sm text-gray-900 truncate">{t.investor.firstName} {t.investor.surname}</h4>
                                                    <span className="text-[9px] text-gray-400 shrink-0">{new Date(t.lastActive).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{t.latestMessage}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Active Chat Thread (Right 2 Columns) */}
                    <div className="md:col-span-2 flex flex-col h-full">
                        {selectedThread ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{selectedThread.investor.firstName} {selectedThread.investor.surname}</h3>
                                        <p className="text-xs text-gray-400">{selectedThread.investor.email} · {selectedThread.investor.phoneNumber}</p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/10">
                                    {loadingChat ? (
                                        <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#de1f25]" /></div>
                                    ) : (
                                        chatMessages.map((c, i) => {
                                            const isMe = c.sender?._id === user?.id || c.sender === user?.id;
                                            const senderName = c.sender ? `${c.sender.firstName} ${c.sender.surname}` : 'User';
                                            return (
                                                <div key={c._id || i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-[#de1f25]/10 text-[#de1f25]' : 'bg-gray-100 text-gray-600'}`}>
                                                        {(senderName || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                                                        <span className="text-[9px] text-gray-400">
                                                            {senderName} · {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                            isMe 
                                                                ? 'bg-[#de1f25] text-white rounded-tr-sm' 
                                                                : 'bg-white border border-gray-150 text-gray-800 rounded-tl-sm shadow-sm'
                                                        }`}>
                                                            {c.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatBottomRef} />
                                </div>

                                {/* Input Form */}
                                <form onSubmit={handleSendReply} className="p-4 border-t border-gray-100 bg-white flex gap-3">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 focus:border-[#de1f25] text-sm outline-none bg-gray-50/50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sendingReply || !replyText.trim()}
                                        className="bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-40 text-white px-5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm font-semibold shadow-md shadow-[#de1f25]/10"
                                    >
                                        {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Reply
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                                <MessageSquare size={48} className="mb-3 opacity-20" />
                                <p className="font-semibold">No conversation selected</p>
                                <p className="text-xs mt-1">Select a thread from the left panel to view and reply.</p>
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
