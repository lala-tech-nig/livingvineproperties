'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Wallet, Clock, UserCheck, TrendingUp } from 'lucide-react';

export default function SuperadminHR() {
    const [payrolls, setPayrolls] = useState([]);
    const { token } = useAuthStore();

    useEffect(() => {
        const fetchPayroll = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/payroll`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayrolls(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPayroll();
    }, [token]);

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-white">Global Payroll & HR</h2>
                <p className="text-gray-400">Monitor staff payments, attendance, and performance across the company.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-800">
                    <Wallet className="mb-4 opacity-50" size={32} />
                    <p className="text-indigo-200 text-sm">Total Payroll (Month)</p>
                    <p className="text-3xl font-bold">₦0.00</p>
                </div>
                <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg border border-emerald-500">
                    <UserCheck className="mb-4 opacity-50" size={32} />
                    <p className="text-emerald-100 text-sm">Active Staff</p>
                    <p className="text-3xl font-bold">{payrolls.length}</p>
                </div>
                <div className="bg-amber-500 text-white p-6 rounded-2xl shadow-lg border border-amber-400">
                    <Clock className="mb-4 opacity-50" size={32} />
                    <p className="text-amber-100 text-sm">Avg Attendance Rate</p>
                    <p className="text-3xl font-bold">0%</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Staff Payroll Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Base Salary</th>
                                <th className="px-6 py-4">Net Pay</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-900">
                            {payrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        No payroll records found.
                                    </td>
                                </tr>
                            ) : payrolls.map(pay => (
                                <tr key={pay._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{pay.userId?.firstName} {pay.userId?.surname}</div>
                                        <div className="text-xs text-gray-500">{pay.userId?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">₦{pay.baseSalary?.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">₦{pay.netPay?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            pay.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {pay.status}
                                        </span>
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
