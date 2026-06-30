'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Link from 'next/link';
import InvestorListSidebar from '@/components/dashboard/InvestorListSidebar';
import { motion } from 'framer-motion';
import {
    TrendingUp, Users, CheckCircle, Clock, XCircle, Landmark,
    MessageSquare, Bell, ArrowRight, BarChart3, DollarSign,
    RefreshCw, UserCheck, ShieldAlert, Receipt, Send, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_COLOR = {
    reviewing:  'bg-yellow-100 text-yellow-800',
    approved:   'bg-green-100 text-green-800',
    active:     'bg-blue-100 text-blue-800',
    declined:   'bg-red-100 text-red-800',
    retreated:  'bg-orange-100 text-orange-800',
    liquidated: 'bg-purple-100 text-purple-800',
};

export default function CEODashboard() {
    const { user } = useAuthStore();
    const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'support'
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [investments, setInvestments] = useState([]);
    const [accounts, setAccounts]       = useState([]);
    const [staff, setStaff]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [notifications, setNotifications] = useState([]);

    // Support Chat State
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [loadingThreads, setLoadingThreads] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const chatBottomRef = useRef(null);

    useEffect(() => { fetchAll(); }, []);

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
        if (viewMode === 'support') {
            fetchThreads();
        }
    }, [viewMode, fetchThreads]);

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

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [invRes, accRes, notifRes] = await Promise.all([
                api.get('/investments'),
                api.get('/finance/accounts').catch(() => ({ data: [] })),
                api.get('/notifications/all').catch(() => ({ data: [] })),
            ]);
            setInvestments(invRes.data);
            setAccounts(accRes.data);
            setNotifications(notifRes.data.slice(0, 5));
        } catch (e) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const totalApprovedCapital = investments
        .filter(i => ['approved', 'active', 'liquidated'].includes(i.status))
        .reduce((a, b) => a + (b.amountToInvest || 0), 0);

    const totalCompanyBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const pendingApprovals    = investments.filter(i => i.status === 'reviewing');
    const activeInvestments   = investments.filter(i => i.status === 'active' || i.status === 'approved');

    const statCards = [
        { label: 'Total Capital (Approved)', value: `₦${totalApprovedCapital.toLocaleString()}`, icon: TrendingUp, color: 'from-indigo-900 to-indigo-700', textColor: 'text-indigo-200' },
        { label: 'Company Bank Balance',      value: `₦${totalCompanyBalance.toLocaleString()}`,  icon: Landmark,   color: 'from-emerald-900 to-emerald-700', textColor: 'text-emerald-200' },
        { label: 'Total Portfolios',          value: investments.length,                           icon: BarChart3,  color: 'from-gray-800 to-gray-700', textColor: 'text-gray-400', white: true },
        { label: 'Pending Approvals',         value: pendingApprovals.length,                      icon: Clock,      color: 'from-amber-600 to-amber-500', textColor: 'text-amber-100' },
    ];

    const quickLinks = [
        { label: 'Finance & Accounts', href: '/crm/ceo/finance',        icon: Landmark,      desc: 'Manage company bank accounts' },
        { label: 'Company CRM',        href: '/crm/ceo/crm',            icon: Users,         desc: 'View all investors & customers' },
        { label: 'WhatsApp Hub',       href: '/crm/ceo/whatsapp',       icon: MessageSquare, desc: 'Team messaging & contacts' },
        { label: 'Team Management',    href: '/crm/ceo/team',           icon: UserCheck,     desc: 'Staff accounts & performance' },
        { label: 'Notifications',      href: '/crm/ceo/notifications',  icon: Bell,          desc: 'System-wide alerts & updates' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center py-32 gap-3">
            <RefreshCw size={24} className="animate-spin text-[#de1f25]" />
            <span className="text-white font-medium">Loading CEO terminal...</span>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Greeting & View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">CEO Executive Terminal</h2>
                    <p className="text-gray-400 mt-1">Welcome back, {user?.firstName}. Here's the platform at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)}
                        className="bg-[#de1f25] hover:bg-[#b0181d] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#de1f25]/10 flex items-center gap-1.5 shrink-0">
                        <Users size={14} /> Investor Insights
                    </button>
                    <div className="flex bg-white/15 p-1 rounded-xl w-fit shrink-0 border border-white/10">
                        <button onClick={() => setViewMode('overview')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'}`}>
                            Overview
                        </button>
                        <button onClick={() => setViewMode('support')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'support' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'}`}>
                            Support Messages
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'overview' ? (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((c, i) => (
                            <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className={`bg-gradient-to-br ${c.color} p-6 rounded-2xl text-white shadow-lg relative overflow-hidden`}>
                                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                                <div className={`flex items-center gap-2 mb-3 ${c.textColor}`}>
                                    <c.icon size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{c.label}</span>
                                </div>
                                <p className="text-3xl font-black relative z-10">{c.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Two-column: Pending Approvals + Quick Links */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Pending Approvals Table — 2/3 width */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert size={18} className="text-amber-500" />
                                    <h3 className="font-bold text-gray-900">Pending Approvals</h3>
                                    {pendingApprovals.length > 0 && (
                                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{pendingApprovals.length}</span>
                                    )}
                                </div>
                                <Link href="/crm/ceo" className="text-xs text-[#de1f25] font-bold hover:underline flex items-center gap-1">
                                    All portfolios <ArrowRight size={12} />
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                {pendingApprovals.length === 0 ? (
                                    <div className="py-12 text-center text-gray-400">
                                        <CheckCircle size={32} className="mx-auto mb-2 text-green-300" />
                                        <p className="text-sm font-medium">No pending approvals</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-gray-900 text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold">Investor</th>
                                                <th className="px-5 py-3 font-semibold">Capital</th>
                                                <th className="px-5 py-3 font-semibold">Duration</th>
                                                <th className="px-5 py-3 text-right font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingApprovals.slice(0, 8).map(inv => (
                                                <tr key={inv._id} className="border-t border-gray-50 hover:bg-amber-50/40 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <p className="font-bold">{inv.name}</p>
                                                        <p className="text-xs text-gray-400">{inv.email}</p>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <p className="font-bold text-gray-900">₦{inv.amountToInvest?.toLocaleString()}</p>
                                                        {inv.paymentReceipt && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                                                                <Receipt size={10} /> Receipt attached
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-500">{inv.durationInMonths}m</td>
                                                    <td className="px-5 py-3 text-right">
                                                        <Link href={`/investor/investment/${inv._id}`}
                                                            className="bg-[#de1f25] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#b0181d] transition-colors">
                                                            Review →
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Quick Links — 1/3 width */}
                        <div className="space-y-3">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wider px-1">Quick Access</h3>
                            {quickLinks.map((ql, i) => (
                                <motion.div key={ql.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                                    <Link href={ql.href}
                                        className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all group">
                                        <div className="w-10 h-10 bg-[#de1f25]/10 rounded-xl flex items-center justify-center shrink-0">
                                            <ql.icon size={18} className="text-[#de1f25]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white group-hover:text-[#de1f25] transition-colors">{ql.label}</p>
                                            <p className="text-xs text-gray-500">{ql.desc}</p>
                                        </div>
                                        <ArrowRight size={14} className="text-gray-500 group-hover:text-[#de1f25] transition-colors shrink-0" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* All Portfolios table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">All Investment Portfolios</h3>
                            <span className="text-xs text-gray-400">{investments.length} total</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-gray-900 text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Investor</th>
                                        <th className="px-5 py-3 font-semibold">Capital</th>
                                        <th className="px-5 py-3 font-semibold">Duration</th>
                                        <th className="px-5 py-3 font-semibold">Status</th>
                                        <th className="px-5 py-3 text-right font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {investments.map(inv => (
                                        <tr key={inv._id} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${inv.status === 'reviewing' ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-5 py-3">
                                                <p className="font-bold">{inv.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{inv._id.slice(-6).toUpperCase()}</p>
                                                <p className="text-xs text-gray-400">{inv.email}</p>
                                            </td>
                                            <td className="px-5 py-3 font-bold">₦{inv.amountToInvest?.toLocaleString()}</td>
                                            <td className="px-5 py-3 text-gray-500">{inv.durationInMonths} months</td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {inv.status}
                                                    </span>
                                                    {inv.status === 'approved' && inv.paymentReceipt && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                                                            <Receipt size={10} /> Receipt attached
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link href={`/investor/investment/${inv._id}`}
                                                    className={`inline-flex items-center text-xs font-bold px-4 py-1.5 rounded-lg transition-colors ${
                                                        inv.status === 'reviewing'
                                                            ? 'bg-[#de1f25] text-white hover:bg-[#b0181d]'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}>
                                                    {inv.status === 'reviewing' ? 'Review & Decide' : 'View Details'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    {notifications.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell size={18} className="text-[#de1f25]" />
                                    <h3 className="font-bold text-gray-900">Recent Activity</h3>
                                </div>
                                <Link href="/crm/ceo/notifications" className="text-xs text-[#de1f25] font-bold hover:underline">View all</Link>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {notifications.map(n => (
                                    <div key={n._id} className="px-5 py-3 flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-[#de1f25]'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{n.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[580px] text-gray-900 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                    {/* Threads List (Left Column) */}
                    <div className="md:col-span-1 border-r border-gray-100 flex flex-col h-full bg-gray-50/30">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider font-serif">Conversations</h3>
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
                                                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
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

            <InvestorListSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
    );
}
