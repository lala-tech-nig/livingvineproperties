'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import {
    ChevronLeft, Info, CheckCircle2, ShieldCheck, Landmark, User,
    FileText, ArrowRight, ArrowLeft, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const NIGERIAN_BANKS = [
    'Access Bank','Citibank Nigeria','Ecobank Nigeria','Fidelity Bank',
    'First Bank of Nigeria','First City Monument Bank (FCMB)','Globus Bank',
    'Guaranty Trust Bank (GTBank)','Heritage Bank','Jaiz Bank','Keystone Bank',
    'Lotus Bank','Optimus Bank','Parallex Bank','Polaris Bank','PremiumTrust Bank',
    'Providus Bank','Signature Bank','Stanbic IBTC Bank','Standard Chartered Bank',
    'Sterling Bank','SunTrust Bank','Taj Bank','Titan Trust Bank',
    'Union Bank of Nigeria','United Bank for Africa (UBA)','Unity Bank','Wema Bank','Zenith Bank'
];

export default function NewInvestment() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [products, setProducts] = useState([]);
    const [checkingProfile, setCheckingProfile] = useState(true);

    // Whether NIN is already on file (returning investor)
    const [hasNinOnFile, setHasNinOnFile] = useState(false);
    const [existingNin, setExistingNin] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        surname: '',
        name: '',
        email: '',
        contactAddress: '',
        phoneNumber: '',
        amountToInvest: '',
        displayAmount: '',
        productId: '',
        selectedProduct: null,
        durationInMonths: '',
        principalActionAfterMaturity: '',
        nin: '',
        dob: '',
        gender: '',
        state: '',
        occupation: '',
        accountDetails: { bankName: '', accountNumber: '', accountName: '' },
        nextOfKin: { fullName: '', address: '', phoneNumber: '', relationship: '' }
    });

    // On mount: load products and check if user already has NIN stored
    useEffect(() => {
        const init = async () => {
            try {
                const [prodRes, profileRes] = await Promise.all([
                    api.get('/investment-products'),
                    api.get('/users/profile'),
                ]);
                setProducts(prodRes.data);

                const profile = profileRes.data;
                // Pre-fill name/email/phone/NIN details from profile
                setFormData(prev => ({
                    ...prev,
                    firstName: profile.firstName || '',
                    surname: profile.surname || '',
                    name: `${profile.firstName || ''} ${profile.surname || ''}`.trim(),
                    email: profile.email || '',
                    phoneNumber: profile.phoneNumber || '',
                    contactAddress: profile.address || '',
                    nin: profile.nin || '',
                    dob: profile.dob ? new Date(profile.dob).toISOString().slice(0, 10) : '',
                    gender: profile.gender || '',
                    state: profile.state || '',
                    occupation: profile.occupation || '',
                }));

                if (profile.nin) {
                    setHasNinOnFile(true);
                    setExistingNin(profile.nin);
                    // Skip directly to step 2
                    setStep(2);
                }
            } catch (err) {
                toast.error('Failed to load profile.');
            } finally {
                setCheckingProfile(false);
            }
        };
        init();
    }, []);

    const handleAmountChange = (e) => {
        const clean = e.target.value.replace(/\D/g, '');
        const formatted = clean.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        setFormData(prev => ({ ...prev, amountToInvest: parseInt(clean) || 0, displayAmount: formatted ? `₦ ${formatted}` : '' }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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

    // Total steps: 4 if returning investor (no identity step), 5 if first time
    const totalSteps = hasNinOnFile ? 4 : 5;
    // Map visual step label to internal step index
    // If NIN on file: step 1=Product, 2=Capital, 3=Kin, 4=Review
    // If no NIN:       step 1=Identity, 2=Product, 3=Capital, 4=Kin, 5=Review

    const handleNextStep = () => {
        const identityStep = hasNinOnFile ? 0 : 1;  // 0 = doesn't exist
        const productStep  = hasNinOnFile ? 1 : 2;
        const capitalStep  = hasNinOnFile ? 2 : 3;
        const kinStep      = hasNinOnFile ? 3 : 4;

        if (step === identityStep) {
            if (!formData.nin || formData.nin.length !== 11) {
                toast.error('Please enter a valid 11-digit National Identity Number (NIN).');
                return;
            }
            if (!formData.firstName || !formData.surname) {
                toast.error('First name and surname are required.');
                return;
            }
            if (!formData.phoneNumber) {
                toast.error('Phone number is required.');
                return;
            }
            if (!formData.dob) {
                toast.error('Date of birth is required.');
                return;
            }
            if (!formData.gender) {
                toast.error('Gender is required.');
                return;
            }
            if (!formData.state) {
                toast.error('State is required.');
                return;
            }
            if (!formData.occupation) {
                toast.error('Occupation is required.');
                return;
            }
            if (!formData.contactAddress) {
                toast.error('Residential address is required.');
                return;
            }
            setFormData(prev => ({ ...prev, name: `${formData.firstName} ${formData.surname}` }));
        }
        if (step === productStep && !formData.productId) {
            toast.error('Please select an investment product package.');
            return;
        }
        if (step === capitalStep) {
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
        if (step === kinStep) {
            const k = formData.nextOfKin;
            if (!k.fullName || !k.address || !k.phoneNumber || !k.relationship) {
                toast.error('Please fill in complete Next of Kin details.');
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Update user profile details in database
            await api.put('/users/profile', {
                gender: formData.gender,
                state: formData.state,
                address: formData.contactAddress,
                occupation: formData.occupation,
                dob: formData.dob,
                nin: formData.nin
            });

            // Submit investment request
            await api.post('/investments', { 
                ...formData, 
                name: `${formData.firstName} ${formData.surname}`,
                date: new Date().toISOString() 
            });
            
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.55 } });
            toast.success('Investment submitted successfully! It is now under review.', { duration: 6000 });
            setTimeout(() => router.push('/investor'), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
            setLoading(false);
        }
    };

    // ── step labels depend on whether NIN is already on file ──
    const stepItems = hasNinOnFile
        ? [
            { s: 1, label: 'Product',  icon: FileText },
            { s: 2, label: 'Capital',  icon: Landmark },
            { s: 3, label: 'Kin',      icon: User },
            { s: 4, label: 'Review',   icon: CheckCircle2 },
          ]
        : [
            { s: 1, label: 'Identity', icon: ShieldCheck },
            { s: 2, label: 'Product',  icon: FileText },
            { s: 3, label: 'Capital',  icon: Landmark },
            { s: 4, label: 'Kin',      icon: User },
            { s: 5, label: 'Review',   icon: CheckCircle2 },
          ];

    // Map step to the actual label titles
    const stepTitles = hasNinOnFile
        ? ['Choose Investment Product', 'Capital & Payout Bank', 'Next of Kin Details', 'Review Portfolio Request']
        : ['Identity Registry Check', 'Choose Investment Product', 'Capital & Payout Bank', 'Next of Kin Details', 'Review Portfolio Request'];

    const currentTitle = stepTitles[step - 1] || '';

    if (checkingProfile) {
        return (
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-10 h-10 border-4 border-[#de1f25]/30 border-t-[#de1f25] rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Checking your investor profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20 text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/investor" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">New Investment Application</h2>
                    <p className="text-gray-500 text-sm">
                        Step {step} of {totalSteps} &bull; {currentTitle}
                        {hasNinOnFile && (
                            <span className="ml-2 text-emerald-600 font-semibold text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                ✓ Returning Investor
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                {stepItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = step >= item.s;
                    return (
                        <div key={item.s} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-[#de1f25] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <Icon size={16} />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Returning investor banner */}
            {hasNinOnFile && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                    <Sparkles size={20} className="text-emerald-500 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-emerald-800">Identity Pre-Verified ✓</p>
                        <p className="text-xs text-emerald-600">Your NIN (<span className="font-mono tracking-widest">{existingNin.slice(0,3)}••••{existingNin.slice(-3)}</span>) is already on file. Identity step has been skipped automatically.</p>
                    </div>
                </motion.div>
            )}

            {/* Steps Container */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8 relative">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gray-100">
                    <div className="h-full bg-[#de1f25] transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
                </div>

                <AnimatePresence mode="wait">

                    {/* ── STEP 1 (first-timer): IDENTITY ── */}
                    {!hasNinOnFile && step === 1 && (
                        <motion.div key="step-identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">NIN Identity Registration</h3>
                                <p className="text-sm text-gray-500">Provide your 11-digit National Identity Number and registration details as they appear on your official NIN record. This setup is a one-time process.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">National Identity Number (NIN)</label>
                                        <input
                                            type="text"
                                            name="nin"
                                            value={formData.nin}
                                            onChange={e => handleChange({ target: { name: 'nin', value: e.target.value.replace(/\D/g, '') } })}
                                            maxLength="11"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900 tracking-widest font-mono text-lg"
                                            placeholder="Enter 11-digit NIN"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900"
                                            placeholder="First Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Surname</label>
                                        <input
                                            type="text"
                                            name="surname"
                                            value={formData.surname}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900"
                                            placeholder="Surname"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900 font-medium"
                                            placeholder="Phone Number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-white text-gray-900"
                                        >
                                            <option value="">Select Gender...</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State of Origin / Residence</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900"
                                            placeholder="State"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Occupation</label>
                                        <input
                                            type="text"
                                            name="occupation"
                                            value={formData.occupation}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900"
                                            placeholder="e.g. Civil Servant, Architect"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Residential Address</label>
                                        <textarea
                                            name="contactAddress"
                                            value={formData.contactAddress}
                                            onChange={handleChange}
                                            required
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900 outline-none resize-none"
                                            placeholder="Full Residential Address"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── PRODUCT SELECTION ── */}
                    {((hasNinOnFile && step === 1) || (!hasNinOnFile && step === 2)) && (
                        <motion.div key="step-product" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Choose Investment Product</h3>
                                <p className="text-sm text-gray-500">Select a product package. Maturity and ROI plans are specific to each package.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {products.map(product => {
                                    const isSelected = formData.productId === product._id;
                                    return (
                                        <div key={product._id} onClick={() => handleProductSelect(product)}
                                            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isSelected ? 'bg-orange-50/50 border-[#de1f25] ring-2 ring-[#de1f25]/10' : 'bg-white border-gray-200 hover:border-gray-350'}`}>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                                    {product.name} {isSelected && <span className="w-2 h-2 rounded-full bg-[#de1f25]" />}
                                                </h4>
                                                <p className="text-xs text-gray-500 max-w-lg leading-relaxed">{product.description}</p>
                                            </div>
                                            <div className="flex sm:flex-col items-end shrink-0 gap-3">
                                                <span className="text-xs font-bold bg-[#de1f25]/10 text-[#de1f25] px-2.5 py-1 rounded-full">{product.roiPercent}% ROI</span>
                                                <span className="text-xs font-semibold text-gray-500">{product.durationInMonths} Months</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {formData.selectedProduct && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900">Maturity Handling Preference</h4>
                                    <select name="principalActionAfterMaturity" value={formData.principalActionAfterMaturity} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900">
                                        {formData.selectedProduct.principalOptions?.map(opt => {
                                            const labels = { rollover_all: 'Rollover Capital + ROI', withdraw_roi: 'Withdraw ROI, Rollover Capital', liquidate_all: 'Liquidate Completely' };
                                            return <option key={opt} value={opt}>{labels[opt] || opt}</option>;
                                        })}
                                    </select>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* ── CAPITAL & BANKING ── */}
                    {((hasNinOnFile && step === 2) || (!hasNinOnFile && step === 3)) && (
                        <motion.div key="step-capital" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Capital & Payout Bank</h3>
                                <p className="text-sm text-gray-500">Set investment capital (min ₦100,000) and your ROI payout bank details.</p>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount to Invest (₦)</label>
                                    <input type="text" value={formData.displayAmount} onChange={handleAmountChange} required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 focus:border-[#de1f25] bg-gray-50 text-gray-900 text-lg font-bold"
                                        placeholder="₦ 100,000" />
                                    {formData.selectedProduct && formData.amountToInvest > 0 && (
                                        <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                                            <Info size={12} />Expected returns: ₦{Math.round(formData.amountToInvest * (1 + formData.selectedProduct.roiPercent / 100)).toLocaleString()} ({formData.selectedProduct.roiPercent}% ROI)
                                        </p>
                                    )}
                                </div>
                                <div className="border-t border-gray-100 pt-5">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">ROI Payout Account</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bank Name</label>
                                            <select name="accountDetails.bankName" value={formData.accountDetails.bankName} onChange={handleChange} required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-white text-gray-900">
                                                <option value="">Select bank...</option>
                                                {NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Account Number</label>
                                            <input type="text" name="accountDetails.accountNumber" value={formData.accountDetails.accountNumber}
                                                onChange={e => handleChange({ target: { name: 'accountDetails.accountNumber', value: e.target.value.replace(/\D/g, '') } })}
                                                maxLength="10" required placeholder="10-digit number"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900 font-mono tracking-widest" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Account Name</label>
                                            <input type="text" name="accountDetails.accountName" value={formData.accountDetails.accountName} onChange={handleChange} required
                                                placeholder="Name matching BVN registry"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── NEXT OF KIN ── */}
                    {((hasNinOnFile && step === 3) || (!hasNinOnFile && step === 4)) && (
                        <motion.div key="step-kin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Next of Kin Details</h3>
                                <p className="text-sm text-gray-500">Provide details for the designated beneficiary of your real estate yields.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                                    <input type="text" name="nextOfKin.fullName" value={formData.nextOfKin.fullName} onChange={handleChange} required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Relationship</label>
                                    <input type="text" name="nextOfKin.relationship" value={formData.nextOfKin.relationship} onChange={handleChange} required
                                        placeholder="e.g. Spouse, Sibling"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Residential Address</label>
                                    <input type="text" name="nextOfKin.address" value={formData.nextOfKin.address} onChange={handleChange} required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                                    <input type="tel" name="nextOfKin.phoneNumber" value={formData.nextOfKin.phoneNumber} onChange={handleChange} required
                                        placeholder="+234..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-900" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── REVIEW ── */}
                    {((hasNinOnFile && step === 4) || (!hasNinOnFile && step === 5)) && (
                        <motion.div key="step-review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Review Portfolio Request</h3>
                                <p className="text-sm text-gray-500">Confirm all information before submitting.</p>
                            </div>
                            <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/55 text-xs text-gray-950 font-medium">
                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Investor Name:</div><div>{formData.name}</div>
                                    <div className="font-semibold text-gray-500">Email:</div><div>{formData.email}</div>
                                    <div className="font-semibold text-gray-500">Phone:</div><div>{formData.phoneNumber}</div>
                                    <div className="font-semibold text-gray-500">NIN:</div>
                                    <div className="font-mono">{hasNinOnFile ? `${existingNin.slice(0,3)}••••${existingNin.slice(-3)} (on file)` : (formData.nin || `BVN: ${formData.bvn}`)}</div>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Package:</div><div className="font-bold">{formData.selectedProduct?.name}</div>
                                    <div className="font-semibold text-gray-500">Duration:</div><div>{formData.durationInMonths} Months</div>
                                    <div className="font-semibold text-gray-500">Expected ROI:</div><div className="text-green-700 font-bold">{formData.selectedProduct?.roiPercent}%</div>
                                    <div className="font-semibold text-gray-500">Maturity:</div><div className="capitalize">{formData.principalActionAfterMaturity.replace(/_/g, ' ')}</div>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Capital:</div><div className="text-base font-black">₦{formData.amountToInvest?.toLocaleString()}.00</div>
                                    <div className="font-semibold text-gray-500">Total Returns:</div>
                                    <div className="text-base font-black text-green-700">₦{Math.round(formData.amountToInvest * (1 + (formData.selectedProduct?.roiPercent || 0) / 100)).toLocaleString()}.00</div>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Payout Bank:</div><div>{formData.accountDetails.bankName}</div>
                                    <div className="font-semibold text-gray-500">Account No:</div><div className="font-mono tracking-widest">{formData.accountDetails.accountNumber}</div>
                                    <div className="font-semibold text-gray-500">Account Name:</div><div>{formData.accountDetails.accountName}</div>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-2">
                                    <div className="font-semibold text-gray-500">Next of Kin:</div><div>{formData.nextOfKin.fullName}</div>
                                    <div className="font-semibold text-gray-500">Relationship:</div><div>{formData.nextOfKin.relationship}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Footer Nav */}
                <div className="flex gap-4 items-center border-t border-gray-100 pt-6 mt-8">
                    {step > 1 && (
                        <button type="button" onClick={() => setStep(p => p - 1)}
                            className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm">
                            <ArrowLeft size={16} /> Back
                        </button>
                    )}
                    {step < totalSteps ? (
                        <button type="button" onClick={handleNextStep}
                            className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm">
                            Continue <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={loading}
                            className="flex-1 bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#de1f25]/20 transition-all flex items-center justify-center gap-1.5 text-sm disabled:opacity-60">
                            {loading ? 'Submitting...' : 'Confirm & Initiate Investment'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
