'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { ShieldCheck, Server, Activity, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminDashboard() {
    const { user } = useAuthStore();
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/all')
            .then(({ data }) => setAllUsers(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.isActive).length;
    const suspendedUsers = allUsers.filter(u => !u.isActive).length;
    const investors = allUsers.filter(u => u.role === 'investor').length;

    const stats = [
        { name: 'System Users', value: loading ? '...' : String(totalUsers), icon: Users, color: 'bg-slate-800' },
        { name: 'Active Accounts', value: loading ? '...' : String(activeUsers), icon: Activity, color: 'bg-emerald-600' },
        { name: 'Investors', value: loading ? '...' : String(investors), icon: ShieldCheck, color: 'bg-indigo-600' },
        { name: 'Suspended', value: loading ? '...' : String(suspendedUsers), icon: Server, color: 'bg-rose-600' },
    ];

    const recentUsers = allUsers.slice(0, 8);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-indigo-600" />
                        Superadmin Command Center
                    </h2>
                    <p className="text-slate-400">Global system control and multi-tier management.</p>
                </div>
                <div className="bg-indigo-950 px-4 py-2 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-900">
                    Tier 100 Access
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-900">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-md border border-slate-100"
                    >
                        <div className="flex flex-col gap-4">
                            <div className={`${stat.color} w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-lg`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">{stat.name}</p>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Users Quick View */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">All Registered Users</h3>
                    <Link href="/crm/superadmin/users" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                        Manage all <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="3" className="px-6 py-3">
                                            <div className="animate-pulse flex gap-3 items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-200" />
                                                <div className="flex-1 space-y-1">
                                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                                    <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : recentUsers.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                {u.firstName?.charAt(0)}{u.surname?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{u.firstName} {u.surname}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">{u.role}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            {u.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
