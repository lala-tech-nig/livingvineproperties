'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Users, Search, Filter, Mail, Phone, Calendar } from 'lucide-react';

export default function SuperadminCRM() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuthStore();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/crm/customers`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCustomers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, [token]);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">CRM Overview</h2>
                    <p className="text-gray-500">Global view of all customers and their assigned representatives.</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search customers..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No customers found in the system.</p>
                                    </td>
                                </tr>
                            ) : customers.map(customer => (
                                <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{customer.firstName} {customer.lastName}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} />
                                            DOB: {customer.dob ? new Date(customer.dob).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 flex items-center gap-2"><Mail size={14} /> {customer.email}</div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2"><Phone size={14} /> {customer.phoneNumber}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {customer.assignedTo ? `${customer.assignedTo.firstName} ${customer.assignedTo.surname}` : 'Unassigned'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(customer.createdAt).toLocaleDateString()}
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
