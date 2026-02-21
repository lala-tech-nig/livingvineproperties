'use client';

import { Shield, ShieldAlert, Mail, Phone, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CeoTeam() {
    // Dummy Data
    const team = [
        { id: 1, name: 'Management One', email: 'management1@livingvine.com', role: 'Senior Investment Analyst', status: 'Active' },
        { id: 2, name: 'Management Two', email: 'management2@livingvine.com', role: 'Portfolio Manager', status: 'Active' },
        { id: 3, name: 'Auditor Rep', email: 'audit@livingvine.com', role: 'Risk Assessor', status: 'Suspended' },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="text-[#de1f25]" size={32} />
                        Management Team
                    </h1>
                    <p className="text-gray-500 mt-2">Oversee internal management accounts and access levels.</p>
                </div>
                <button className="bg-[#de1f25] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#b0181d] transition-colors shadow-md shadow-[#de1f25]/20">
                    + Invite Member
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        key={member.id}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 left-0 w-2 h-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="flex justify-between items-start mb-4 pl-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xl text-gray-700">
                                {member.name.charAt(0)}
                            </div>
                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${member.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {member.status}
                            </span>
                        </div>
                        <div className="pl-4">
                            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                            <p className="text-sm font-medium text-[#de1f25] mb-4">{member.role}</p>

                            <div className="space-y-2 text-sm text-gray-500 mb-6">
                                <p className="flex items-center gap-2"><Mail size={14} /> {member.email}</p>
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors border border-gray-200">
                                <Lock size={16} /> Manage Access
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
