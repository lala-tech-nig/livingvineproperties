'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Link from 'next/link';
import { Briefcase, Activity, AlertCircle, Eye } from 'lucide-react';

export default function ManagementDashboard() {
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

    const reviewingCount = investments.filter(i => i.status === 'reviewing').length;

    if (loading) return <div className="p-10 text-center">Loading management terminal...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Management Overview</h2>
                <p className="text-gray-500">Monitor all initial investments and relay to CEO.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-yellow-200 shadow-sm shadow-yellow-100">
                    <div className="flex items-center gap-3 mb-2 text-yellow-600">
                        <AlertCircle size={20} />
                        <h3 className="font-medium">Pending Reviews</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{reviewingCount}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                        <Briefcase size={20} className="text-[#de1f25]" />
                        <h3 className="font-medium">Total Portfolios</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{investments.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">All Client Investments</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                                <th className="px-6 py-4 font-semibold">Investor Name</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investments.map(inv => (
                                <tr key={inv._id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{inv.name}</p>
                                        <p className="text-xs text-gray-500">{inv.email}</p>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">₦{inv.amountToInvest?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                      ${inv.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                inv.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    inv.status === 'retreated' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {inv.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Reusing the same detailed view since it encompasses comment chat */}
                                        <Link href={`/investor/investment/${inv._id}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#de1f25] hover:text-orange-800 bg-[#de1f25]/10 px-3 py-1.5 rounded-lg transition-colors">
                                            <Eye size={16} /> Inspect
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
