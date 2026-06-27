'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Filter, Mail, Phone, Calendar, Eye, X, Gift,
    Target, Briefcase, Award, ArrowUpRight, ShieldAlert, UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAnniversaryInfo(dateStr) {
    if (!dateStr) return null;
    const joined = new Date(dateStr);
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), joined.getMonth(), joined.getDate());
    if (thisYear < now) thisYear.setFullYear(now.getFullYear() + 1);
    const daysLeft = Math.ceil((thisYear - now) / (1000 * 60 * 60 * 24));
    const years = now.getFullYear() - joined.getFullYear() + (thisYear.getFullYear() > now.getFullYear() ? 0 : 1);
    return { daysLeft, years };
}

// ─── Detail Modal ────────────────────────────────────────────────────────────
function DetailModal({ type, data, onClose }) {
    const ann = type === 'investor' ? getAnniversaryInfo(data.createdAt) : null;
    const title = type === 'investor' 
        ? `${data.firstName} ${data.surname}` 
        : (type === 'customer' ? `${data.firstName} ${data.lastName}` : data.name);
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-gray-900"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 p-6 relative text-white">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X size={18} />
                    </button>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-full mb-2 inline-block">
                        {type} Profile
                    </span>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-indigo-200 text-xs mt-1">{data.email || 'No email registered'}</p>
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-4">
                    {ann && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${ann.daysLeft <= 30 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                            <Gift size={18} className="text-amber-500 shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Anniversary Milestone</p>
                                <p className="text-xs font-semibold text-gray-800">
                                    Year {ann.years} milestone · {ann.daysLeft === 0 ? 'Today! 🎉' : `${ann.daysLeft} days away`}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50 p-3 rounded-xl">
                            <p className="text-gray-400 font-medium mb-0.5">Date Joined</p>
                            <p className="font-semibold text-gray-800">{new Date(data.createdAt).toLocaleDateString()}</p>
                        </div>
                        {data.gender && (
                            <div className="bg-gray-50 p-3 rounded-xl">
                                <p className="text-gray-400 font-medium mb-0.5">Gender</p>
                                <p className="font-semibold text-gray-800 capitalize">{data.gender}</p>
                            </div>
                        )}
                        {data.religion && (
                            <div className="bg-gray-50 p-3 rounded-xl">
                                <p className="text-gray-400 font-medium mb-0.5">Religion</p>
                                <p className="font-semibold text-gray-800 capitalize">{data.religion}</p>
                            </div>
                        )}
                        {data.state && (
                            <div className="bg-gray-50 p-3 rounded-xl">
                                <p className="text-gray-400 font-medium mb-0.5">State</p>
                                <p className="font-semibold text-gray-800">{data.state}</p>
                            </div>
                        )}
                    </div>

                    {/* Assigned Officer / Representative */}
                    {(data.accountOfficer || data.assignedTo) && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">Assigned Agent</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold font-mono">
                                    {(data.accountOfficer?.firstName || data.assignedTo?.firstName || 'A')[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-gray-800 truncate">
                                        {data.accountOfficer 
                                            ? `${data.accountOfficer.firstName} ${data.accountOfficer.surname}`
                                            : `${data.assignedTo.firstName} ${data.assignedTo.surname}`
                                        }
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate">
                                        {data.accountOfficer?.email || data.assignedTo?.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Links */}
                    <div className="flex gap-3 pt-2">
                        {data.email && (
                            <a href={`mailto:${data.email}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors">
                                <Mail size={14} /> Email
                            </a>
                        )}
                        {data.phoneNumber && (
                            <a href={`https://wa.me/${data.phoneNumber.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors">
                                <Phone size={14} /> WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function SuperadminCRM() {
    const [activeTab, setActiveTab] = useState('investors');
    const [investors, setInvestors] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const { token } = useAuthStore();

    const fetchCRMData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'investors') {
                const res = await api.get('/users/investors');
                setInvestors(res.data);
            } else if (activeTab === 'customers') {
                const res = await api.get('/crm/customers');
                setCustomers(res.data);
            } else if (activeTab === 'leads') {
                const res = await api.get('/crm/leads');
                setLeads(res.data);
            }
        } catch (err) {
            console.error(err);
            toast.error(`Failed to load ${activeTab} data`);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (token) fetchCRMData();
    }, [token, activeTab, fetchCRMData]);

    // Client-side search filtration
    const filteredInvestors = investors.filter(i => 
        `${i.firstName} ${i.surname} ${i.email} ${i.state || ''} ${i.phoneNumber || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCustomers = customers.filter(c => 
        `${c.firstName} ${c.lastName} ${c.email} ${c.phoneNumber || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredLeads = leads.filter(l => 
        `${l.name} ${l.email || ''} ${l.phone || ''} ${l.status || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Company CRM Overview</h2>
                    <p className="text-gray-400">View and manage investors, customers, and active company leads.</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/10 p-1 rounded-xl w-fit">
                {[
                    { key: 'investors', label: 'Investors Registry', icon: Users },
                    { key: 'customers', label: 'Company Customers', icon: UserCheck },
                    { key: 'leads', label: 'Outreach Leads', icon: Target },
                ].map(tab => (
                    <button 
                        key={tab.key} 
                        onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* CRM Search panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={`Search ${activeTab}...`}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-950"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-gray-400 flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading registry database...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* ── Tab Content: Investors ── */}
                        {activeTab === 'investors' && (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Investor</th>
                                        <th className="px-6 py-4">Demographics</th>
                                        <th className="px-6 py-4">Account Officer</th>
                                        <th className="px-6 py-4">Anniversary</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInvestors.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                                <Users size={48} className="mx-auto mb-4 opacity-20" />
                                                <p>No matching investors found.</p>
                                            </td>
                                        </tr>
                                    ) : filteredInvestors.map(inv => {
                                        const ann = getAnniversaryInfo(inv.createdAt);
                                        return (
                                            <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{inv.firstName} {inv.surname}</div>
                                                    <div className="text-xs text-gray-500">{inv.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {inv.gender && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded capitalize">{inv.gender}</span>}
                                                        {inv.religion && <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded capitalize">{inv.religion}</span>}
                                                        {inv.state && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">State: {inv.state}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {inv.accountOfficer ? (
                                                        <div className="text-sm text-gray-900 font-medium">
                                                            {inv.accountOfficer.firstName} {inv.accountOfficer.surname}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {ann && (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            ann.daysLeft === 0 ? 'bg-amber-100 text-amber-800' : ann.daysLeft <= 30 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-500'
                                                        }`}>
                                                            {ann.daysLeft === 0 ? 'Today! 🎉' : `${ann.daysLeft}d left`}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button 
                                                            onClick={() => setSelectedItem({ type: 'investor', data: inv })}
                                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                            title="Inspect Profile"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {inv.phoneNumber && (
                                                            <a href={`https://wa.me/${inv.phoneNumber.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                                <Phone size={16} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* ── Tab Content: Customers ── */}
                        {activeTab === 'customers' && (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Assigned Representative</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                                <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
                                                <p>No customers found.</p>
                                            </td>
                                        </tr>
                                    ) : filteredCustomers.map(customer => (
                                        <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {customer.firstName} {customer.lastName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-600 flex items-center gap-1"><Mail size={12} /> {customer.email}</div>
                                                {customer.phoneNumber && <div className="text-xs text-gray-600 flex items-center gap-1"><Phone size={12} /> {customer.phoneNumber}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {customer.assignedTo ? (
                                                    <span className="font-semibold text-gray-800">{customer.assignedTo.firstName} {customer.assignedTo.surname}</span>
                                                ) : <span className="text-xs text-gray-400 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {customer.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => setSelectedItem({ type: 'customer', data: customer })}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* ── Tab Content: Leads ── */}
                        {activeTab === 'leads' && (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Lead Name</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Assigned Agent</th>
                                        <th className="px-6 py-4">Stage / Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                                <Target size={48} className="mx-auto mb-4 opacity-20" />
                                                <p>No outreach leads found.</p>
                                            </td>
                                        </tr>
                                    ) : filteredLeads.map(lead => (
                                        <tr key={lead._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {lead.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.email && <div className="text-xs text-gray-600 flex items-center gap-1"><Mail size={12} /> {lead.email}</div>}
                                                {lead.phone && <div className="text-xs text-gray-600 flex items-center gap-1"><Phone size={12} /> {lead.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {lead.assignedTo ? (
                                                    <span className="font-semibold text-gray-800">{lead.assignedTo.firstName} {lead.assignedTo.surname}</span>
                                                ) : <span className="text-xs text-gray-400 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    lead.status === 'won' ? 'bg-green-100 text-green-700' : lead.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => setSelectedItem({ type: 'lead', data: lead })}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedItem && (
                    <DetailModal 
                        type={selectedItem.type} 
                        data={selectedItem.data} 
                        onClose={() => setSelectedItem(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
