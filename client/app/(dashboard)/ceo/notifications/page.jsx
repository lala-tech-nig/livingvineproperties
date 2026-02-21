'use client';

import { Bell, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CeoNotifications() {
    const alerts = [
        { id: 1, type: 'critical', message: 'Large investment awaiting approval from John Doe (Ref #INV-928)', time: '10 mins ago' },
        { id: 2, type: 'info', message: 'System maintenance scheduled for weekend', time: '2 hours ago' },
        { id: 3, type: 'success', message: 'Monthly portfolio ROI distributions completed successfully', time: '1 day ago' }
    ];

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Bell className="text-[#de1f25]" size={32} />
                    System Alerts & Notifications
                </h1>
                <p className="text-gray-500 mt-2">Important operational insights and executive alerts.</p>
            </header>

            <div className="space-y-4">
                {alerts.map((alert, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={alert.id}
                        className={`p-6 rounded-2xl border ${alert.type === 'critical' ? 'bg-red-50 border-red-100' :
                                alert.type === 'success' ? 'bg-green-50 border-green-100' :
                                    'bg-blue-50 border-blue-100'
                            } flex items-start gap-4 shadow-sm`}
                    >
                        <div className={`mt-1 ${alert.type === 'critical' ? 'text-red-500' :
                                alert.type === 'success' ? 'text-green-500' :
                                    'text-blue-500'
                            }`}>
                            {alert.type === 'critical' ? <ShieldAlert size={24} /> : alert.type === 'success' ? <CheckCircle2 size={24} /> : <Bell size={24} />}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 leading-snug">{alert.message}</p>
                            <p className="text-sm text-gray-500 mt-1">{alert.time}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-900">
                            <ArrowRight size={20} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
