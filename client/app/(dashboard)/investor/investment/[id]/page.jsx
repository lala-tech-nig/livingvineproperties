'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ChevronLeft, MessageSquare, AlertCircle, CheckCircle, Send, XCircle } from 'lucide-react';

export default function InvestmentDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();

    const [investment, setInvestment] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [{ data: invData }, { data: comData }] = await Promise.all([
                api.get(`/investments/${id}`),
                api.get(`/comments/${id}`)
            ]);
            setInvestment(invData);
            setComments(comData);
        } catch (error) {
            toast.error('Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const { data } = await api.post(`/comments/${id}`, { message: newComment });
            setComments([...comments, data]);
            setNewComment('');
        } catch (error) {
            toast.error('Failed to send comment');
        }
    };

    const handleLiquidate = async () => {
        if (!confirm("Are you sure you want to request liquidation? This might incur early liquidation fees depending on your duration.")) return;
        try {
            await api.put(`/investments/${id}/status`, { status: 'liquidated' });
            toast.success('Liquidation request sent');
            fetchData();
        } catch (error) {
            toast.error('Failed to request liquidation');
        }
    };

    const handleStatusUpdate = async (newStatus, paymentAcc = null) => {
        try {
            if (!confirm(`Are you sure you want to mark this investment as ${newStatus.toUpperCase()}?`)) return;
            const payload = { status: newStatus };
            if (paymentAcc) payload.ceoPaymentAccount = paymentAcc;

            const { data } = await api.put(`/investments/${id}/status`, payload);
            setInvestment(data);
            toast.success(`Investment status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!investment) return <div className="p-10 text-center">Investment not found</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        Investment Overview
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${investment.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                            investment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                investment.status === 'declined' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {investment.status.toUpperCase()}
                        </span>
                    </h2>
                    <p className="text-gray-500 font-mono text-sm mt-1">REF: {investment._id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Total Capital Invested</p>
                            <h3 className="text-4xl font-bold text-gray-900">₦{investment.amountToInvest?.toLocaleString()}</h3>
                        </div>
                        <div className="mt-4 sm:mt-0 text-left sm:text-right">
                            <p className="text-gray-500 text-sm mb-1">Expected ROI</p>
                            <h3 className="text-3xl font-bold text-green-600">₦{investment.expectedROI?.toLocaleString()}</h3>
                            <p className="text-xs text-gray-400 mt-1">{investment.durationInMonths} Months Duration</p>
                        </div>
                    </section>

                    {investment.status === 'approved' && investment.ceoPaymentAccount && (
                        <motion.section
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-50 p-6 rounded-2xl border border-green-200"
                        >
                            <div className="flex items-start gap-4">
                                <CheckCircle className="text-green-600 mt-1" size={24} />
                                <div>
                                    <h3 className="text-lg font-bold text-green-900 mb-2">Investment Approved! Please Make Payment</h3>
                                    <p className="text-green-800 mb-4">Transfer your investment capital to the following company account to activate your portfolio completely.</p>
                                    <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm inline-block">
                                        <p className="text-sm text-gray-500 mb-1">Bank Name: <span className="font-bold text-gray-900 ml-2">{investment.ceoPaymentAccount.bankName}</span></p>
                                        <p className="text-sm text-gray-500 mb-1">Account Number: <span className="font-bold text-gray-900 ml-2 font-mono tracking-widest text-lg">{investment.ceoPaymentAccount.accountNumber}</span></p>
                                        <p className="text-sm text-gray-500">Account Name: <span className="font-bold text-gray-900 ml-2">{investment.ceoPaymentAccount.accountName}</span></p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900">Portfolio Details</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                            <div><p className="text-sm text-gray-500">Investor Name</p><p className="font-medium text-gray-900">{investment.name}</p></div>
                            <div><p className="text-sm text-gray-500">Action At Maturity</p><p className="font-medium text-gray-900 capitalize">{investment.principalActionAfterMaturity?.replace('_', ' ')}</p></div>
                            <div><p className="text-sm text-gray-500">Initiation Date</p><p className="font-medium text-gray-900">{new Date(investment.startDate).toLocaleDateString()}</p></div>
                            <div><p className="text-sm text-gray-500">BVN</p><p className="font-medium text-gray-900 font-mono">*** *** {investment.bvn?.slice(-4)}</p></div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Your Payout Account</p>
                                <p className="font-medium text-gray-900 text-sm">{investment.accountDetails?.bankName}</p>
                                <p className="font-medium text-gray-500 text-xs">{investment.accountDetails?.accountNumber}</p>
                            </div>
                        </div>
                    </section>

                    <div className="flex gap-4 flex-wrap">
                        {user?.role === 'investor' && investment.status !== 'liquidated' && (
                            <button onClick={handleLiquidate} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-100">
                                <AlertCircle size={18} />
                                Request Liquidation
                            </button>
                        )}

                        {user?.role === 'management' && investment.status !== 'liquidated' && (
                            <>
                                <button onClick={() => handleStatusUpdate('reviewing')} className="bg-yellow-50 text-yellow-700 px-6 py-3 rounded-xl font-bold hover:bg-yellow-100 border border-yellow-200">Flag for Review</button>
                                <button onClick={() => handleStatusUpdate('retreated')} className="bg-orange-50 text-orange-700 px-6 py-3 rounded-xl font-bold hover:bg-orange-100 border border-orange-200">Retreat (Needs rework)</button>
                                <button onClick={() => handleStatusUpdate('declined')} className="bg-red-50 text-red-700 px-6 py-3 rounded-xl font-bold hover:bg-red-100 border border-red-200">Decline</button>
                            </>
                        )}

                        {user?.role === 'ceo' && investment.status !== 'liquidated' && (
                            <>
                                <button
                                    onClick={() => {
                                        const bankName = prompt("Enter Target Bank Name:");
                                        if (!bankName) return;
                                        const accountNumber = prompt("Enter Target Account Number:");
                                        if (!accountNumber) return;
                                        const accountName = prompt("Enter Target Account Name:");
                                        if (!accountName) return;

                                        handleStatusUpdate('approved', { bankName, accountNumber, accountName });
                                    }}
                                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md shadow-green-600/20"
                                >
                                    Approve & Supply Account
                                </button>
                                <button onClick={() => handleStatusUpdate('declined')} className="bg-red-50 text-red-700 px-6 py-3 rounded-xl font-bold hover:bg-red-100 border border-red-200">Decline Application</button>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column: Communications */}
                <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={20} />
                        <h3 className="font-bold text-gray-900">Activity & Comments</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-center text-gray-400 my-10 text-sm">No activities or comments yet.</p>
                        ) : (
                            comments.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.userId?._id === user?.id ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-gray-400 mb-1 ml-1 uppercase">{msg.role}</span>
                                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${msg.userId?._id === user?.id
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : msg.role === 'management' || msg.role === 'ceo'
                                            ? 'bg-slate-800 text-white rounded-tl-sm'
                                            : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                                        }`}>
                                        <p className="text-sm">{msg.message}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white">
                        <form onSubmit={handleComment} className="flex gap-2">
                            <input
                                type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                                placeholder="Drop a comment or instruction..."
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                            />
                            <button disabled={!newComment.trim()} type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0">
                                <Send size={18} className="ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
