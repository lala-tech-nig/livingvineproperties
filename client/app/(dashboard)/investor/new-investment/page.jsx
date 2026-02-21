'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { ChevronLeft, Info, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function NewInvestment() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contactAddress: '',
        phoneNumber: '',
        amountToInvest: '',
        durationInMonths: '6',
        principalActionAfterMaturity: 'rollover_all',
        nin: '',
        bvn: '',
        accountDetails: {
            bankName: '',
            accountNumber: '',
            accountName: ''
        },
        nextOfKin: {
            fullName: '',
            address: '',
            phoneNumber: '',
            relationship: ''
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/investments', { ...formData, date: new Date().toISOString() });
            toast.success('Investment submitted successfully! It is now under review.', { duration: 5000 });
            router.push('/investor');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/investor" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Start New Investment</h2>
                    <p className="text-gray-500 text-sm">Fill out the details below to initiate a new portfolio plan.</p>
                </div>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-8"
            >
                {/* Personal Details */}
                <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-6">1. Investor Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900"
                                placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900"
                                placeholder="john@example.com" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Address</label>
                            <input required type="text" name="contactAddress" value={formData.contactAddress} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900"
                                placeholder="123 Living Vine St., Lagos" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input required type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900"
                                placeholder="+234 800..." />
                        </div>
                    </div>
                </section>

                {/* Investment Details */}
                <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">2. Investment Plan Details</h3>
                        <span className="text-xs bg-green-50 text-green-700 px-3 py-1 flex items-center gap-1 rounded-full font-medium border border-green-200"><Info size={14} /> Returns up to 40%</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Invest (₦)</label>
                            <input required type="number" min="100000" name="amountToInvest" value={formData.amountToInvest} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900 text-lg font-semibold"
                                placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Months)</label>
                            <select required name="durationInMonths" value={formData.durationInMonths} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900 text-lg">
                                <option value="6">6 Months</option>
                                <option value="12">12 Months (1 Year)</option>
                                <option value="24">24 Months (2 Years)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Principal Action After Maturity</label>
                            <select required name="principalActionAfterMaturity" value={formData.principalActionAfterMaturity} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900">
                                <option value="rollover_all">Rollover Capital + ROI</option>
                                <option value="withdraw_roi">Withdraw ROI, Rollover Capital</option>
                                <option value="liquidate_all">Liquidate completely</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Identity & Banking */}
                <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-6">3. Identity & Payout Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-gray-100 pb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">NIN (National Identity Number)</label>
                            <input required type="text" name="nin" value={formData.nin} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900 tracking-widest font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">BVN (Bank Verification Number)</label>
                            <input required type="text" name="bvn" value={formData.bvn} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900 tracking-widest font-mono" />
                        </div>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">ROI Domiciliation Account</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                            <input required type="text" name="accountDetails.bankName" value={formData.accountDetails.bankName} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                            <input required type="text" name="accountDetails.accountNumber" value={formData.accountDetails.accountNumber} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900 font-mono tracking-widest" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                            <input required type="text" name="accountDetails.accountName" value={formData.accountDetails.accountName} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900" />
                        </div>
                    </div>
                </section>

                {/* Next of Kin */}
                <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-6">4. Next of Kin Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input required type="text" name="nextOfKin.fullName" value={formData.nextOfKin.fullName} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                            <input required type="text" name="nextOfKin.relationship" value={formData.nextOfKin.relationship} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900"
                                placeholder="e.g. Spouse / Sibling" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Residential Address</label>
                            <input required type="text" name="nextOfKin.address" value={formData.nextOfKin.address} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input required type="tel" name="nextOfKin.phoneNumber" value={formData.nextOfKin.phoneNumber} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 focus:bg-white text-gray-900" />
                        </div>
                    </div>
                </section>

                <div className="flex gap-4 items-center border-t border-gray-200 pt-8 mt-8">
                    <Link href="/investor" className="px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit" disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 transform flex items-center justify-center gap-2"
                    >
                        {loading ? 'Submitting Application...' : 'Submit Investment Application'}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
