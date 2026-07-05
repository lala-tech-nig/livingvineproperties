'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Mail, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [verified, setVerified] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        // Auto-focus next input
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = ['', '', '', '', '', ''];
        pasted.split('').forEach((c, i) => { newOtp[i] = c; });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            toast.error('Please enter all 6 digits of your OTP.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/verify-email', { email, otp: code });
            setVerified(true);
            toast.success('Email verified successfully!');
            setTimeout(() => router.push('/investor/login'), 2500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setResending(true);
        try {
            await api.post('/auth/resend-otp', { email });
            toast.success('A new OTP has been sent to your email.');
            setCountdown(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            // Restart countdown
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not resend OTP.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-900 to-orange-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="bg-gradient-to-r from-[#de1f25] to-orange-600 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold font-serif mb-1">Verify Your Email</h1>
                    <p className="text-white/80 text-sm">
                        We sent a 6-digit code to{' '}
                        <span className="font-semibold text-white">{email || 'your email address'}</span>
                    </p>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {verified ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={48} className="text-green-500" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Verified!</h2>
                                <p className="text-gray-500 text-sm">Your email has been verified. Redirecting you to login...</p>
                            </motion.div>
                        ) : (
                            <motion.form key="form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="text-center mb-2">
                                    <p className="text-sm text-gray-500">Enter the 6-digit OTP from your email</p>
                                </div>

                                {/* OTP Input Boxes */}
                                <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={el => inputRefs.current[i] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpChange(i, e.target.value)}
                                            onKeyDown={e => handleKeyDown(i, e)}
                                            className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 transition-all focus:outline-none
                                                ${digit ? 'border-[#de1f25] bg-red-50 text-[#de1f25]' : 'border-gray-200 bg-gray-50 text-gray-900'}
                                                focus:border-[#de1f25] focus:bg-red-50`}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.join('').length < 6}
                                    className="w-full bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={18} />
                                            Verify Email
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={!canResend || resending}
                                        className={`flex items-center gap-2 mx-auto text-sm font-semibold transition-colors ${canResend ? 'text-[#de1f25] hover:text-[#b0181d] cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                                        {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
                                    </button>
                                </div>

                                <p className="text-center text-xs text-gray-400">
                                    Wrong email?{' '}
                                    <Link href="/investor/register" className="text-[#de1f25] font-semibold hover:underline">
                                        Go back to register
                                    </Link>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-orange-950">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
