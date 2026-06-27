'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Landmark, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    Trash2, RefreshCw, ChevronDown, ChevronUp, Loader2, DollarSign, X
} from 'lucide-react';

const BANKS = [
    'Access Bank','Citibank Nigeria','Ecobank Nigeria','Fidelity Bank','First Bank of Nigeria',
    'First City Monument Bank (FCMB)','Guaranty Trust Bank (GTBank)','Heritage Bank','Jaiz Bank',
    'Keystone Bank','Polaris Bank','Stanbic IBTC Bank','Sterling Bank','Union Bank of Nigeria',
    'United Bank for Africa (UBA)','Unity Bank','Wema Bank','Zenith Bank',
];

function fmt(n) { return `₦${Number(n || 0).toLocaleString()}`; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }

export default function CEOFinancePage() {
    const [accounts, setAccounts]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedId, setExpandedId]   = useState(null);
    const [txDetail, setTxDetail]       = useState({}); // id -> transactions
    const [txLoading, setTxLoading]     = useState({});

    // Add account form
    const [newAcc, setNewAcc] = useState({ bankName: '', accountNumber: '', accountName: '', openingBalance: '' });
    const [adding, setAdding] = useState(false);

    // Transaction entry
    const [txForm, setTxForm] = useState({ accountId: '', type: 'credit', amount: '', description: '' });
    const [txSaving, setTxSaving] = useState(false);

    useEffect(() => { fetchAccounts(); }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/finance/accounts');
            setAccounts(data);
        } catch { toast.error('Failed to load accounts'); }
        finally { setLoading(false); }
    };

    const fetchTransactions = async (id) => {
        setTxLoading(p => ({ ...p, [id]: true }));
        try {
            const { data } = await api.get(`/finance/accounts/${id}`);
            setTxDetail(p => ({ ...p, [id]: data.transactions || [] }));
        } catch { toast.error('Failed to load transactions'); }
        finally { setTxLoading(p => ({ ...p, [id]: false })); }
    };

    const toggleExpand = (id) => {
        if (expandedId === id) { setExpandedId(null); return; }
        setExpandedId(id);
        if (!txDetail[id]) fetchTransactions(id);
    };

    const handleAddAccount = async (e) => {
        e.preventDefault();
        if (!newAcc.bankName || !newAcc.accountNumber || !newAcc.accountName) {
            toast.error('All account fields are required'); return;
        }
        setAdding(true);
        try {
            const { data } = await api.post('/finance/accounts', newAcc);
            setAccounts(prev => [data, ...prev]);
            setNewAcc({ bankName: '', accountNumber: '', accountName: '', openingBalance: '' });
            setShowAddModal(false);
            toast.success('Account added!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to add account'); }
        finally { setAdding(false); }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        if (!txForm.amount || !txForm.description || !txForm.accountId) {
            toast.error('Fill all transaction fields'); return;
        }
        setTxSaving(true);
        try {
            const { data } = await api.post(`/finance/accounts/${txForm.accountId}/${txForm.type}`, {
                amount: txForm.amount, description: txForm.description
            });
            // Refresh account balance
            setAccounts(prev => prev.map(a => a._id === txForm.accountId ? { ...a, balance: data.balance } : a));
            // Refresh transactions if expanded
            if (expandedId === txForm.accountId) fetchTransactions(txForm.accountId);
            setTxForm(p => ({ ...p, amount: '', description: '' }));
            toast.success(`${txForm.type === 'credit' ? 'Credit' : 'Debit'} entry saved!`);
        } catch (err) { toast.error(err.response?.data?.message || 'Transaction failed'); }
        finally { setTxSaving(false); }
    };

    const handleDeactivate = async (id) => {
        if (!confirm('Deactivate this account?')) return;
        try {
            await api.delete(`/finance/accounts/${id}`);
            setAccounts(prev => prev.filter(a => a._id !== id));
            toast.success('Account deactivated');
        } catch { toast.error('Failed to deactivate'); }
    };

    const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Finance & Accounts</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage company bank accounts, credits and debits.</p>
                </div>
                <button onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#de1f25]/20">
                    <Plus size={18} /> Add Account
                </button>
            </div>

            {/* Total Balance card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="relative z-10">
                    <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Landmark size={16} /> Total Company Balance
                    </p>
                    <p className="text-5xl font-black mb-4">{fmt(totalBalance)}</p>
                    <div className="flex gap-6 text-sm">
                        <div className="bg-white/10 rounded-xl px-4 py-2">
                            <p className="text-indigo-200 text-xs">Active Accounts</p>
                            <p className="font-bold text-lg">{accounts.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction entry form */}
            {accounts.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign size={18} className="text-[#de1f25]" /> Record a Transaction
                    </h3>
                    <form onSubmit={handleTransaction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Account</label>
                            <select value={txForm.accountId} onChange={e => setTxForm(p => ({ ...p, accountId: e.target.value }))} required
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm">
                                <option value="">Select account</option>
                                {accounts.map(a => <option key={a._id} value={a._id}>{a.bankName} – {a.accountNumber}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Type</label>
                            <div className="flex gap-2">
                                {['credit', 'debit'].map(t => (
                                    <button key={t} type="button" onClick={() => setTxForm(p => ({ ...p, type: t }))}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${txForm.type === t
                                            ? t === 'credit' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                                            : 'bg-gray-100 text-gray-500'}`}>
                                        {t === 'credit' ? '↑ Credit' : '↓ Debit'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Amount (₦)</label>
                            <input type="number" value={txForm.amount} onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))}
                                placeholder="0.00" required min="1"
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description</label>
                            <div className="flex gap-2">
                                <input type="text" value={txForm.description} onChange={e => setTxForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="e.g. Office rent" required
                                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm" />
                                <button type="submit" disabled={txSaving}
                                    className="bg-gray-900 hover:bg-black text-white font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                                    {txSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Accounts list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-[#de1f25]" />
                </div>
            ) : accounts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <Landmark size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-500 font-semibold">No accounts registered yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Add a company bank account to get started.</p>
                    <button onClick={() => setShowAddModal(true)}
                        className="mt-5 bg-[#de1f25] text-white font-bold px-6 py-2.5 rounded-xl text-sm">
                        Add First Account
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {accounts.map(acc => (
                        <motion.div key={acc._id} layout className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Account row */}
                            <div className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Landmark size={22} className="text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900">{acc.bankName}</p>
                                    <p className="text-sm font-mono text-gray-500 tracking-widest">{acc.accountNumber}</p>
                                    <p className="text-xs text-gray-400">{acc.accountName}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Balance</p>
                                    <p className={`text-xl font-black ${acc.balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                        {fmt(acc.balance)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => toggleExpand(acc._id)}
                                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                        {expandedId === acc._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    <button onClick={() => handleDeactivate(acc._id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded transactions */}
                            <AnimatePresence>
                                {expandedId === acc._id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }} className="border-t border-gray-100 overflow-hidden">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-gray-700">Transaction History</h4>
                                                <button onClick={() => fetchTransactions(acc._id)} className="text-gray-400 hover:text-gray-600">
                                                    {txLoading[acc._id] ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                </button>
                                            </div>
                                            {!txDetail[acc._id] || txLoading[acc._id] ? (
                                                <div className="py-6 text-center"><Loader2 size={20} className="animate-spin text-gray-300 mx-auto" /></div>
                                            ) : txDetail[acc._id].length === 0 ? (
                                                <p className="text-sm text-gray-400 text-center py-4">No transactions yet.</p>
                                            ) : (
                                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                                    {[...txDetail[acc._id]].reverse().map((tx, i) => (
                                                        <div key={tx._id || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                                                {tx.type === 'credit' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-gray-800 truncate">{tx.description}</p>
                                                                <p className="text-[10px] text-gray-400">{fmtDate(tx.date)}</p>
                                                            </div>
                                                            <p className={`text-sm font-bold shrink-0 ${tx.type === 'credit' ? 'text-green-700' : 'text-red-500'}`}>
                                                                {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Account Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Add Company Bank Account</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleAddAccount} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Bank Name</label>
                                    <select value={newAcc.bankName} onChange={e => setNewAcc(p => ({ ...p, bankName: e.target.value }))} required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900">
                                        <option value="">Select bank</option>
                                        {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Account Number</label>
                                    <input type="text" value={newAcc.accountNumber}
                                        onChange={e => setNewAcc(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))}
                                        maxLength="10" placeholder="10-digit number" required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-mono tracking-widest" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Account Name</label>
                                    <input type="text" value={newAcc.accountName}
                                        onChange={e => setNewAcc(p => ({ ...p, accountName: e.target.value }))}
                                        placeholder="Living Vine Properties Ltd" required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Opening Balance (optional)</label>
                                    <input type="number" value={newAcc.openingBalance}
                                        onChange={e => setNewAcc(p => ({ ...p, openingBalance: e.target.value }))}
                                        placeholder="0.00" min="0"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={adding}
                                        className="flex-1 py-3 rounded-xl bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                                        {adding ? <Loader2 size={16} className="animate-spin" /> : null}
                                        {adding ? 'Adding...' : 'Add Account'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
