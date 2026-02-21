'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Link from 'next/link';
import { ShieldAlert, TrendingUp, Users, CheckCircle } from 'lucide-react';

export default function CEODashboard() {
    const { user } = useAuthStore();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const { data } = await api.get('/investments');
                setInvestments(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const totalInvested = investments
        .filter(i => i.status === 'approved' || i.status === 'liquidated' || i.status === 'active')
        .reduce((a, b) => a + (b.amountToInvest || 0), 0);

    const pendingApprovals = investments.filter(i => i.status === 'reviewing').length;

    if (loading) return <div className="p-10 text-center">Loading CEO terminal...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">CEO Executive Terminal</h2>
                <p className="text-gray-500">Global overview and absolute control over portfolios.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-700 rounded-full blur-2xl opacity-50"></div>
                    <div className="flex items-center gap-3 mb-2 text-indigo-200">
                        <TrendingUp size={20} />
                        <h3 className="font-medium relative z-10">Total Revenue (Approved)</h3>
                    </div>
                    <p className="text-3xl font-bold relative z-10">₦{totalInvested.toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <ShieldAlert size={20} className="text-[#de1f25]" />
                        <h3 className="font-medium">Total Portfolios</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{investments.length}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <CheckCircle size={20} className="text-green-600" />
                        <h3 className="font-medium">Pending Approvals</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{pendingApprovals}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Portfolio Database</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                                <th className="px-6 py-4 font-semibold">Investor Name</th>
                                <th className="px-6 py-4 font-semibold">Capital</th>
                                <th className="px-6 py-4 font-semibold">Duration</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investments.map(inv => (
                                <tr key={inv._id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{inv.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{inv._id}</p>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">₦{inv.amountToInvest?.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-600">{inv.durationInMonths} Months</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                      ${inv.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                                                inv.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    inv.status === 'retreated' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/investor/investment/${inv._id}`} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                                            Review & Decide
                                        </Link>
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
