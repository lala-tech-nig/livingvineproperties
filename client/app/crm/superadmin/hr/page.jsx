'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { 
    Wallet, UserCheck, Clock, Plus, X, Loader2, RefreshCw, 
    CheckCheck, FileText, Printer, Coins, ShieldAlert, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MANUAL PAYROLL MODAL ---
function AddPayrollModal({ staff, onClose, onCreate }) {
    const [form, setForm] = useState({ 
        userId: '', 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear(), 
        baseSalary: '', 
        bonuses: 0, 
        deductions: 0, 
        notes: '' 
    });
    const [loading, setLoading] = useState(false);

    // Auto-fill details when staff changes
    useEffect(() => {
        if (form.userId) {
            const selected = staff.find(s => s._id === form.userId);
            if (selected) {
                setForm(f => ({
                    ...f,
                    baseSalary: selected.basicSalary || 0,
                    bonuses: selected.bonuses || 0
                }));
            }
        }
    }, [form.userId, staff]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.userId || !form.baseSalary) { 
            toast.error('Select a staff member and enter base salary'); 
            return; 
        }
        setLoading(true);
        try {
            const { data } = await api.post('/hr/payroll', { 
                ...form, 
                baseSalary: Number(form.baseSalary), 
                bonuses: Number(form.bonuses), 
                deductions: Number(form.deductions) 
            });
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Add Manual Payroll Record</h2>
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
                    {form.baseSalary !== '' && (
                        <div className="bg-indigo-50 rounded-xl p-3 text-sm font-semibold text-indigo-900">
                            Net Pay Preview: ₦{(Number(form.baseSalary) + Number(form.bonuses) - Number(form.deductions)).toLocaleString()}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payroll Notes</label>
                        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="e.g. Regular monthly payroll"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 h-16 resize-none" />
                    </div>
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

// --- DETAILED PRINTABLE PAYSLIP MODAL ---
function PayslipModal({ payroll, onClose }) {
    if (!payroll) return null;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const employee = payroll.userId || {};
    
    const handlePrint = () => {
        window.print();
    };

    const grossEarnings = (payroll.baseSalary || 0) + (payroll.bonuses || 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-gray-900 print-container" onClick={e => e.stopPropagation()}>
                
                {/* Payslip Header */}
                <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-extrabold tracking-wider">LIVING VINE PROPERTIES</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Staff Payslip Statement</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block ${
                            payroll.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                            {payroll.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1.5 font-mono">ID: {payroll._id}</p>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {/* Employee Metadata */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-gray-100 text-xs">
                        <div>
                            <p className="text-gray-400 uppercase font-semibold">Employee Name</p>
                            <p className="font-bold text-gray-900 mt-0.5">{employee.firstName} {employee.surname}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 uppercase font-semibold">Employee ID / Code</p>
                            <p className="font-bold text-gray-900 mt-0.5">{employee.idNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 uppercase font-semibold">Department / Role</p>
                            <p className="font-bold text-gray-900 mt-0.5 capitalize">{employee.role || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 uppercase font-semibold">Pay Period</p>
                            <p className="font-bold text-gray-900 mt-0.5">{months[payroll.month - 1]} {payroll.year}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Earnings Section */}
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-gray-200 pb-2 mb-3">Earnings</h3>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Basic Salary</span>
                                    <span className="font-semibold text-gray-900">₦{payroll.baseSalary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bonuses / Allowances</span>
                                    <span className="font-semibold text-gray-900">₦{payroll.bonuses?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-slate-900">
                                    <span>Gross Earnings</span>
                                    <span>₦{grossEarnings.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions Section */}
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-gray-200 pb-2 mb-3">Deductions</h3>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Loan Repayment</span>
                                    <span className="font-semibold text-gray-900">₦{payroll.loanDeduction?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Other Deductions</span>
                                    <span className="font-semibold text-gray-900">₦{((payroll.deductions || 0) - (payroll.loanDeduction || 0)).toLocaleString()}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-slate-900">
                                    <span>Total Deductions</span>
                                    <span>₦{payroll.deductions?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Net Pay Box */}
                    <div className="bg-indigo-600 text-white rounded-2xl p-6 flex justify-between items-center shadow-lg">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">Total Net Payout</p>
                            <p className="text-sm text-indigo-100 font-medium mt-0.5">Take home salary for this period</p>
                        </div>
                        <p className="text-3xl font-black">₦{payroll.netPay?.toLocaleString()}</p>
                    </div>

                    {/* Loan Breakdown / Repayment Status if applicable */}
                    {payroll.loanId && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                            <Coins className="text-amber-600 mt-0.5 shrink-0" size={18} />
                            <div className="text-xs text-amber-800">
                                <p className="font-bold uppercase tracking-wider">Loan Status Snapshot</p>
                                <p className="mt-1 leading-relaxed">
                                    This payslip includes a monthly loan repayment deduction of <strong>₦{payroll.loanDeduction?.toLocaleString()}</strong>. 
                                    Your outstanding loan balance after this deduction is <strong>₦{payroll.loanRemainingBalance?.toLocaleString()}</strong>.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Payroll Notes */}
                    {payroll.notes && (
                        <div className="border border-gray-150 rounded-xl p-4 text-xs text-gray-500 italic bg-gray-50">
                            <strong>Note:</strong> {payroll.notes}
                        </div>
                    )}

                    {/* Action Panel */}
                    <div className="flex gap-3 pt-4 border-t border-gray-150 print:hidden">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Close Payslip</button>
                        <button type="button" onClick={handlePrint} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <Printer size={16} />
                            Print / Save PDF
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- MAIN SUPERADMIN / HR VIEW ---
export default function SuperadminHR() {
    const [activeTab, setActiveTab] = useState('payroll'); // 'payroll' | 'loans'
    
    // Core HR Data
    const [payrolls, setPayrolls] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loans, setLoans] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    
    // Modals & Forms
    const [showPayrollModal, setShowPayrollModal] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    
    // Auto payroll parameters
    const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);
    const [generateYear, setGenerateYear] = useState(new Date().getFullYear());
    const [generating, setGenerating] = useState(false);

    // New Loan Recording State
    const [newLoan, setNewLoan] = useState({
        userId: '',
        amount: '',
        totalPayable: '',
        monthlyInstallment: '',
        repaymentPlan: ''
    });
    const [recordingLoan, setRecordingLoan] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [payrollRes, staffRes, loansRes] = await Promise.all([
                api.get('/hr/payroll'),
                api.get('/users/all').catch(() => ({ data: [] })),
                api.get('/hr/loans').catch(() => ({ data: [] }))
            ]);
            setPayrolls(payrollRes.data);
            setStaff(staffRes.data.filter(u => u.role !== 'investor'));
            setLoans(loansRes.data);
        } catch (err) {
            toast.error('Failed to load HR and payroll records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchAll(); 
    }, [fetchAll]);

    const handleMarkPaid = async (payrollId) => {
        setUpdatingId(payrollId);
        try {
            const { data } = await api.put(`/hr/payroll/${payrollId}`, { status: 'paid', paymentDate: new Date() });
            setPayrolls(prev => prev.map(p => p._id === payrollId ? data : p));
            toast.success('Payroll marked as paid');
            
            // Reload loans list to update paid status balances
            const loansRes = await api.get('/hr/loans');
            setLoans(loansRes.data);
        } catch (err) {
            toast.error('Update status failed');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAutoGenerate = async () => {
        setGenerating(true);
        const toastId = toast.loading(`Generating payroll for ${generateMonth}/${generateYear}...`);
        try {
            const { data } = await api.post('/hr/payroll/generate', { month: Number(generateMonth), year: Number(generateYear) });
            setPayrolls(data);
            toast.success('Payroll list generated & synced successfully!', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payroll generation failed', { id: toastId });
        } finally {
            setGenerating(false);
        }
    };

    const handleRecordLoan = async (e) => {
        e.preventDefault();
        const { userId, amount, totalPayable, monthlyInstallment, repaymentPlan } = newLoan;
        if (!userId || !amount || !totalPayable || !monthlyInstallment || !repaymentPlan) {
            toast.error('Please complete all loan fields');
            return;
        }
        setRecordingLoan(true);
        const toastId = toast.loading('Recording staff loan...');
        try {
            const { data } = await api.post('/hr/loans', {
                userId,
                amount: Number(amount),
                totalPayable: Number(totalPayable),
                monthlyInstallment: Number(monthlyInstallment),
                repaymentPlan
            });
            setLoans(prev => [data, ...prev]);
            setNewLoan({ userId: '', amount: '', totalPayable: '', monthlyInstallment: '', repaymentPlan: '' });
            toast.success('Loan record created successfully', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record loan', { id: toastId });
        } finally {
            setRecordingLoan(false);
        }
    };

    const totalPending = payrolls.filter(p => p.status === 'pending').length;
    const totalPaidAmount = payrolls.filter(p => p.status === 'paid').reduce((acc, p) => acc + (p.netPay || 0), 0);
    const totalPendingAmount = payrolls.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.netPay || 0), 0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const handleExportBatchPay = () => {
        const periodRecords = payrolls.filter(p => p.month === Number(generateMonth) && p.year === Number(generateYear));
        if (periodRecords.length === 0) {
            toast.error(`No payroll records found for ${months[generateMonth - 1]} ${generateYear}. Please run the generator first.`);
            return;
        }

        const headers = ['DebitAccountNo', 'CreditAccountNo', 'CreditBankCode', 'BeneficiaryName', 'Narration', 'Amount'];
        
        const rows = periodRecords.map(p => {
            const employee = p.userId || {};
            const debitAcc = employee.debitAccountNo || '2045896422';
            const creditAcc = employee.accountNumber || '';
            const bankCode = employee.bankCode || '';
            const fullName = `${employee.firstName || ''} ${employee.surname || ''}`.toUpperCase().trim();
            const narration = `${months[generateMonth - 1]} SALARY ${String(generateYear).slice(-2)}`.toUpperCase();
            const amount = p.netPay || 0;
            
            return [debitAcc, creditAcc, bankCode, fullName, narration, amount].join(',');
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `payroll_${months[generateMonth - 1].toLowerCase()}_${generateYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`EFT Batch upload sheet for ${months[generateMonth - 1]} ${generateYear} downloaded!`);
    };

    return (
        <div className="space-y-8 pb-16">
            
            {/* Print specific CSS helper */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none;
                        border: none;
                        background: white;
                        color: black;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <UserCheck className="text-indigo-400" size={28} />
                        Global HR, Payroll & Loans
                    </h2>
                    <p className="text-gray-400 mt-1">Manage employee attendance profiles, auto-generate payroll records, and coordinate staff loan repayments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchAll} className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowPayrollModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors text-sm">
                        <Plus size={16} /> Add Manual Record
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-800 border border-emerald-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
                        <Wallet size={120} />
                    </div>
                    <Wallet className="mb-4 text-emerald-300" size={28} />
                    <p className="text-emerald-100 text-xs uppercase font-bold tracking-wider">Total Paid (Released)</p>
                    <p className="text-3xl font-black mt-1">₦{totalPaidAmount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
                        <Wallet size={120} />
                    </div>
                    <Wallet className="mb-4 text-rose-455" size={28} />
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Pending (Accrued)</p>
                    <p className="text-3xl font-black mt-1">₦{totalPendingAmount.toLocaleString()}</p>
                </div>
                <div className="bg-amber-600 border border-amber-550 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
                        <Clock size={120} />
                    </div>
                    <Clock className="mb-4 text-amber-200" size={28} />
                    <p className="text-amber-100 text-xs uppercase font-bold tracking-wider">Pending Releases Count</p>
                    <p className="text-3xl font-black mt-1">{totalPending}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 gap-6">
                <button 
                    onClick={() => setActiveTab('payroll')}
                    className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
                        activeTab === 'payroll' 
                            ? 'text-indigo-400 border-indigo-400' 
                            : 'text-gray-400 border-transparent hover:text-gray-200'
                    }`}
                >
                    Payroll Ledgers
                </button>
                <button 
                    onClick={() => setActiveTab('loans')}
                    className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
                        activeTab === 'loans' 
                            ? 'text-indigo-400 border-indigo-400' 
                            : 'text-gray-400 border-transparent hover:text-gray-200'
                    }`}
                >
                    Staff Loan Management
                </button>
            </div>

            {/* TAB CONTENT: PAYROLL */}
            {activeTab === 'payroll' && (
                <div className="space-y-6">
                    {/* Auto Generate Action Card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Coins className="text-amber-500" size={18} />
                                Auto-Generate Staff Monthly Payroll
                            </h3>
                            <p className="text-xs text-gray-400">
                                Instantly create pending draft payroll records for all operational staff. The system applies basic salary, allowances, and auto-calculates active loan installments.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                            <select 
                                value={generateMonth} 
                                onChange={e => setGenerateMonth(Number(e.target.value))}
                                className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-indigo-500"
                            >
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                            <input 
                                type="number" 
                                value={generateYear} 
                                onChange={e => setGenerateYear(Number(e.target.value))}
                                className="bg-gray-955 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none w-20 focus:border-indigo-500"
                            />
                            <button 
                                onClick={handleAutoGenerate}
                                disabled={generating}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                                {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                                Run Generator
                            </button>
                            <button 
                                onClick={handleExportBatchPay}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                            >
                                <FileText size={13} />
                                Export Batch Sheet
                            </button>
                        </div>
                    </div>

                    {/* Payroll Ledger */}
                    <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Period</th>
                                        <th className="px-6 py-4">Base Salary</th>
                                        <th className="px-6 py-4">Deductions</th>
                                        <th className="px-6 py-4">Net Payout</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-900">
                                    {loading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan="7" className="px-6 py-4">
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
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                                <Wallet size={36} className="mx-auto mb-3 opacity-20" />
                                                <p className="text-sm font-medium">No payroll ledger records found.</p>
                                                <p className="text-xs mt-1">Use the Auto-Generator or click "Add Manual Record" above.</p>
                                            </td>
                                        </tr>
                                    ) : payrolls.map(pay => (
                                        <tr key={pay._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                                        {pay.userId?.firstName?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{pay.userId?.firstName} {pay.userId?.surname}</p>
                                                        <p className="text-xs text-gray-500">ID: {pay.userId?.idNumber || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                {months[pay.month - 1]} {pay.year}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-gray-600">
                                                ₦{pay.baseSalary?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-rose-650">₦{pay.deductions?.toLocaleString() || '0'}</span>
                                                {pay.loanDeduction > 0 && (
                                                    <div className="text-[10px] text-amber-600 font-medium mt-0.5">Includes Loan deduction</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                                                ₦{pay.netPay?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    pay.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    pay.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {pay.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button 
                                                        onClick={() => setSelectedPayslip(pay)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-950 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <FileText size={13} />
                                                        Payslip
                                                    </button>
                                                    {pay.status !== 'paid' && (
                                                        <button
                                                            onClick={() => handleMarkPaid(pay._id)}
                                                            disabled={updatingId === pay._id}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-150 transition-colors disabled:opacity-50"
                                                        >
                                                            {updatingId === pay._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                                                            Pay
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: LOANS */}
            {activeTab === 'loans' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Add Loan Form */}
                    <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit space-y-4">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Coins className="text-amber-500" size={18} />
                                Record New Loan Collection
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Setup staff loan profile. Dues are auto-recovered monthly from generated payrolls.</p>
                        </div>
                        
                        <form onSubmit={handleRecordLoan} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Staff Beneficiary</label>
                                <select 
                                    value={newLoan.userId} 
                                    onChange={e => setNewLoan(l => ({ ...l, userId: e.target.value }))}
                                    className="w-full bg-gray-955 border border-gray-850 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-indigo-500"
                                >
                                    <option value="">Select staff member...</option>
                                    {staff.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.surname} ({s.role})</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Loan Amount (₦)</label>
                                <input 
                                    type="number" 
                                    value={newLoan.amount} 
                                    onChange={e => setNewLoan(l => ({ ...l, amount: e.target.value }))}
                                    placeholder="e.g. 50000"
                                    className="w-full bg-gray-955 border border-gray-855 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Total Payable (₦)</label>
                                    <input 
                                        type="number" 
                                        value={newLoan.totalPayable} 
                                        onChange={e => setNewLoan(l => ({ ...l, totalPayable: e.target.value }))}
                                        placeholder="Principal + interest"
                                        className="w-full bg-gray-955 border border-gray-855 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Installment (₦)</label>
                                    <input 
                                        type="number" 
                                        value={newLoan.monthlyInstallment} 
                                        onChange={e => setNewLoan(l => ({ ...l, monthlyInstallment: e.target.value }))}
                                        placeholder="Monthly deduction"
                                        className="w-full bg-gray-955 border border-gray-855 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Repayment Plan Description</label>
                                <input 
                                    type="text" 
                                    value={newLoan.repaymentPlan} 
                                    onChange={e => setNewLoan(l => ({ ...l, repaymentPlan: e.target.value }))}
                                    placeholder="e.g. ₦10,000 monthly deduction for 5 months"
                                    className="w-full bg-gray-955 border border-gray-855 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={recordingLoan}
                                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {recordingLoan ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                Add Loan Ledger Record
                            </button>
                        </form>
                    </div>

                    {/* Loans Ledger Table */}
                    <div className="lg:col-span-2 bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden h-fit">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <Coins size={18} className="text-amber-500" />
                            <h3 className="text-base font-bold text-gray-900">Staff Loan Repayment Ledger</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3.5">Staff Member</th>
                                        <th className="px-6 py-3.5">Principal / Payable</th>
                                        <th className="px-6 py-3.5">Installment</th>
                                        <th className="px-6 py-3.5">Progress / Recovery</th>
                                        <th className="px-6 py-3.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs text-gray-900">
                                    {loading ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan="5" className="px-6 py-4">
                                                    <div className="animate-pulse space-y-2">
                                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                                        <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : loans.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                                <Coins size={32} className="mx-auto mb-2.5 opacity-20" />
                                                <p className="text-sm font-semibold">No loans recorded yet.</p>
                                                <p className="text-xs">Setup a staff loan using the panel on the left.</p>
                                            </td>
                                        </tr>
                                    ) : loans.map(loan => {
                                        const percentPaid = Math.round(Math.min(((loan.totalPaid || 0) / loan.totalPayable) * 100, 100));
                                        return (
                                            <tr key={loan._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">{loan.userId?.firstName} {loan.userId?.surname}</p>
                                                    <p className="text-[10px] text-gray-550 font-medium capitalize mt-0.5">{loan.userId?.role}</p>
                                                </td>
                                                <td className="px-6 py-4 font-medium font-mono text-gray-700">
                                                    <div>₦{loan.amount?.toLocaleString()}</div>
                                                    <div className="text-[10px] text-gray-550 mt-0.5">Payable: ₦{loan.totalPayable?.toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-800 font-mono">₦{loan.monthlyInstallment?.toLocaleString()}</span>
                                                    <div className="text-[10px] text-gray-550 mt-0.5 italic max-w-[150px] truncate" title={loan.repaymentPlan}>
                                                        {loan.repaymentPlan}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex-1 h-2 bg-gray-100 rounded-full border border-gray-150 overflow-hidden min-w-[70px]">
                                                            <div 
                                                                className={`h-full rounded-full ${loan.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`}
                                                                style={{ width: `${percentPaid}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold font-mono text-gray-700 shrink-0">{percentPaid}%</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 mt-1 font-mono">
                                                        ₦{(loan.totalPaid || 0).toLocaleString()} / ₦{loan.totalPayable.toLocaleString()} paid
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                                        loan.status === 'paid' 
                                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {loan.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALS */}
            <AnimatePresence>
                {showPayrollModal && (
                    <AddPayrollModal
                        staff={staff}
                        onClose={() => setShowPayrollModal(false)}
                        onCreate={(record) => setPayrolls(prev => [record, ...prev])}
                    />
                )}
                {selectedPayslip && (
                    <PayslipModal
                        payroll={selectedPayslip}
                        onClose={() => setSelectedPayslip(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
