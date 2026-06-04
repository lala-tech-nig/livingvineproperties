'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { History, FileText, CalendarDays, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function InvestorHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/investments/my');
                // Filter for completed/liquidated/declined investments
                const historicalData = data.filter(inv => ['liquidated', 'declined', 'retreated'].includes(inv.status));
                setHistory(historicalData);
            } catch (error) {
                toast.error('Failed to load investment history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <History className="text-[#de1f25]" size={32} />
                    Investment History
                </h1>
                <p className="text-gray-500 mt-2">View your past, matured, and liquidated portfolios.</p>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#de1f25]"></div>
                </div>
            ) : history.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No historical records</h3>
                    <p className="text-gray-500">You don't have any past investments yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((inv, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={inv._id}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${inv.status === 'liquidated' ? 'bg-blue-50 text-blue-700' :
                                            inv.status === 'declined' ? 'bg-red-50 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {inv.status}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                                        <CalendarDays size={14} />
                                        {new Date(inv.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-1">₦{inv.amountToInvest?.toLocaleString()}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    {inv.durationInMonths} Months • <span className="text-gray-400">Target ROI: ₦{inv.expectedROI?.toLocaleString()}</span>
                                </p>
                            </div>

                            <Link
                                href={`/investor/investment/${inv._id}`}
                                className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors"
                            >
                                View Details <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
