'use client';

import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Briefcase, UserCheck, Wallet, FileText } from 'lucide-react';

export default function HRDashboard() {
    const { user } = useAuthStore();

    const stats = [
        { name: 'Total Staff', value: '0', icon: Briefcase, color: 'bg-indigo-500' },
        { name: 'Checked In Today', value: '0', icon: UserCheck, color: 'bg-emerald-500' },
        { name: 'Pending Payroll', value: '0', icon: Wallet, color: 'bg-rose-500' },
        { name: 'Active Leave', value: '0', icon: FileText, color: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-900">HR & Operations</h2>
                <p className="text-gray-500">Manage staff attendance, payroll, and company policies.</p>
            </header>

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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-emerald-700">Attendance Overview</h3>
                    <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        Attendance chart will appear here
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-rose-700">Payroll Status</h3>
                    <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        Payroll summary will appear here
                    </div>
                </div>
            </div>
        </div>
    );
}
