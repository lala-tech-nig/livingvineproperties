'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, Users, Download, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';

export default function StaffWhatsAppDashboard() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0 });
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState(''); // '' (all), 'today', 'week', 'month'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalContacts, setTotalContacts] = useState(0);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [page, period]);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/whatsapp/contacts/stats');
            setStats(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load whatsapp stats');
        }
    };

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/whatsapp/contacts/mine', {
                params: {
                    search,
                    page,
                    period,
                    limit: 10
                }
            });
            setContacts(data.contacts);
            setTotalPages(data.pages);
            setTotalContacts(data.total);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load contacts list');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchContacts();
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        setPage(1);
    };

    const handleExportExcel = async () => {
        const toastId = toast.loading('Generating Excel file...');
        try {
            const response = await api.get('/whatsapp/contacts/export', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `my_whatsapp_contacts_${new Date().toISOString().slice(0,10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Excel downloaded successfully!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to download Excel file', { id: toastId });
        }
    };

    const statCards = [
        { name: 'Gathered Today', value: stats.today, icon: Calendar, color: 'from-[#de1f25]/20 to-red-500/10 border-red-500/30 text-red-400' },
        { name: 'This Week', value: stats.week, icon: Users, color: 'from-blue-600/20 to-blue-500/10 border-blue-500/30 text-blue-400' },
        { name: 'This Month', value: stats.month, icon: MessageSquare, color: 'from-amber-600/20 to-amber-500/10 border-amber-500/30 text-amber-400' },
        { name: 'Total Contacts', value: stats.total, icon: Download, color: 'from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 text-emerald-400' }
    ];

    return (
        <div className="space-y-8 text-white">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-serif">
                        <MessageSquare className="text-[#de1f25]" size={28} />
                        WhatsApp Harvester Database
                    </h2>
                    <p className="text-gray-400">View and export the WhatsApp contacts you have gathered for the company.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => { fetchStats(); fetchContacts(); }}
                        className="p-3 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition-all"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button 
                        onClick={handleExportExcel}
                        className="bg-[#de1f25] hover:bg-[#b81419] text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md text-sm"
                    >
                        <Download size={18} /> Export my data (.xlsx)
                    </button>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-gradient-to-br ${card.color} p-6 rounded-2xl border shadow-sm`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-400 mb-1">{card.name}</p>
                                <p className="text-3xl font-black">{card.value}</p>
                            </div>
                            <div className="p-2 bg-gray-900/60 rounded-xl border border-white/5">
                                <card.icon size={20} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filter and Table Container */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Time Period Filter Tabs */}
                    <div className="flex gap-1.5 bg-gray-950 p-1 rounded-xl border border-gray-850 self-start">
                        {[
                            { label: 'All Time', value: '' },
                            { label: 'Today', value: 'today' },
                            { label: 'This Week', value: 'week' },
                            { label: 'This Month', value: 'month' }
                        ].map((t) => (
                            <button
                                key={t.label}
                                onClick={() => handlePeriodChange(t.value)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${period === t.value ? 'bg-[#de1f25]/15 text-[#de1f25] border border-[#de1f25]/20 font-semibold' : 'text-gray-400 hover:text-white'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search contacts or group..."
                                className="w-full bg-gray-950 border border-gray-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#de1f25] transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-gray-950 border border-gray-850 hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded-xl transition-all text-xs"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#de1f25] mx-auto mb-4"></div>
                            Loading collected contacts...
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="py-16 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl">
                            <MessageSquare className="mx-auto mb-4 opacity-20 text-[#de1f25]" size={48} />
                            <h3 className="text-white font-bold mb-1">No contacts harvested yet</h3>
                            <p className="text-sm max-w-sm mx-auto leading-relaxed text-gray-400">
                                Use the WhatsApp Harvester Chrome Extension on your browser to scan and upload contacts from groups!
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="pb-3 pl-2">Display Name</th>
                                    <th className="pb-3">Phone Number</th>
                                    <th className="pb-3">Country Code</th>
                                    <th className="pb-3">Source Group</th>
                                    <th className="pb-3 pr-2">Date Collected</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-sm">
                                {contacts.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-850/30 transition-colors">
                                        <td className="py-3.5 pl-2 font-semibold text-white">{c.displayName}</td>
                                        <td className="py-3.5 text-gray-300 font-mono">{c.phoneNumber}</td>
                                        <td className="py-3.5 text-gray-400 font-mono">{c.countryCode || 'N/A'}</td>
                                        <td className="py-3.5">
                                            <span className="bg-[#de1f25]/10 text-[#de1f25] border border-[#de1f25]/20 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                                {c.groupName}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-gray-400 pr-2 text-xs">
                                            {new Date(c.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && contacts.length > 0 && (
                    <div className="flex justify-between items-center border-t border-gray-800 pt-4 text-xs">
                        <span className="text-gray-550">
                            Showing <strong className="text-white">{contacts.length}</strong> of <strong className="text-white">{totalContacts}</strong> contacts
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="p-2 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white font-bold">
                                {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
