'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    MessageSquare, Download, Search, RefreshCw, ChevronLeft, ChevronRight,
    UserPlus, ShieldAlert, Send, PlusCircle, CheckCircle, XCircle, BarChart2,
    Calendar, Users, UsersRound, Settings, Upload, FileSpreadsheet
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';

export default function WhatsAppManagerDashboard() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('performance'); // performance, contacts, staff, messaging
    
    // Performance stats
    const [staffPerformance, setStaffPerformance] = useState([]);
    
    // Contacts state
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedStaffFilter, setSelectedStaffFilter] = useState('');
    const [contactPage, setContactPage] = useState(1);
    const [contactTotalPages, setContactTotalPages] = useState(1);
    const [totalContacts, setTotalContacts] = useState(0);

    // Messaging states
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [messageTemplate, setMessageTemplate] = useState('Hello {name}, thank you for connecting with Living Vine Properties. We have premium investment products available for you. Let us know when we can discuss!');
    const [sentStatus, setSentStatus] = useState({}); // phone -> boolean

    // Staff accounts creation
    const [staffList, setStaffList] = useState([]);
    const [newStaff, setNewStaff] = useState({
        firstName: '',
        surname: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'sales'
    });
    const [creatingStaff, setCreatingStaff] = useState(false);

    // CSV / XLSX upload state (manager)
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, [activeTab, contactPage, selectedStaffFilter]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'performance') {
                const { data } = await api.get('/whatsapp/contacts/staff-performance');
                setStaffPerformance(data);
                // Also update staff list
                setStaffList(data);
            } else if (activeTab === 'contacts') {
                const { data } = await api.get('/whatsapp/contacts/all', {
                    params: {
                        search,
                        staffId: selectedStaffFilter,
                        page: contactPage,
                        limit: 10
                    }
                });
                setContacts(data.contacts);
                setContactTotalPages(data.pages);
                setTotalContacts(data.total);
            } else if (activeTab === 'staff') {
                const { data } = await api.get('/whatsapp/contacts/staff-performance');
                setStaffList(data);
            } else if (activeTab === 'messaging') {
                const { data } = await api.get('/whatsapp/contacts/all', {
                    params: { limit: 100 } // Load first 100 for messaging panel
                });
                setContacts(data.contacts);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setContactPage(1);
        loadDashboardData();
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setCreatingStaff(true);
        const toastId = toast.loading('Creating staff account...');
        try {
            await api.post('/whatsapp/create-staff', newStaff);
            toast.success('Staff account created successfully!', { id: toastId });
            setNewStaff({
                firstName: '',
                surname: '',
                email: '',
                phoneNumber: '',
                password: '',
                role: 'sales'
            });
            // Reload list
            const { data } = await api.get('/whatsapp/contacts/staff-performance');
            setStaffList(data);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create staff account', { id: toastId });
        } finally {
            setCreatingStaff(false);
        }
    };

    const handleToggleSuspend = async (staffId, currentStatus) => {
        const action = currentStatus ? 'suspend' : 'activate';
        if (!confirm(`Are you sure you want to ${action} this staff account?`)) return;

        try {
            const { data } = await api.put(`/users/${staffId}/suspend`);
            toast.success(data.message);
            // Refresh staff list
            const { data: updatedStaff } = await api.get('/whatsapp/contacts/staff-performance');
            setStaffList(updatedStaff);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update staff status');
        }
    };

    const handleExportExcelAll = async () => {
        const toastId = toast.loading('Exporting all WhatsApp records...');
        try {
            const response = await api.get('/whatsapp/contacts/export', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `company_whatsapp_contacts_${new Date().toISOString().slice(0,10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Excel exported successfully!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to export data', { id: toastId });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadResult(null);
        setUploading(true);
        const toastId = toast.loading(`Uploading ${file.name}…`);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await api.post('/whatsapp/contacts/upload-file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadResult(data);
            toast.success(data.message, { id: toastId });
            // Refresh the contacts tab and performance
            loadDashboardData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Upload failed', { id: toastId });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Toggle contact selection for bulk messaging
    const toggleSelectContact = (contact) => {
        const index = selectedContacts.findIndex(c => c._id === contact._id);
        if (index > -1) {
            setSelectedContacts(selectedContacts.filter(c => c._id !== contact._id));
        } else {
            setSelectedContacts([...selectedContacts, contact]);
        }
    };

    const toggleSelectAllContacts = () => {
        if (selectedContacts.length === contacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts([...contacts]);
        }
    };

    // Generate WhatsApp wa.me link
    const getWhatsAppLink = (contact) => {
        const formattedMsg = messageTemplate.replace(/{name}/gi, contact.displayName);
        const encoded = encodeURIComponent(formattedMsg);
        // Normalize phone number prefix if missing
        let phone = contact.phoneNumber;
        if (!phone.startsWith('+')) {
            // Assume 234 if no country code or starts with local format
            if (phone.startsWith('0')) {
                phone = '234' + phone.substring(1);
            }
        } else {
            phone = phone.replace('+', '');
        }
        return `https://wa.me/${phone}?text=${encoded}`;
    };

    const handleMarkSent = (phone) => {
        setSentStatus(prev => ({
            ...prev,
            [phone]: !prev[phone]
        }));
    };

    // Infographic performance aggregations
    const totalHarvestedCount = staffPerformance.reduce((sum, s) => sum + s.total, 0);
    const todayHarvestedCount = staffPerformance.reduce((sum, s) => sum + s.today, 0);
    const topPerformer = staffPerformance.length > 0 
        ? [...staffPerformance].sort((a, b) => b.total - a.total)[0] 
        : null;

    return (
        <div className="space-y-8 text-white">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-900 pb-5">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-serif">
                        <MessageSquare className="text-amber-500" size={28} />
                        WhatsApp Operations Control Hub
                    </h2>
                    <p className="text-gray-400">Monitor harvester activities, export data lists, template text messaging, and manage accounts.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={loadDashboardData}
                        className="p-3 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition-all"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button 
                        onClick={handleExportExcelAll}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md text-sm"
                    >
                        <Download size={18} /> Export Master List (.xlsx)
                    </button>
                </div>
            </header>

            {/* Navigation tabs */}
            <div className="flex gap-1 border-b border-gray-850">
                {[
                    { id: 'performance', label: 'Infographic Performance', icon: BarChart2 },
                    { id: 'contacts', label: 'Harvester Database', icon: Users },
                    { id: 'messaging', label: 'Bulk Template Messaging', icon: Send },
                    { id: 'staff', label: 'Staff Account Management', icon: Settings }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setContactPage(1); }}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all ${
                            activeTab === tab.id 
                                ? 'border-amber-500 text-amber-500 bg-amber-500/5' 
                                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-900/40'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}

            {/* 1. PERFORMANCE TAB */}
            {activeTab === 'performance' && (
                <div className="space-y-6">
                    {/* Performance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <p className="text-sm text-gray-400">Total Gathered Database</p>
                            <p className="text-4xl font-extrabold mt-1 text-white">{totalHarvestedCount}</p>
                            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                                <CheckCircle size={12} /> Live company contacts
                            </p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <p className="text-sm text-gray-400">Gathered Today (All Staff)</p>
                            <p className="text-4xl font-extrabold mt-1 text-amber-500">{todayHarvestedCount}</p>
                            <p className="text-xs text-gray-500 mt-2">Captured across active groups today</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <p className="text-sm text-gray-400">Top Harvester</p>
                            <p className="text-xl font-bold mt-2 truncate">
                                {topPerformer ? `${topPerformer.firstName} ${topPerformer.surname}` : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Total: <strong className="text-amber-500">{topPerformer ? topPerformer.total : 0}</strong> contacts
                            </p>
                        </div>
                    </div>

                    {/* Infographic Chart: Staff Comparison */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold">Harvester Performance Rankings</h3>
                            <p className="text-xs text-gray-500">Contact acquisition numbers compared by staff members.</p>
                        </div>

                        {loading ? (
                            <div className="py-10 text-center text-gray-500">Loading performance data...</div>
                        ) : staffPerformance.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">No staff performance data recorded yet.</div>
                        ) : (
                            <div className="space-y-5">
                                {staffPerformance.map(staff => {
                                    const maxVal = topPerformer ? topPerformer.total : 100;
                                    const percentage = maxVal > 0 ? Math.round((staff.total / maxVal) * 100) : 0;
                                    return (
                                        <div key={staff._id} className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-white">
                                                    {staff.firstName} {staff.surname} 
                                                    <span className="text-gray-500 text-[10px] ml-2 uppercase bg-gray-950 px-2 py-0.5 rounded border border-gray-850">{staff.role}</span>
                                                </span>
                                                <span className="font-bold">
                                                    {staff.total} contacts <span className="text-gray-550 font-normal">({staff.today} today)</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-3.5 bg-gray-950 border border-gray-850 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full" 
                                                        style={{ width: `${Math.max(percentage, 2)}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 text-right font-mono text-xs text-gray-400 font-bold">{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. CONTACTS DATABASE TAB */}
            {activeTab === 'contacts' && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">

                    {/* ── Upload CSV / XLSX Panel ── */}
                    <div className="bg-gray-950 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                    <FileSpreadsheet className="text-amber-500" size={16} />
                                    Bulk Upload from CSV / Excel
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Upload any CSV or XLSX file — the system extracts every phone number, picks Display Name column automatically, filters out text-only cells, deduplicates against the full database, and saves only new numbers.
                                </p>
                            </div>
                            <div className="shrink-0">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="managerFileUpload"
                                />
                                <label
                                    htmlFor="managerFileUpload"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                                        uploading
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow'
                                    }`}
                                >
                                    <Upload size={15} />
                                    {uploading ? 'Processing…' : 'Upload File'}
                                </label>
                            </div>
                        </div>
                        {uploadResult && (
                            <div className="flex flex-wrap gap-4 mt-3 p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs">
                                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                    <CheckCircle size={13} /> {uploadResult.insertedCount} new saved
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-500">
                                    <XCircle size={13} /> {uploadResult.skippedCount} duplicates skipped
                                </span>
                                <span className="flex items-center gap-1.5 text-blue-400">
                                    <FileSpreadsheet size={13} /> {uploadResult.totalParsed} numbers parsed
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {/* Filter by Staff */}
                            <select
                                value={selectedStaffFilter}
                                onChange={(e) => { setSelectedStaffFilter(e.target.value); setContactPage(1); }}
                                className="bg-gray-950 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                            >
                                <option value="">Filter by Staff Member</option>
                                {staffList.map(s => (
                                    <option key={s._id} value={s._id}>{s.firstName} {s.surname}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search form */}
                        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search name, phone, group..."
                                    className="w-full bg-gray-950 border border-gray-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gray-950 border border-gray-850 hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded-xl transition-all text-xs"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-12 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                                Loading contact database...
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="py-16 text-center text-gray-500">
                                No contacts match your filter query.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="pb-3 pl-2">Display Name</th>
                                        <th className="pb-3">Phone Number</th>
                                        <th className="pb-3">Country Code</th>
                                        <th className="pb-3">Source Group</th>
                                        <th className="pb-3">Collected By</th>
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
                                                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                                    {c.groupName}
                                                </span>
                                            </td>
                                            <td className="py-3.5">
                                                {c.collectedBy ? (
                                                    <span className="text-xs text-gray-300 font-medium">
                                                        {c.collectedBy.firstName} {c.collectedBy.surname}
                                                    </span>
                                                ) : 'System'}
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
                                    onClick={() => setContactPage(p => Math.max(p - 1, 1))}
                                    disabled={contactPage === 1}
                                    className="p-2 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white font-bold">
                                    {contactPage} of {contactTotalPages}
                                </span>
                                <button
                                    onClick={() => setContactPage(p => Math.min(p + 1, contactTotalPages))}
                                    disabled={contactPage === contactTotalPages}
                                    className="p-2 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 3. BULK TEMPLATE MESSAGING TAB */}
            {activeTab === 'messaging' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Messaging Configuration Panel */}
                    <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                        <div>
                            <h3 className="text-base font-bold">Template Customizer</h3>
                            <p className="text-xs text-gray-550">Enter message text. Use <code>{"{name}"}</code> to merge contact name dynamically.</p>
                        </div>
                        <textarea
                            value={messageTemplate}
                            onChange={(e) => setMessageTemplate(e.target.value)}
                            rows={8}
                            className="w-full bg-gray-950 border border-gray-850 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 text-white outline-none resize-none leading-relaxed text-sm"
                            placeholder="Hello {name}, ..."
                        />
                        <div className="bg-gray-950 p-4 rounded-xl border border-gray-850 space-y-2 text-xs">
                            <span className="font-bold text-amber-500">Selected:</span> {selectedContacts.length} contacts.
                            <p className="text-gray-500 leading-normal">Launching messages will open a WhatsApp tab for each contact where you can click 'Send' in WhatsApp Web/App.</p>
                        </div>
                    </div>

                    {/* Contacts checklist selector & launcher */}
                    <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold">Launch Control</h3>
                            <button
                                onClick={toggleSelectAllContacts}
                                className="text-xs font-bold text-amber-500 hover:text-amber-400"
                            >
                                {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All Loaded'}
                            </button>
                        </div>

                        {contacts.length === 0 ? (
                            <div className="py-10 text-center text-gray-550">No contacts loaded for messaging.</div>
                        ) : (
                            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                                {contacts.map(c => {
                                    const isSelected = selectedContacts.some(sc => sc._id === c._id);
                                    const hasSent = sentStatus[c.phoneNumber] || false;
                                    return (
                                        <div 
                                            key={c._id} 
                                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                                                isSelected 
                                                    ? 'bg-amber-500/5 border-amber-500/20' 
                                                    : 'bg-gray-950 border-gray-850'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <input 
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectContact(c)}
                                                    className="rounded border-gray-800 text-amber-500 focus:ring-amber-500 bg-gray-900 cursor-pointer"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate text-white">{c.displayName}</p>
                                                    <p className="text-xs font-mono text-gray-500">{c.phoneNumber}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleMarkSent(c.phoneNumber)}
                                                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                        hasSent 
                                                            ? 'bg-emerald-600/20 border border-emerald-600/30 text-emerald-400' 
                                                            : 'bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800'
                                                    }`}
                                                >
                                                    {hasSent ? 'Sent' : 'Mark Sent'}
                                                </button>
                                                <a
                                                    href={getWhatsAppLink(c)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => handleMarkSent(c.phoneNumber)}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold p-2.5 rounded-lg flex items-center justify-center transition-all shadow"
                                                >
                                                    <Send size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. STAFF ACCOUNT MANAGEMENT TAB */}
            {activeTab === 'staff' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Staff form */}
                    <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                            <UserPlus className="text-amber-500" size={18} />
                            Register New Staff
                        </h3>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newStaff.firstName}
                                        onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                                        className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-650 outline-none focus:border-amber-500"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Surname</label>
                                    <input
                                        type="text"
                                        required
                                        value={newStaff.surname}
                                        onChange={(e) => setNewStaff({...newStaff, surname: e.target.value})}
                                        className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-650 outline-none focus:border-amber-500"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-650 outline-none focus:border-amber-500"
                                    placeholder="john.doe@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    value={newStaff.phoneNumber}
                                    onChange={(e) => setNewStaff({...newStaff, phoneNumber: e.target.value})}
                                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-650 outline-none focus:border-amber-500"
                                    placeholder="+234..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Temporary Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newStaff.password}
                                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-650 outline-none focus:border-amber-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Staff Role</label>
                                <select
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                                    className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                                >
                                    <option value="sales">Sales Officer</option>
                                    <option value="marketing">Marketing Specialist</option>
                                    <option value="hr">HR Executive</option>
                                    <option value="management">Operations Manager</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={creatingStaff}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                            >
                                <UserPlus size={14} /> Create Account
                            </button>
                        </form>
                    </div>

                    {/* Staff status toggle table */}
                    <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <ShieldAlert className="text-amber-500" size={18} />
                            Manage Active Staff Members
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="pb-3">Staff Name</th>
                                        <th className="pb-3">Email</th>
                                        <th className="pb-3">Role</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-sm">
                                    {staffList.map((staff) => (
                                        <tr key={staff._id} className="hover:bg-gray-850/30 transition-colors">
                                            <td className="py-3.5 font-semibold text-white">{staff.firstName} {staff.surname}</td>
                                            <td className="py-3.5 text-gray-400">{staff.email}</td>
                                            <td className="py-3.5 capitalize text-xs">
                                                <span className="bg-gray-950 px-2.5 py-1 rounded border border-gray-850 text-gray-300">
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td className="py-3.5">
                                                <span className={`text-xs font-bold ${staff.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {staff.isActive ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 text-right">
                                                <button
                                                    onClick={() => handleToggleSuspend(staff._id, staff.isActive)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                        staff.isActive 
                                                            ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                    }`}
                                                >
                                                    {staff.isActive ? 'Suspend' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
