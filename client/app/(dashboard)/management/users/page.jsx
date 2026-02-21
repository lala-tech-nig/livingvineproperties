'use client';

import { Users, Search, Mail, Phone, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManagementUsers() {
    // Dummy UI Data for demonstration
    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '08012345678', status: 'Active', investments: 3 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '08087654321', status: 'Pending KYC', investments: 0 },
        { id: 3, name: 'Michael Obi', email: 'mike@example.com', phone: '08011223344', status: 'Active', investments: 1 },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="text-[#de1f25]" size={32} />
                        Investor Directory
                    </h1>
                    <p className="text-gray-500 mt-2">Manage and view registered investors on the platform.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#de1f25] outline-none" />
                </div>
            </header>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 border-b border-gray-100 text-sm">
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Contact</th>
                                <th className="p-4 font-semibold">Portfolios</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={user.id}
                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#de1f25] text-white flex items-center justify-center font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-500">
                                            <div className="flex items-center gap-1"><Mail size={14} /> {user.email}</div>
                                            <div className="flex items-center gap-1 mt-1"><Phone size={14} /> {user.phone}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{user.investments} Active</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-[#de1f25] hover:text-[#b0181d] font-medium text-sm">View Profile</button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
