'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Target, Search, Plus } from 'lucide-react';

export default function SalesLeads() {
    const [leads, setLeads] = useState([]);
    const { token } = useAuthStore();

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/crm/leads`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeads(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLeads();
    }, [token]);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 text-orange-900">Leads Management</h2>
                    <p className="text-gray-500">Track and nurture potential customers in your pipeline.</p>
                </div>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100 font-bold">
                    <Plus size={20} />
                    New Lead
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search leads..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Lead</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Assigned Rep</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-300">
                                        <Target size={48} className="mx-auto mb-2 opacity-20" />
                                        <p>No leads found.</p>
                                    </td>
                                </tr>
                            ) : leads.map(lead => (
                                <tr key={lead._id}>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{lead.firstName} {lead.lastName}</div>
                                        <div className="text-xs text-gray-500">{lead.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{lead.source}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold uppercase">{lead.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {lead.assignedTo?.firstName || 'Unassigned'}
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
