'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Check, X, ChevronRight } from 'lucide-react';
import api from '@/lib/axios';

const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nassarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const passwordRules = [
    { key: 'length',   label: 'At least 8 characters',              test: (p) => p.length >= 8 },
    { key: 'upper',    label: 'At least one uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
    { key: 'lower',    label: 'At least one lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
    { key: 'number',   label: 'At least one number (0–9)',           test: (p) => /[0-9]/.test(p) },
    { key: 'special',  label: 'At least one special character (!@#$%^&*)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
];

function PasswordStrengthMeter({ password }) {
    const passed = passwordRules.filter(r => r.test(password)).length;
    const strength = passed <= 1 ? 'Very Weak' : passed === 2 ? 'Weak' : passed === 3 ? 'Fair' : passed === 4 ? 'Good' : 'Strong';
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
    const color = colors[passed - 1] || '#e5e7eb';

    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= passed ? color : '#e5e7eb' }}
                    />
                ))}
            </div>
            {password.length > 0 && (
                <p className="text-xs font-semibold" style={{ color }}>{strength} password</p>
            )}
            <ul className="space-y-1 mt-2">
                {passwordRules.map(rule => {
                    const ok = rule.test(password);
                    return (
                        <li key={rule.key} className={`flex items-center gap-2 text-xs transition-colors ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                            {ok ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
                            {rule.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showStrength, setShowStrength] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        surname: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        referredByEmail: '',
        gender: '',
        religion: '',
        state: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'password') setShowStrength(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const failedRules = passwordRules.filter(r => !r.test(formData.password));
        if (failedRules.length > 0) {
            toast.error(`Password too weak: ${failedRules.map(r => r.label).join(', ')}`);
            return;
        }

        if (!acceptedTerms) {
            toast.error('Please accept the Terms and Conditions to continue.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                firstName: formData.firstName,
                surname: formData.surname,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                role: 'investor',
                referredByEmail: formData.referredByEmail || undefined,
                gender: formData.gender || undefined,
                religion: formData.religion || undefined,
                state: formData.state || undefined,
                acceptedTerms: true,
            });
            toast.success('Account created! Check your email for a verification code.');
            router.push(`/investor/verify-email?email=${encodeURIComponent(formData.email)}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-gray-900 transition-colors text-sm";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
            {/* Left Panel */}
            <div className="hidden md:flex w-1/2 bg-orange-950 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2573&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30" />
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">🏡</div>
                        <h1 className="text-5xl font-bold font-serif leading-tight">Start Your<br />Investment<br />Journey</h1>
                        <p className="text-orange-200/80 leading-relaxed font-light text-lg">
                            Create an account and take the first step toward financial freedom with secure, high-yield real estate investments.
                        </p>
                        <div className="space-y-3 pt-4">
                            {['Verified & Secured Platform', 'Expert Account Officers', '24% Annual ROI on Investments'].map(f => (
                                <div key={f} className="flex items-center gap-3 text-orange-100">
                                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shrink-0">
                                        <Check size={12} className="text-white" />
                                    </div>
                                    <span className="text-sm">{f}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-1/2 flex items-start justify-center p-6 sm:p-10 bg-white overflow-y-auto min-h-screen">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-lg my-8"
                >
                    <div className="mb-8">
                        <Link href="/" className="inline-block text-xs font-bold text-red-600 mb-4 tracking-widest uppercase hover:underline">
                            ← Back to Website
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1 font-serif">Create an account</h2>
                        <p className="text-gray-500 text-sm">Fill in your details to get started as an investor.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClass} placeholder="John" />
                            </div>
                            <div>
                                <label className={labelClass}>Surname</label>
                                <input type="text" name="surname" value={formData.surname} onChange={handleChange} required className={inputClass} placeholder="Doe" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="john@example.com" />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className={labelClass}>Phone Number</label>
                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className={inputClass} placeholder="+234 800 000 0000" />
                        </div>

                        {/* Password */}
                        <div>
                            <label className={labelClass}>Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    onFocus={() => setShowStrength(true)}
                                    className={`${inputClass} pr-12`}
                                    placeholder="Create a strong password"
                                />
                                <button type="button" onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <AnimatePresence>
                                {showStrength && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <PasswordStrengthMeter password={formData.password} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className={labelClass}>Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`${inputClass} pr-12 ${formData.confirmPassword && formData.confirmPassword !== formData.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                                    placeholder="Re-enter your password"
                                />
                                <button type="button" onClick={() => setShowConfirm(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><X size={12} /> Passwords do not match</p>
                            )}
                            {formData.confirmPassword && formData.confirmPassword === formData.password && (
                                <p className="mt-1 text-xs text-green-600 flex items-center gap-1"><Check size={12} /> Passwords match</p>
                            )}
                        </div>

                        {/* Demographics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Gender <span className="text-xs font-normal text-gray-400">(Optional)</span></label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Religion <span className="text-xs font-normal text-gray-400">(Optional)</span></label>
                                <select name="religion" value={formData.religion} onChange={handleChange} className={inputClass}>
                                    <option value="">Select</option>
                                    <option value="muslim">Muslim</option>
                                    <option value="christian">Christian</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>State <span className="text-xs font-normal text-gray-400">(Optional)</span></label>
                                <select name="state" value={formData.state} onChange={handleChange} className={inputClass}>
                                    <option value="">Select</option>
                                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Referral */}
                        <div>
                            <label className={labelClass}>
                                Referral Email <span className="ml-1.5 text-xs font-normal text-gray-400">(Optional)</span>
                            </label>
                            <input type="email" name="referredByEmail" value={formData.referredByEmail} onChange={handleChange}
                                className={inputClass} placeholder="Email of the person who referred you" />
                            <p className="mt-1.5 text-xs text-gray-400">Enter a staff member's work email to be assigned as your Account Officer.</p>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative mt-0.5 shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={e => setAcceptedTerms(e.target.checked)}
                                        className="sr-only"
                                        id="terms-checkbox"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-[#de1f25] border-[#de1f25]' : 'border-gray-300 bg-white group-hover:border-[#de1f25]'}`}>
                                        {acceptedTerms && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-600 leading-relaxed">
                                    I have read, understood and agree to the{' '}
                                    <Link href="/terms" target="_blank" className="font-semibold text-[#de1f25] hover:underline inline-flex items-center gap-0.5">
                                        Terms and Conditions <ChevronRight size={12} />
                                    </Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" target="_blank" className="font-semibold text-[#de1f25] hover:underline inline-flex items-center gap-0.5">
                                        Privacy Policy <ChevronRight size={12} />
                                    </Link>
                                    {' '}of LIVING VINE PRPPERTIES INVESTMENT LIMITED.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !acceptedTerms}
                            className="w-full mt-2 bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-[#de1f25]/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : 'Create Account & Verify Email'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-600 text-sm">
                        Already have an account?{' '}
                        <Link href="/investor/login" className="font-semibold text-[#de1f25] hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
