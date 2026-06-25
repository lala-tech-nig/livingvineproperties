'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Search, Plus, X, Loader2, Trash2, ArrowRight } from 'lucide-react';

const STATUS_COLORS = {
    new:       'bg-blue-50 text-blue-700',
    contacted: 'bg-amber-50 text-amber-700',
    qualified: 'bg-emerald-50 text-emerald-700',
    lost:      'bg-red-50 text-red-700',
    converted: 'bg-purple-50 text-purple-700',
};

const STATUS_ORDER = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const SOURCES = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Walk-in', 'Event', 'Email Campaign', 'Other'];

function NewLeadModal({ onClose, onCreate }) {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', source: 'Website', notes: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.firstName.trim() || !form.email.trim()) {
            toast.error('First name and email are required');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/crm/leads', form);
            onCreate(data);
            toast.success(`Lead "${form.firstName}" created!`);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create lead');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Add New Lead</h2>
                        <p className="text-xs text-gray-500">Capture a potential customer for follow-up</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                placeholder="John"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-colors placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                placeholder="Doe"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-colors placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="john@example.com"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-colors placeholder-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                            <input
                                type="tel"
                                value={form.phoneNumber}
                                onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                                placeholder="08012345678"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-colors placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Source</label>
                            <select
                                value={form.source}
                                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-colors cursor-pointer"
                            >
                                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="Any additional context about this lead..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-colors resize-none placeholder-gray-400"
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Saving...' : 'Add Lead'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

export default function SalesLeads() {
    const [leads, setLeads] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [updatingLead, setUpdatingLead] = useState(null);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/crm/leads');
            setLeads(data);
        } catch (err) {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    useEffect(() => {
        let result = leads;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(l =>
                l.firstName?.toLowerCase().includes(q) ||
                l.lastName?.toLowerCase().includes(q) ||
                l.email?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter(l => l.status === statusFilter);
        }
        setFiltered(result);
    }, [search, statusFilter, leads]);

    const advanceStatus = async (lead) => {
        const idx = STATUS_ORDER.indexOf(lead.status);
        if (idx >= STATUS_ORDER.length - 1) return;
        const newStatus = STATUS_ORDER[idx + 1];
        setUpdatingLead(lead._id);
        try {
            const { data } = await api.put(`/crm/leads/${lead._id}`, { status: newStatus });
            setLeads(prev => prev.map(l => l._id === lead._id ? { ...l, status: data.status } : l));
            toast.success(`Lead moved to "${newStatus}"`);
        } catch (err) {
            toast.error('Failed to update lead');
        } finally {
            setUpdatingLead(null);
        }
    };

    const deleteLead = async (leadId) => {
        try {
            await api.delete(`/crm/leads/${leadId}`);
            setLeads(prev => prev.filter(l => l._id !== leadId));
            toast.success('Lead removed');
        } catch (err) {
            toast.error('Failed to delete lead');
        }
    };

    const newCount = leads.filter(l => l.status === 'new').length;
    const qualifiedCount = leads.filter(l => l.status === 'qualified').length;
    const convertedCount = leads.filter(l => l.status === 'converted').length;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Leads Pipeline</h2>
                    <p className="text-gray-400 mt-1">Track and nurture potential customers through your pipeline.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-orange-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-lg shadow-orange-900/20 font-bold text-sm"
                >
                    <Plus size={18} />
                    New Lead
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{newCount}</p>
                    <p className="text-xs text-gray-500 mt-1">New</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{qualifiedCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Qualified</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">{convertedCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Converted</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search leads..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none text-sm transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm appearance-none focus:ring-2 focus:ring-orange-500/30 outline-none cursor-pointer"
                >
                    <option value="all">All Statuses</option>
                    {STATUS_ORDER.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Lead</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Assigned Rep</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="5" className="px-6 py-4">
                                            <div className="animate-pulse flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                        <Target size={40} className="mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No leads found</p>
                                        <p className="text-sm mt-1">Click "New Lead" to add your first entry</p>
                                    </td>
                                </tr>
                            ) : filtered.map((lead, idx) => (
                                <motion.tr
                                    key={lead._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm shrink-0">
                                                {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0) || ''}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{lead.firstName} {lead.lastName}</p>
                                                <p className="text-xs text-gray-500">{lead.email}</p>
                                                {lead.phoneNumber && <p className="text-xs text-gray-400">{lead.phoneNumber}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{lead.source}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.surname}` : 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {lead.status !== 'converted' && lead.status !== 'lost' && (
                                                <button
                                                    onClick={() => advanceStatus(lead)}
                                                    disabled={updatingLead === lead._id}
                                                    title="Advance status"
                                                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                >
                                                    {updatingLead === lead._id
                                                        ? <Loader2 size={16} className="animate-spin" />
                                                        : <ArrowRight size={16} />
                                                    }
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteLead(lead._id)}
                                                title="Delete lead"
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Lead Modal */}
            <AnimatePresence>
                {showModal && (
                    <NewLeadModal
                        onClose={() => setShowModal(false)}
                        onCreate={(lead) => setLeads(prev => [lead, ...prev])}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
