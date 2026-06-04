'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PlusCircle, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function InvestorDashboard() {
    const { user } = useAuthStore();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvestments = async () => {
            try {
                const { data } = await api.get('/investments/my');
                setInvestments(data);
            } catch (error) {
                toast.error('Failed to load investments');
            } finally {
                setLoading(false);
            }
        };
        fetchInvestments();
    }, []);

    const totalInvested = investments.reduce((acc, curr) => acc + curr.amountToInvest, 0);
    const totalExpectedROI = investments.reduce((acc, curr) => acc + (curr.expectedROI || 0), 0);
    const totalProfit = totalExpectedROI - totalInvested;

    if (loading) {
        return <div className="text-center py-20">Loading your portfolio...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h2>
                    <p className="text-gray-500">Here is what is happening with your investments.</p>
                </div>
                <Link
                    href="/investor/new-investment"
                    className="flex items-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-[#de1f25]/20"
                >
                    <PlusCircle size={20} />
                    Start New Investment
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <Wallet size={20} className="text-[#de1f25]" />
                        <h3 className="font-medium">Total Invested</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">₦{totalInvested.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <TrendingUp size={20} className="text-green-600" />
                        <h3 className="font-medium">Expected Returns</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 text-green-700">₦{totalExpectedROI.toLocaleString()}</p>
                    <p className="text-sm text-green-600 mt-1 font-medium">+₦{totalProfit.toLocaleString()} profit</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-orange-900 to-orange-800 p-6 rounded-2xl border border-orange-800 shadow-lg text-white flex flex-col justify-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-700 rounded-full blur-2xl opacity-50"></div>
                    <h3 className="font-medium text-orange-200 mb-1 relative z-10">Active Portfolios</h3>
                    <p className="text-3xl font-bold relative z-10">{investments.filter(i => i.status !== 'liquidated').length}</p>
                </motion.div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Your Investments</h3>
                </div>

                {investments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="text-gray-400" size={32} />
                        </div>
                        <p className="mb-4">You have no active investments yet.</p>
                        <Link
                            href="/investor/new-investment"
                            className="text-[#de1f25] font-medium hover:text-[#b0181d]"
                        >
                            Start your first investment →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Plan / Reference</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Capital</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Duration</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Expected ROI</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investments.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">Real Estate Yield</p>
                                            <p className="text-xs text-gray-500 uppercase">{inv._id.substring(0, 8)}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">₦{inv.amountToInvest.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-600">{inv.durationInMonths} Months</td>
                                        <td className="px-6 py-4 text-green-600 font-medium">₦{inv.expectedROI?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                        ${inv.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                                                    inv.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        inv.status === 'declined' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/investor/investment/${inv._id}`} className="text-[#de1f25] hover:text-orange-900 text-sm font-medium">View details</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
