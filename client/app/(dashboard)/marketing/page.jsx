'use client';

import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Megaphone, Users, Mail, BarChart } from 'lucide-react';

export default function MarketingDashboard() {
    const { user } = useAuthStore();

    const stats = [
        { name: 'Total Leads', value: '0', icon: Users, color: 'bg-pink-500' },
        { name: 'Campaigns', value: '0', icon: Megaphone, color: 'bg-yellow-500' },
        { name: 'Emails Sent', value: '0', icon: Mail, color: 'bg-blue-500' },
        { name: 'Conv. Rate', value: '0%', icon: BarChart, color: 'bg-green-500' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-900">Marketing Hub</h2>
                <p className="text-gray-500">Manage your leads and automated customer engagement.</p>
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

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <Megaphone size={64} className="mx-auto mb-4 text-gray-200" />
                <h3 className="text-xl font-semibold mb-2">No active campaigns</h3>
                <p className="text-gray-500 max-w-md mx-auto">Start a new lead generation campaign or setup automated surveys to get customer feedback.</p>
            </div>
        </div>
    );
}
