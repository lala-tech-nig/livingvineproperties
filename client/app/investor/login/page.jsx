'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function InvestorLoginPage() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2670&auto=format&fit=crop');
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        const fetchBg = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data?.loginBackground) setBgImage(data.loginBackground);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBg();
    }, []);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', formData);

            if (data.role !== 'investor') {
                toast.error('Access denied! This interface is for investors only.');
                setLoading(false);
                return;
            }

            // Use sessionStorage for auth — clears on browser close
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify({
                id: data._id,
                email: data.email,
                role: data.role,
                firstName: data.firstName,
                surname: data.surname,
                profileImage: data.profileImage || null,
                accountOfficer: data.accountOfficer || null,
            }));
            // Also keep localStorage for PWA/mobile where tabs persist
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data._id,
                email: data.email,
                role: data.role,
                firstName: data.firstName,
                surname: data.surname,
                profileImage: data.profileImage || null,
                accountOfficer: data.accountOfficer || null,
            }));

            setUser(
                { id: data._id, email: data.email, role: data.role, firstName: data.firstName, surname: data.surname, profileImage: data.profileImage || null, accountOfficer: data.accountOfficer || null },
                data.token
            );

            toast.success(`Welcome back, ${data.firstName}! 🏡`);
            router.push('/investor');

        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed!';
            const requiresVerification = error.response?.data?.requiresVerification;
            const email = error.response?.data?.email;

            if (requiresVerification && email) {
                toast.error('Please verify your email before logging in.');
                router.push(`/investor/verify-email?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
            {/* Left Panel */}
            <div className="hidden md:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{ backgroundImage: `url('${bgImage}')` }}
                />
                <div className="absolute inset-0 bg-black/40" />
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-white p-12 max-w-sm"
                >
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 text-2xl">🏡</div>
                    <h1 className="text-4xl font-bold font-serif mb-4 leading-tight">Your Investments,<br />Secured.</h1>
                    <p className="text-white/70 leading-relaxed">Log in to track your portfolio, view returns, and manage your account with LIVING VINE PRPPERTIES INVESTMENT LIMITED.</p>
                </motion.div>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-white relative">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10">
                        <Link href="/" className="inline-block text-xs font-bold text-[#de1f25] mb-4 tracking-widest uppercase hover:underline">
                            ← Back to Website
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Investor Login</h2>
                        <p className="text-gray-500 text-sm">Sign in to access your investment portfolio.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-[#de1f25] transition-colors bg-gray-50 focus:bg-white text-gray-900 text-sm"
                                placeholder="Enter your registered email"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between mb-1 items-center">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <Link href="/investor/forgot-password" className="text-xs font-semibold text-[#de1f25] hover:underline flex items-center gap-1">
                                    <ShieldAlert size={12} /> Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-[#de1f25] transition-colors bg-gray-50 focus:bg-white text-gray-900 text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-[#de1f25]/20 transition-all hover:shadow-[#de1f25]/40 transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                            ) : (
                                <><LogIn size={18} /> Access Dashboard</>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-gray-600 text-sm space-y-2">
                        <p>
                            Don't have an account?{' '}
                            <Link href="/investor/register" className="font-semibold text-[#de1f25] hover:underline">
                                Register now
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
