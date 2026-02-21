'use client';

import { BellRing, Send, Clock, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManagementNotifications() {
    const alerts = [
        { id: 1, icon: <UserPlus className="text-green-600" />, message: 'New Investor Registered: Michael Obi', time: '5 mins ago', bg: 'bg-green-50' },
        { id: 2, icon: <Send className="text-blue-600" />, message: 'Investment Ref #12344 assigned to your queue', time: '1 hr ago', bg: 'bg-blue-50' },
        { id: 3, icon: <Clock className="text-yellow-600" />, message: 'Liquidation request pending review for 2 days', time: 'Yesterday', bg: 'bg-yellow-50' }
    ];

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <BellRing className="text-[#de1f25]" size={32} />
                    Platform Activity
                </h1>
                <p className="text-gray-500 mt-2">Live stream of tasks and investor activities requiring attention.</p>
            </header>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {alerts.map((alert, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={alert.id}
                        className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <div className={`p-3 rounded-full ${alert.bg}`}>
                            {alert.icon}
                        </div>
                        <div className="flex-1 mt-1">
                            <p className="font-semibold text-gray-900">{alert.message}</p>
                            <p className="text-sm font-medium text-[#de1f25] mt-1">{alert.time}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
