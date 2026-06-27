'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    TrendingUp, Users, CheckCircle, Clock, XCircle, Landmark,
    MessageSquare, Bell, ArrowRight, BarChart3, DollarSign,
    RefreshCw, UserCheck, ShieldAlert
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
    const [investments, setInvestments] = useState([]);
    const [accounts, setAccounts]       = useState([]);
    const [staff, setStaff]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => { fetchAll(); }, []);

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
            {/* Greeting */}
            <div>
                <h2 className="text-2xl font-bold text-white">CEO Executive Terminal</h2>
                <p className="text-gray-400 mt-1">Welcome back, {user?.firstName}. Here's the platform at a glance.</p>
            </div>

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
                                        <th className="px-5 py-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingApprovals.slice(0, 8).map(inv => (
                                        <tr key={inv._id} className="border-t border-gray-50 hover:bg-amber-50/40 transition-colors">
                                            <td className="px-5 py-3">
                                                <p className="font-bold">{inv.name}</p>
                                                <p className="text-xs text-gray-400">{inv.email}</p>
                                            </td>
                                            <td className="px-5 py-3 font-bold text-gray-900">₦{inv.amountToInvest?.toLocaleString()}</td>
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
                                <th className="px-5 py-3 font-semibold text-right">Action</th>
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
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {inv.status}
                                        </span>
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
        </div>
    );
}
