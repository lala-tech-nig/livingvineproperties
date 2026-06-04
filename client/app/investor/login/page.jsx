'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function InvestorLoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', formData);

            // Restrict login to investor role only
            if (data.role !== 'investor') {
                toast.error('Access denied! This interface is for investors only. Please use the Staff CRM or Manager login portal.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data._id,
                email: data.email,
                role: data.role,
                firstName: data.firstName,
                surname: data.surname
            }));
            setUser(
                { id: data._id, email: data.email, role: data.role, firstName: data.firstName, surname: data.surname },
                data.token
            );

            toast.success(`Welcome to Investor Portal, ${data.firstName}!`);
            router.push('/investor');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
            <div className="hidden md:flex w-1/2 bg-orange-950 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold mb-6 font-serif"
                    >
                        Investor Portal
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-orange-200/80 leading-relaxed font-light"
                    >
                        Securely manage your capital allocations, track property portfolios, and observe high-yield asset appreciations.
                    </motion.p>
                </div>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-white relative">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 text-center md:text-left">
                        <Link href="/" className="inline-block text-xs font-bold text-primary mb-4 tracking-widest uppercase hover:underline">
                            ← Back to Website
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Investor Login</h2>
                        <p className="text-gray-500">Sign in to check your investment portfolios.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-[#de1f25] transition-colors bg-gray-50 focus:bg-white text-gray-900"
                                placeholder="Enter your registered email"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1 items-center">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <Link href="#" className="text-sm font-semibold text-[#de1f25] hover:text-[#de1f25]">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-[#de1f25] transition-colors bg-gray-50 focus:bg-white text-gray-900"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#de1f25] hover:bg-[#b0181d] text-white font-medium py-3 rounded-xl shadow-lg shadow-[#de1f25]/20 transition-all hover:shadow-[#de1f25]/40 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:transform-none"
                        >
                            {loading ? 'Verifying investor credentials...' : 'Access Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-gray-600 text-sm space-y-2">
                        <p>
                            Don't have an account?{' '}
                            <Link href="/investor/register" className="font-semibold text-[#de1f25] hover:text-[#de1f25]">
                                Register now
                            </Link>
                        </p>
                        <div className="border-t border-gray-100 pt-4 flex justify-around text-xs">
                            <Link href="/crm/login" className="text-gray-400 hover:text-primary font-medium">CRM Staff Access</Link>
                            <span className="text-gray-300">|</span>
                            <Link href="/management/login" className="text-gray-400 hover:text-primary font-medium">Manager Access</Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
