'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { Briefcase, UserCheck, Wallet, FileText, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HRDashboard() {
    const { user } = useAuthStore();
    const [payrolls, setPayrolls] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [payrollRes, staffRes] = await Promise.all([
                    api.get('/hr/payroll').catch(() => ({ data: [] })),
                    api.get('/users/all').catch(() => ({ data: [] })),
                ]);
                setPayrolls(payrollRes.data);
                const operationalStaff = staffRes.data.filter(u => u.role !== 'investor');
                setStaff(operationalStaff);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const activeStaff = staff.filter(u => u.isActive).length;
    const pendingPayroll = payrolls.filter(p => p.status === 'pending').length;
    const totalNetPay = payrolls.reduce((acc, p) => acc + (p.netPay || 0), 0);

    const stats = [
        { name: 'Total Staff', value: loading ? '...' : staff.length.toString(), icon: Briefcase, color: 'bg-indigo-500' },
        { name: 'Active Staff', value: loading ? '...' : activeStaff.toString(), icon: UserCheck, color: 'bg-emerald-500' },
        { name: 'Pending Payroll', value: loading ? '...' : pendingPayroll.toString(), icon: Wallet, color: 'bg-rose-500' },
        { name: 'Payroll Records', value: loading ? '...' : payrolls.length.toString(), icon: FileText, color: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-white">HR & Operations</h2>
                <p className="text-gray-400">Manage staff attendance, payroll, and company HR policies.</p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`${stat.color} p-3 rounded-xl text-white`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Payroll */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-gray-900">Recent Payroll Entries</h3>
                        <Link href="/crm/hr/payroll" className="text-xs text-rose-500 hover:underline flex items-center gap-1">
                            Full ledger <ArrowRight size={12} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse flex gap-3 items-center">
                                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                        <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : payrolls.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Wallet size={36} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No payroll records yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {payrolls.slice(0, 5).map(p => (
                                <div key={p._id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                            {p.userId?.firstName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{p.userId?.firstName} {p.userId?.surname}</p>
                                            <p className="text-xs text-gray-500">Net: ₦{p.netPay?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                            <div className="pt-3 flex justify-between items-center">
                                <span className="text-sm text-gray-500 font-medium">Total Net Payout</span>
                                <span className="font-bold text-gray-900">₦{totalNetPay.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Staff Overview */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-gray-900">Staff Overview</h3>
                        <Link href="/crm/hr/staff" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
                            Manage <ArrowRight size={12} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse h-10 bg-gray-100 rounded-xl" />
                            ))}
                        </div>
                    ) : staff.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Briefcase size={36} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No staff records</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {staff.slice(0, 6).map(s => (
                                <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                            {s.firstName?.charAt(0)}{s.surname?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{s.firstName} {s.surname}</p>
                                            <p className="text-xs text-gray-500 capitalize">{s.role}</p>
                                        </div>
                                    </div>
                                    <span className={`w-2 h-2 rounded-full ${s.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
