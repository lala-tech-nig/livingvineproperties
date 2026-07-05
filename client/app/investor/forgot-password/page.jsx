'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Mail, KeyRound, Eye, EyeOff, Check, X, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';

const passwordRules = [
    { key: 'length',  label: 'At least 8 characters',            test: (p) => p.length >= 8 },
    { key: 'upper',   label: 'At least one uppercase letter',     test: (p) => /[A-Z]/.test(p) },
    { key: 'lower',   label: 'At least one lowercase letter',     test: (p) => /[a-z]/.test(p) },
    { key: 'number',  label: 'At least one number',               test: (p) => /[0-9]/.test(p) },
    { key: 'special', label: 'At least one special character',    test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
];

function ForgotPasswordContent() {
    const searchParams = useSearchParams();
    const tokenFromUrl = searchParams.get('token') || '';
    const emailFromUrl = searchParams.get('email') || '';

    const isReset = !!(tokenFromUrl && emailFromUrl);

    const [step, setStep] = useState(isReset ? 'reset' : 'request');
    const [email, setEmail] = useState(emailFromUrl);
    const [token, setToken] = useState(tokenFromUrl);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setStep('sent');
        } catch (err) {
            // Always show success to prevent email enumeration
            setStep('sent');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        const failedRules = passwordRules.filter(r => !r.test(newPassword));
        if (failedRules.length) {
            toast.error('Password does not meet requirements.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, token, password: newPassword });
            setDone(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    const passed = passwordRules.filter(r => r.test(newPassword)).length;
    const strengthColor = passed <= 1 ? '#ef4444' : passed === 2 ? '#f97316' : passed === 3 ? '#eab308' : passed === 4 ? '#22c55e' : '#16a34a';

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-900 to-orange-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="bg-gradient-to-r from-[#de1f25] to-orange-600 p-8 text-white text-center">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {step === 'reset' ? <KeyRound size={28} /> : <Mail size={28} />}
                    </div>
                    <h1 className="text-2xl font-bold font-serif">
                        {step === 'request' && 'Forgot Password?'}
                        {step === 'sent' && 'Check Your Email'}
                        {step === 'reset' && 'Set New Password'}
                    </h1>
                    <p className="text-white/80 text-sm mt-1">
                        {step === 'request' && "Enter your email and we'll send a reset link."}
                        {step === 'sent' && 'A reset link has been sent if this email is registered.'}
                        {step === 'reset' && 'Create a strong new password for your account.'}
                    </p>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {/* Request step */}
                        {step === 'request' && (
                            <motion.form key="request" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleRequestReset} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-sm transition-colors"
                                        placeholder="Enter your registered email"
                                    />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : 'Send Reset Link'}
                                </button>
                                <p className="text-center text-sm text-gray-500">
                                    Remember your password?{' '}
                                    <Link href="/investor/login" className="font-semibold text-[#de1f25] hover:underline">Sign in</Link>
                                </p>
                            </motion.form>
                        )}

                        {/* Sent step */}
                        {step === 'sent' && (
                            <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <Mail size={40} className="text-green-500" />
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    If <strong>{email}</strong> is registered with us, you'll receive a password reset link shortly. Please check your inbox and spam folder.
                                </p>
                                <p className="text-xs text-gray-400">The link expires in 1 hour.</p>
                                <Link href="/investor/login" className="block w-full text-center bg-[#de1f25] text-white font-semibold py-3 rounded-xl hover:bg-[#b0181d] transition-colors">
                                    Back to Login
                                </Link>
                            </motion.div>
                        )}

                        {/* Reset step */}
                        {step === 'reset' && !done && (
                            <motion.form key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleReset} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-sm transition-colors"
                                            placeholder="Create a strong password"
                                        />
                                        <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {newPassword && (
                                        <div className="mt-2 space-y-1.5">
                                            <div className="flex gap-1">
                                                {[1,2,3,4,5].map(i => (
                                                    <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= passed ? strengthColor : '#e5e7eb' }} />
                                                ))}
                                            </div>
                                            <ul className="space-y-0.5">
                                                {passwordRules.map(r => {
                                                    const ok = r.test(newPassword);
                                                    return (
                                                        <li key={r.key} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                                                            {ok ? <Check size={11} /> : <X size={11} />} {r.label}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            className={`w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 focus:ring-red-500 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-sm transition-colors ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : 'border-gray-300'}`}
                                            placeholder="Re-enter your new password"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</> : 'Reset Password'}
                                </button>
                            </motion.form>
                        )}

                        {/* Done */}
                        {done && (
                            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={48} className="text-green-500" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Password Reset!</h2>
                                <p className="text-gray-500 text-sm">Your password has been updated successfully.</p>
                                <Link href="/investor/login" className="block w-full text-center bg-[#de1f25] text-white font-semibold py-3 rounded-xl hover:bg-[#b0181d] transition-colors">
                                    Sign In Now
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-orange-950"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" /></div>}>
            <ForgotPasswordContent />
        </Suspense>
    );
}
