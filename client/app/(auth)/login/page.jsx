'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
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

            toast.success(`Welcome back, ${data.firstName}!`);

            if (data.role === 'ceo') router.push('/ceo');
            else if (data.role === 'management') router.push('/management');
            else router.push('/investor');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
            <div className="hidden md:flex w-1/2 bg-orange-900 relative overflow-hidden items-center justify-center">
                {/* Placeholder for nice image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold mb-6"
                    >
                        Welcome Back to Living Vine
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-[#de1f25]/20"
                    >
                        Manage your investments seamlessly and watch your wealth grow with confidence.
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
                        <p className="text-gray-500">Please enter your details to access your dashboard.</p>
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
                                placeholder="Enter your email"
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
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-semibold text-[#de1f25] hover:text-[#de1f25]">
                            Register now
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
