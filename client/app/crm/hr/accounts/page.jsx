'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import {
    Landmark, Plus, Search, Calendar, Filter, Download,
    Trash2, Loader2, DollarSign, ArrowUpRight, ArrowDownRight,
    TrendingUp, ShieldAlert, X, ChevronDown, CheckCircle
} from 'lucide-react';

const CATEGORIES = [
    'OFFICE MAINT.', 'FUEL V&GEN', 'PURCHASE', 'PROPERTY EXP', 'SALES',
    'AGENT COMM', 'LEGAL FEES', 'VEHICLE MAINT', 'ADVERT', 'INVESTMENT/LOAN',
    'INVESTMENT &ROI', 'REFERRAL C&B', 'ELECTRICITY', 'PENCOM', 'SALARY & ALL',
    'VAT', 'WHT', 'PAYEE', 'INTERNET &CUG', 'ASSET', 'GEN. REPAIR', 'RENT'
];

const ACCOUNTS = ['FBN', 'UBA', 'GTBANK', 'CASH'];

export default function AccountsLedgerPage() {
    const { user } = useAuthStore();
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [account, setAccount] = useState('');
    const [category, setCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // New transaction form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        voucherNo: '',
        particulars: '',
        type: 'expenditure',
        account: 'FBN',
        category: 'OFFICE MAINT.',
        amount: ''
    });

    useEffect(() => {
        fetchLedgerData();
    }, [search, type, account, category, startDate, endDate]);

    const fetchLedgerData = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (type) queryParams.append('type', type);
            if (account) queryParams.append('account', account);
            if (category) queryParams.append('category', category);
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);

            const [recordsRes, summaryRes] = await Promise.all([
                api.get(`/ledger?${queryParams.toString()}`),
                api.get('/ledger/summary')
            ]);

            setRecords(recordsRes.data);
            setSummary(summaryRes.data);
        } catch (err) {
            toast.error('Failed to load ledger records');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        if (!formData.voucherNo || !formData.particulars || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/ledger', {
                ...formData,
                amount: parseFloat(formData.amount)
            });
            toast.success('Transaction recorded successfully!');
            setShowAddModal(false);
            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                voucherNo: '',
                particulars: '',
                type: 'expenditure',
                account: 'FBN',
                category: 'OFFICE MAINT.',
                amount: ''
            });
            fetchLedgerData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save transaction');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRecord = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
        try {
            await api.delete(`/ledger/${id}`);
            toast.success('Record deleted');
            fetchLedgerData();
        } catch {
            toast.error('Failed to delete transaction record');
        }
    };

    const handleExportCSV = () => {
        if (records.length === 0) {
            toast.error('No records available to export');
            return;
        }

        const headers = ['Date', 'Voucher No', 'Particulars', 'Account', 'Category', 'Type', 'Amount (NGN)'];
        const csvRows = [
            headers.join(','),
            ...records.map(r => {
                const cleanParticulars = `"${r.particulars.replace(/"/g, '""')}"`;
                const formattedDate = new Date(r.date).toISOString().split('T')[0];
                return [
                    formattedDate,
                    r.voucherNo,
                    cleanParticulars,
                    r.account,
                    r.category,
                    r.type.toUpperCase(),
                    r.amount
                ].join(',');
            })
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `living_vine_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV spreadsheet exported successfully!');
    };

    // Bank Styles Helper
    const getBankStyle = (bank) => {
        switch (bank) {
            case 'FBN':
                return { bg: 'bg-gradient-to-br from-amber-800 to-amber-900', border: 'border-amber-700', text: 'text-amber-100' };
            case 'UBA':
                return { bg: 'bg-gradient-to-br from-red-800 to-red-950', border: 'border-red-700', text: 'text-red-100' };
            case 'GTBANK':
                return { bg: 'bg-gradient-to-br from-orange-600 to-orange-850', border: 'border-orange-500', text: 'text-orange-100' };
            case 'CASH':
                return { bg: 'bg-gradient-to-br from-emerald-800 to-emerald-950', border: 'border-emerald-700', text: 'text-emerald-100' };
            default:
                return { bg: 'bg-gradient-to-br from-gray-800 to-gray-950', border: 'border-gray-700', text: 'text-gray-100' };
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header row */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Accounts General Ledger</h2>
                    <p className="text-gray-400 text-sm">Keep record of income and expenditures across company accounts instead of Excel sheets.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={handleExportCSV}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl border border-gray-700 font-semibold transition-colors text-sm">
                        <Download size={16} /> Export CSV
                    </button>
                    <button onClick={() => setShowAddModal(true)}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-[#de1f25]/20 text-sm">
                        <Plus size={16} /> Record Transaction
                    </button>
                </div>
            </header>

            {/* Balances summary cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {ACCOUNTS.map(accName => {
                        const style = getBankStyle(accName);
                        const bankSummary = summary.accounts[accName] || { income: 0, expenditure: 0, balance: 0 };
                        return (
                            <motion.div key={accName} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                className={`${style.bg} border ${style.border} p-5 rounded-2xl shadow-lg text-white relative overflow-hidden`}>
                                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/5" />
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-black uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md">{accName} ACCOUNT</span>
                                    <Landmark size={18} className="opacity-60" />
                                </div>
                                <p className="text-2xl font-black">₦{bankSummary.balance.toLocaleString()}</p>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/70">
                                    <span className="text-emerald-300">In: ₦{bankSummary.income.toLocaleString()}</span>
                                    <span className="text-red-300">Out: ₦{bankSummary.expenditure.toLocaleString()}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Total Balance KPI & Main Ledger Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Ledger Log Panel (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Filter bar */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-50 text-gray-800 font-bold text-sm">
                            <Filter size={15} className="text-[#de1f25]" />
                            <span>Ledger Filters & Search</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-gray-400" size={15} />
                                <input value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search Voucher, Particulars..."
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800" />
                            </div>

                            {/* Type filter */}
                            <select value={type} onChange={e => setType(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800">
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expenditure">Expenditure</option>
                            </select>

                            {/* Account filter */}
                            <select value={account} onChange={e => setAccount(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800">
                                <option value="">All Accounts</option>
                                {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>

                            {/* Category filter */}
                            <select value={category} onChange={e => setCategory(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800">
                                <option value="">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {/* Start date */}
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={12} />
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800" />
                            </div>

                            {/* End date */}
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3.5 text-gray-400" size={12} />
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800" />
                            </div>
                        </div>
                    </div>

                    {/* Table of records */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-black text-gray-900 text-sm">Ledger Entries Log</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">{records.length} records found</span>
                        </div>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="animate-spin text-[#de1f25]" size={28} />
                                <p className="text-xs text-gray-400">Loading ledger data...</p>
                            </div>
                        ) : records.length === 0 ? (
                            <div className="text-center py-16">
                                <Landmark className="mx-auto text-gray-200 mb-3" size={40} />
                                <p className="text-sm font-semibold text-gray-400">No transactions recorded</p>
                                <p className="text-xs text-gray-300 mt-1">Try expanding your search or register a new transaction above.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="px-5 py-3.5">Date</th>
                                            <th className="px-5 py-3.5">Voucher No</th>
                                            <th className="px-5 py-3.5">Particulars</th>
                                            <th className="px-5 py-3.5">Category</th>
                                            <th className="px-5 py-3.5">Account</th>
                                            <th className="px-5 py-3.5">Amount</th>
                                            <th className="px-5 py-3.5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {records.map(rec => (
                                            <tr key={rec._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-3.5 font-medium text-gray-500 shrink-0">
                                                    {new Date(rec.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-5 py-3.5 font-bold text-gray-900 font-mono">
                                                    {rec.voucherNo}
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-600 max-w-[200px] truncate" title={rec.particulars}>
                                                    {rec.particulars}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                        {rec.category}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="font-semibold text-gray-700">{rec.account}</span>
                                                </td>
                                                <td className="px-5 py-3.5 font-black text-sm">
                                                    {rec.type === 'income' ? (
                                                        <span className="text-emerald-600">+₦{rec.amount.toLocaleString()}</span>
                                                    ) : (
                                                        <span className="text-red-500">-₦{rec.amount.toLocaleString()}</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    {['hr', 'ceo', 'superadmin'].includes(user?.role) && (
                                                        <button onClick={() => handleDeleteRecord(rec._id)}
                                                            className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expenditure Categories Analysis (1/3 width) */}
                <div className="space-y-6">
                    {/* Consolidated Balance Card */}
                    {summary && (
                        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">Company Consolidated Cash</p>
                            <p className="text-3xl font-black">₦{summary.totalBalance.toLocaleString()}</p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-200">
                                <TrendingUp size={14} className="text-emerald-400" />
                                <span>Aggregated cash balance in real-time</span>
                            </div>
                        </div>
                    )}

                    {/* Expenditures Category Breakdown */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
                            <h3 className="font-black text-gray-900 text-sm">Expenditure Allocations</h3>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Category Summary</span>
                        </div>
                        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                            {summary && Object.keys(summary.categoryBreakdown).length > 0 ? (
                                Object.entries(summary.categoryBreakdown)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([catName, totalAmount]) => (
                                        <div key={catName} className="space-y-1">
                                            <div className="flex justify-between items-center text-xs font-semibold">
                                                <span className="text-gray-700 truncate max-w-[150px] uppercase">{catName}</span>
                                                <span className="text-gray-900 font-extrabold">₦{totalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#de1f25]"
                                                    style={{ width: `${(totalAmount / (Object.values(summary.categoryBreakdown).reduce((a, b) => a + b, 0) || 1)) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-center py-6 text-gray-400 text-xs font-medium">No expenditure records registered yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Add Record */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col text-gray-800">
                            {/* Header */}
                            <div className="bg-[#de1f25] p-5 text-white flex justify-between items-center relative">
                                <div>
                                    <h3 className="text-lg font-bold">Record Cash / Account Transaction</h3>
                                    <p className="text-xs text-red-100">Add an entry to the company's ledger accounts.</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Date */}
                                    <div>
                                        <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Transaction Date *</label>
                                        <input type="date" required value={formData.date}
                                            onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800" />
                                    </div>

                                    {/* Voucher No */}
                                    <div>
                                        <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Voucher Number *</label>
                                        <input type="text" required placeholder="e.g. AB/05/026/501" value={formData.voucherNo}
                                            onChange={e => setFormData(p => ({ ...p, voucherNo: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800" />
                                    </div>
                                </div>

                                {/* Particulars */}
                                <div>
                                    <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Particulars (Description) *</label>
                                    <textarea required rows={2} placeholder="Brief description of transaction particulars" value={formData.particulars}
                                        onChange={e => setFormData(p => ({ ...p, particulars: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800 resize-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Account */}
                                    <div>
                                        <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Bank / Cash Account *</label>
                                        <select value={formData.account} onChange={e => setFormData(p => ({ ...p, account: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800">
                                            {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Type *</label>
                                        <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value, category: e.target.value === 'income' ? 'SALES' : 'OFFICE MAINT.' }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800">
                                            <option value="expenditure">Expenditure (Debit)</option>
                                            <option value="income">Income (Credit)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Category */}
                                    <div>
                                        <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">GL Category Allocation *</label>
                                        <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800">
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Amount (NGN) *</label>
                                        <input type="number" step="0.01" min="0.01" required placeholder="0.00" value={formData.amount}
                                            onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#de1f25]/20 text-gray-800" />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting}
                                        className="bg-[#de1f25] hover:bg-[#b0181d] text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-[#de1f25]/10 disabled:opacity-60">
                                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                        {submitting ? 'Recording...' : 'Record Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
