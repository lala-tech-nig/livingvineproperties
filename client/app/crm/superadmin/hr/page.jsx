'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { Wallet, UserCheck, Clock, Plus, X, Loader2, RefreshCw, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AddPayrollModal({ staff, onClose, onCreate }) {
    const [form, setForm] = useState({ userId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), baseSalary: '', bonuses: 0, deductions: 0, notes: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.userId || !form.baseSalary) { toast.error('Select a staff member and enter base salary'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('/hr/payroll', { ...form, baseSalary: Number(form.baseSalary), bonuses: Number(form.bonuses), deductions: Number(form.deductions) });
            onCreate(data);
            toast.success('Payroll record created');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create payroll');
        } finally {
            setLoading(false);
        }
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Add Payroll Record</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Staff Member</label>
                        <select value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer">
                            <option value="">Select staff...</option>
                            {staff.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.surname} ({s.role})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Month</label>
                            <select value={form.month} onChange={e => setForm(f => ({ ...f, month: Number(e.target.value) }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer">
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year</label>
                            <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[['Base Salary ₦', 'baseSalary'], ['Bonuses ₦', 'bonuses'], ['Deductions ₦', 'deductions']].map(([label, field]) => (
                            <div key={field}>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                                <input type="number" min="0" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30" />
                            </div>
                        ))}
                    </div>
                    {form.baseSalary && (
                        <div className="bg-indigo-50 rounded-xl p-3 text-sm font-semibold text-indigo-900">
                            Net Pay: ₦{(Number(form.baseSalary) + Number(form.bonuses) - Number(form.deductions)).toLocaleString()}
                        </div>
                    )}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? 'Saving...' : 'Add Record'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

export default function SuperadminHR() {
    const [payrolls, setPayrolls] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [payrollRes, staffRes] = await Promise.all([
                api.get('/hr/payroll'),
                api.get('/users/all').catch(() => ({ data: [] }))
            ]);
            setPayrolls(payrollRes.data);
            setStaff(staffRes.data.filter(u => u.role !== 'investor'));
        } catch (err) {
            toast.error('Failed to load HR data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleMarkPaid = async (payrollId) => {
        setUpdatingId(payrollId);
        try {
            const { data } = await api.put(`/hr/payroll/${payrollId}`, { status: 'paid', paymentDate: new Date() });
            setPayrolls(prev => prev.map(p => p._id === payrollId ? data : p));
            toast.success('Marked as paid');
        } catch (err) {
            toast.error('Update failed');
        } finally {
            setUpdatingId(null);
        }
    };

    const totalPending = payrolls.filter(p => p.status === 'pending').length;
    const totalNetPay = payrolls.reduce((acc, p) => acc + (p.netPay || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Global Payroll & HR</h2>
                    <p className="text-gray-400 mt-1">Monitor staff payments, attendance, and performance across the company.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchAll} className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors text-sm">
                        <Plus size={16} /> Add Record
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-800">
                    <Wallet className="mb-4 opacity-60" size={28} />
                    <p className="text-indigo-300 text-sm">Total Net Payout</p>
                    <p className="text-3xl font-bold">₦{totalNetPay.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-700 text-white p-6 rounded-2xl shadow-lg border border-emerald-600">
                    <UserCheck className="mb-4 opacity-60" size={28} />
                    <p className="text-emerald-200 text-sm">Payroll Records</p>
                    <p className="text-3xl font-bold">{payrolls.length}</p>
                </div>
                <div className="bg-amber-600 text-white p-6 rounded-2xl shadow-lg border border-amber-500">
                    <Clock className="mb-4 opacity-60" size={28} />
                    <p className="text-amber-100 text-sm">Pending Payment</p>
                    <p className="text-3xl font-bold">{totalPending}</p>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Staff Payroll Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Period</th>
                                <th className="px-6 py-4">Base Salary</th>
                                <th className="px-6 py-4">Net Pay</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="6" className="px-6 py-4">
                                            <div className="animate-pulse flex gap-4 items-center">
                                                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                                                    <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : payrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        <Wallet size={36} className="mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No payroll records. Click "Add Record" to get started.</p>
                                    </td>
                                </tr>
                            ) : payrolls.map(pay => (
                                <motion.tr key={pay._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                {pay.userId?.firstName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{pay.userId?.firstName} {pay.userId?.surname}</p>
                                                <p className="text-xs text-gray-500">{pay.userId?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][pay.month - 1]} {pay.year}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">₦{pay.baseSalary?.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">₦{pay.netPay?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            pay.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            pay.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                            {pay.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {pay.status !== 'paid' && (
                                            <button
                                                onClick={() => handleMarkPaid(pay._id)}
                                                disabled={updatingId === pay._id}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                                            >
                                                {updatingId === pay._id ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
                                                Mark Paid
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <AddPayrollModal
                        staff={staff}
                        onClose={() => setShowModal(false)}
                        onCreate={(record) => setPayrolls(prev => [record, ...prev])}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
