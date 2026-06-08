'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { ChevronLeft, Info, CheckCircle2, ShieldCheck, Landmark, User, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const NIGERIAN_BANKS = [
    'Access Bank',
    'Citibank Nigeria',
    'Ecobank Nigeria',
    'Fidelity Bank',
    'First Bank of Nigeria',
    'First City Monument Bank (FCMB)',
    'Globus Bank',
    'Guaranty Trust Bank (GTBank)',
    'Heritage Bank',
    'Jaiz Bank',
    'Keystone Bank',
    'Lotus Bank',
    'Optimus Bank',
    'Parallex Bank',
    'Polaris Bank',
    'PremiumTrust Bank',
    'Providus Bank',
    'Signature Bank',
    'Stanbic IBTC Bank',
    'Standard Chartered Bank',
    'Sterling Bank',
    'SunTrust Bank',
    'Taj Bank',
    'Titan Trust Bank',
    'Union Bank of Nigeria',
    'United Bank for Africa (UBA)',
    'Unity Bank',
    'Wema Bank',
    'Zenith Bank'
];

export default function NewInvestment() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [products, setProducts] = useState([]);
    
    // Identity verification states
    const [idType, setIdType] = useState('bvn'); // 'nin' or 'bvn'
    const [idNumber, setIdNumber] = useState('');
    const [verifiedRecord, setVerifiedRecord] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contactAddress: '',
        phoneNumber: '',
        amountToInvest: '',
        displayAmount: '', // comma formatted display
        productId: '',
        selectedProduct: null,
        durationInMonths: '',
        principalActionAfterMaturity: '',
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

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/investment-products');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load active investment products');
        }
    };

    // Format currency inputs
    const handleAmountChange = (e) => {
        const val = e.target.value;
        const clean = val.replace(/\D/g, '');
        const formatted = clean.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        setFormData(prev => ({
            ...prev,
            amountToInvest: parseInt(clean) || 0,
            displayAmount: formatted ? `₦ ${formatted}` : ''
        }));
    };

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

    // Identity Verification (Step 1)
    const handleVerifyIdentity = async () => {
        if (!idNumber || idNumber.trim().length < 10) {
            toast.error('Please enter a valid NIN or BVN number.');
            return;
        }

        setVerifying(true);
        try {
            const { data } = await api.get(`/investments/verify-identity?type=${idType}&number=${idNumber}`);
            setVerifiedRecord(data);
            
            // Populate form values
            setFormData(prev => ({
                ...prev,
                name: data.name,
                email: data.email,
                phoneNumber: data.phoneNumber,
                contactAddress: data.contactAddress,
                nin: idType === 'nin' ? idNumber : '',
                bvn: idType === 'bvn' ? idNumber : ''
            }));
            
            toast.success(`Identity Verified: ${data.name}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Identity verification failed.');
            setVerifiedRecord(null);
        } finally {
            setVerifying(false);
        }
    };

    const handleProductSelect = (product) => {
        setFormData(prev => ({
            ...prev,
            productId: product._id,
            selectedProduct: product,
            durationInMonths: product.durationInMonths,
            principalActionAfterMaturity: product.principalOptions?.[0] || 'rollover_all'
        }));
    };

    const handleNextStep = () => {
        if (step === 1 && !verifiedRecord) {
            toast.error('Please verify your NIN/BVN identity to proceed.');
            return;
        }
        if (step === 2 && !formData.productId) {
            toast.error('Please select an investment product package.');
            return;
        }
        if (step === 3) {
            if (!formData.amountToInvest || formData.amountToInvest < 100000) {
                toast.error('Minimum investment amount is ₦100,000.');
                return;
            }
            if (!formData.accountDetails.bankName || !formData.accountDetails.accountNumber || !formData.accountDetails.accountName) {
                toast.error('Please fill in complete payout bank account details.');
                return;
            }
            if (formData.accountDetails.accountNumber.length < 10) {
                toast.error('Account number must be 10 digits.');
                return;
            }
        }
        if (step === 4) {
            const k = formData.nextOfKin;
            if (!k.fullName || !k.address || !k.phoneNumber || !k.relationship) {
                toast.error('Please fill in complete Next of Kin details.');
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/investments', { 
                ...formData, 
                date: new Date().toISOString() 
            });
            
            // Full Screen Confetti Trigger
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.55 }
            });
            
            toast.success('Investment submitted successfully! It is now under review.', { duration: 6000 });
            
            setTimeout(() => {
                router.push('/investor');
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20 text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/investor" className="p-2 hover:bg-gray-150 rounded-lg text-gray-500 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">New Investment Application</h2>
                    <p className="text-gray-500 text-sm">Step {step} of 5 &bull; Initiate a new capital yield portfolio plan.</p>
                </div>
            </div>

            {/* Progress indicators */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                {[
                    { s: 1, label: 'Identity', icon: ShieldCheck },
                    { s: 2, label: 'Product', icon: FileText },
                    { s: 3, label: 'Capital', icon: Landmark },
                    { s: 4, label: 'Kin', icon: User },
                    { s: 5, label: 'Review', icon: CheckCircle2 }
                ].map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.s} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                step >= item.s 
                                    ? 'bg-[#de1f25] text-white' 
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                            >
                                <Icon size={16} />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${
                                step >= item.s ? 'text-gray-800' : 'text-gray-400'
                            }`}>{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Steps Container */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8 relative">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gray-100">
                    <div className="h-full bg-[#de1f25] transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: IDENTITY VERIFICATION */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Step 1: Identity Registry Check</h3>
                                <p className="text-sm text-gray-500">Select identity type, input details and run verification to pre-fill your application records.</p>
                            </div>

                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-xs text-orange-800 space-y-1.5">
                                <p className="font-bold flex items-center gap-1.5"><Info size={14} /> Mock Identity Database Credentials:</p>
                                <p>To test successfully, enter one of the following numbers:</p>
                                <ul className="list-disc pl-5 space-y-0.5">
                                    <li><strong>NIN:</strong> 12345678901, 23456789012, or 34567890123</li>
                                    <li><strong>BVN:</strong> 22222222222, 33333333333, or 44444444444</li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => { setIdType('bvn'); setVerifiedRecord(null); }}
                                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all ${
                                            idType === 'bvn' 
                                                ? 'bg-orange-50 border-[#de1f25] text-orange-900' 
                                                : 'bg-white border-gray-250 text-gray-550'
                                        }`}
                                    >
                                        Bank Verification Number (BVN)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIdType('nin'); setVerifiedRecord(null); }}
                                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold text-center transition-all ${
                                            idType === 'nin' 
                                                ? 'bg-orange-50 border-[#de1f25] text-orange-900' 
                                                : 'bg-white border-gray-250 text-gray-550'
                                        }`}
                                    >
                                        National Identity Number (NIN)
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Enter {idType.toUpperCase()} Number
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={idNumber}
                                            onChange={e => { setIdNumber(e.target.value.replace(/\D/g, '')); setVerifiedRecord(null); }}
                                            maxLength="11"
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900 tracking-widest font-mono text-lg"
                                            placeholder={`Input 11-digit ${idType.toUpperCase()}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyIdentity}
                                            disabled={verifying || idNumber.length < 10}
                                            className="bg-gray-900 hover:bg-black text-white font-bold text-sm px-6 py-3 rounded-xl transition-all disabled:opacity-40"
                                        >
                                            {verifying ? 'Verifying...' : 'Verify Details'}
                                        </button>
                                    </div>
                                </div>

                                {verifiedRecord && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 text-emerald-800"
                                    >
                                        <div className="flex items-center gap-2 font-bold text-sm">
                                            <CheckCircle2 className="text-emerald-600" size={18} />
                                            Identity Verification Successful
                                        </div>
                                        <div className="text-xs space-y-1 mt-2 border-t border-emerald-200/50 pt-2 grid grid-cols-2 gap-3 text-emerald-900 font-medium">
                                            <div><span className="text-emerald-700 block font-normal">Full Name:</span> {verifiedRecord.name}</div>
                                            <div><span className="text-emerald-700 block font-normal">Email:</span> {verifiedRecord.email}</div>
                                            <div><span className="text-emerald-700 block font-normal">Phone:</span> {verifiedRecord.phoneNumber}</div>
                                            <div><span className="text-emerald-700 block font-normal">Residential Address:</span> {verifiedRecord.contactAddress}</div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: CHOOSE PRODUCT */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Step 2: Choose Investment Product</h3>
                                <p className="text-sm text-gray-500">Select an investment product. Maturity and ROI plans are custom to each package.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {products.map((product) => {
                                    const isSelected = formData.productId === product._id;
                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductSelect(product)}
                                            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                                                isSelected 
                                                    ? 'bg-orange-50/50 border-[#de1f25] ring-2 ring-[#de1f25]/10' 
                                                    : 'bg-white border-gray-200 hover:border-gray-350'
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                                    {product.name}
                                                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#de1f25]" />}
                                                </h4>
                                                <p className="text-xs text-gray-500 max-w-lg leading-relaxed">{product.description}</p>
                                            </div>
                                            <div className="flex sm:flex-col items-end shrink-0 gap-3">
                                                <span className="text-xs font-bold bg-[#de1f25]/10 text-[#de1f25] px-2.5 py-1 rounded-full">{product.roiPercent}% ROI</span>
                                                <span className="text-xs font-semibold text-gray-500">{product.durationInMonths} Months duration</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {formData.selectedProduct && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4"
                                >
                                    <h4 className="text-sm font-bold text-gray-900">Maturity Handling Preference</h4>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-405 uppercase mb-2">
                                            Principal Action After Maturity
                                        </label>
                                        <select
                                            name="principalActionAfterMaturity"
                                            value={formData.principalActionAfterMaturity}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900"
                                        >
                                            {formData.selectedProduct.principalOptions?.map(opt => {
                                                let label = '';
                                                if (opt === 'rollover_all') label = 'Rollover Capital + ROI';
                                                if (opt === 'withdraw_roi') label = 'Withdraw ROI, Rollover Capital';
                                                if (opt === 'liquidate_all') label = 'Liquidate Completely';
                                                return <option key={opt} value={opt}>{label}</option>;
                                            })}
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 3: CAPITAL & BANKING */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Step 3: Capital & Payout Bank</h3>
                                <p className="text-sm text-gray-500">Provide the total investment capital (min ₦100,000) and payout bank domiciliation details.</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-450 uppercase mb-2">
                                        Amount to Invest (₦)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.displayAmount}
                                        onChange={handleAmountChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900 text-lg font-bold"
                                        placeholder="₦ 100,000"
                                    />
                                    {formData.selectedProduct && formData.amountToInvest > 0 && (
                                        <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                                            <Info size={12} /> Expected returns: ₦{Math.round(formData.amountToInvest * (1 + (formData.selectedProduct.roiPercent / 100))).toLocaleString()} ({formData.selectedProduct.roiPercent}% ROI)
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-5">
                                    <h4 className="text-sm font-bold text-gray-950 mb-3 uppercase tracking-wider">ROI Payout Account</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Bank Name</label>
                                            <select
                                                name="accountDetails.bankName"
                                                value={formData.accountDetails.bankName}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-white text-gray-900"
                                            >
                                                <option value="">Select popular bank...</option>
                                                {NIGERIAN_BANKS.map(bank => (
                                                    <option key={bank} value={bank}>{bank}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Account Number</label>
                                            <input
                                                type="text"
                                                name="accountDetails.accountNumber"
                                                value={formData.accountDetails.accountNumber}
                                                onChange={e => {
                                                    const clean = e.target.value.replace(/\D/g, '');
                                                    handleChange({ target: { name: 'accountDetails.accountNumber', value: clean } });
                                                }}
                                                maxLength="10"
                                                required
                                                placeholder="10-digit number"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900 font-mono tracking-widest"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Account Name</label>
                                            <input
                                                type="text"
                                                name="accountDetails.accountName"
                                                value={formData.accountDetails.accountName}
                                                onChange={handleChange}
                                                required
                                                placeholder="Name matching BVN registry"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: NEXT OF KIN */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Step 4: Next of Kin Details</h3>
                                <p className="text-sm text-gray-500">Provide details for the designated beneficiary of your real estate yields.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="nextOfKin.fullName"
                                        value={formData.nextOfKin.fullName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Relationship</label>
                                    <input
                                        type="text"
                                        name="nextOfKin.relationship"
                                        value={formData.nextOfKin.relationship}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Spouse, Sibling"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Residential Address</label>
                                    <input
                                        type="text"
                                        name="nextOfKin.address"
                                        value={formData.nextOfKin.address}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-450 uppercase mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="nextOfKin.phoneNumber"
                                        value={formData.nextOfKin.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="+234..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: REVIEW & SUBMIT */}
                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Step 5: Review Portfolio Request</h3>
                                <p className="text-sm text-gray-500">Confirm all information is accurate before submitting the yield request.</p>
                            </div>

                            <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/55 text-xs text-gray-950 font-medium">
                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Investor Name:</div>
                                    <div>{formData.name}</div>
                                    <div className="font-semibold text-gray-500">Email:</div>
                                    <div>{formData.email}</div>
                                    <div className="font-semibold text-gray-500">Phone:</div>
                                    <div>{formData.phoneNumber}</div>
                                    <div className="font-semibold text-gray-500">Verification:</div>
                                    <div className="uppercase font-mono">{formData.bvn ? `BVN verified (${formData.bvn})` : `NIN verified (${formData.nin})`}</div>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Package Name:</div>
                                    <div className="font-bold text-primary">{formData.selectedProduct?.name}</div>
                                    <div className="font-semibold text-gray-500">Duration Period:</div>
                                    <div>{formData.durationInMonths} Months</div>
                                    <div className="font-semibold text-gray-500">Expected ROI:</div>
                                    <div className="text-green-700 font-bold">{formData.selectedProduct?.roiPercent}% ROI</div>
                                    <div className="font-semibold text-gray-500">Maturity Preference:</div>
                                    <div className="capitalize font-bold text-orange-950">{formData.principalActionAfterMaturity.replace('_', ' ')}</div>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Principal Capital:</div>
                                    <div className="text-base font-black text-gray-900">₦{formData.amountToInvest.toLocaleString()}.00</div>
                                    <div className="font-semibold text-gray-500">Total Returns:</div>
                                    <div className="text-base font-black text-green-700">
                                        ₦{Math.round(formData.amountToInvest * (1 + (formData.selectedProduct?.roiPercent / 100))).toLocaleString()}.00
                                    </div>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Payout Bank Name:</div>
                                    <div>{formData.accountDetails.bankName}</div>
                                    <div className="font-semibold text-gray-500">Account Number:</div>
                                    <div className="font-mono tracking-widest">{formData.accountDetails.accountNumber}</div>
                                    <div className="font-semibold text-gray-500">Account Name:</div>
                                    <div>{formData.accountDetails.accountName}</div>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Next of Kin Name:</div>
                                    <div>{formData.nextOfKin.fullName}</div>
                                    <div className="font-semibold text-gray-500">Relationship:</div>
                                    <div>{formData.nextOfKin.relationship}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="flex gap-4 items-center border-t border-gray-150 pt-6 mt-8">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={handlePrevStep}
                            className="px-5 py-3 rounded-xl border border-gray-250 text-gray-600 font-bold hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                    )}
                    
                    {step < 5 ? (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm"
                        >
                            Continue <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#de1f25]/20 transition-all flex items-center justify-center gap-1.5 text-sm"
                        >
                            {loading ? 'Submitting Yield Request...' : 'Confirm & Initiate Investment'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
