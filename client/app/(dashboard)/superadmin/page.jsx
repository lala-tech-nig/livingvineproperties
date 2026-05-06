'use client';

import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { ShieldCheck, Server, Activity, Users } from 'lucide-react';

export default function SuperAdminDashboard() {
    const { user } = useAuthStore();

    const stats = [
        { name: 'System Users', value: '0', icon: Users, color: 'bg-slate-800' },
        { name: 'Active Sessions', value: '0', icon: Activity, color: 'bg-indigo-600' },
        { name: 'System Status', value: 'Healthy', icon: Server, color: 'bg-emerald-600' },
        { name: 'Admin Alerts', value: '0', icon: ShieldCheck, color: 'bg-rose-600' },
    ];

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="text-indigo-600" />
                        Superadmin Command Center
                    </h2>
                    <p className="text-slate-500">Global system control and multi-tier management.</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider">
                    Tier 100 Access
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-md border border-slate-100"
                    >
                        <div className="flex flex-col gap-4">
                            <div className={`${stat.color} w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-lg shadow-indigo-100`}>
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

            <div className="bg-slate-900 text-white p-8 rounded-3xl overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Global System Monitoring</h3>
                    <p className="text-slate-400 mb-6 max-w-lg">Everything is running smoothly. No critical errors detected in the last 24 hours.</p>
                    <button className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                        Run System Diagnostic
                    </button>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity size={200} />
                </div>
            </div>
        </div>
    );
}
