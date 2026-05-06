'use client';

import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Users, Target, Calendar, Clock } from 'lucide-react';

export default function SalesDashboard() {
    const { user } = useAuthStore();

    const stats = [
        { name: 'Active Customers', value: '0', icon: Users, color: 'bg-blue-500' },
        { name: 'New Leads', value: '0', icon: Target, color: 'bg-green-500' },
        { name: 'Tasks for Today', value: '0', icon: Calendar, color: 'bg-orange-500' },
        { name: 'Avg. Response Time', value: '2h', icon: Clock, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h2>
                <p className="text-gray-500">Here's what's happening with your sales pipeline today.</p>
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
                {/* Recent Customers */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Recent Customers</h3>
                    <div className="text-center py-12 text-gray-400">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No customers assigned yet.</p>
                    </div>
                </div>

                {/* Today's Tasks */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
                    <div className="text-center py-12 text-gray-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                        <p>You're all caught up for today!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
