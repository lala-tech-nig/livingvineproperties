'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        surname: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', formData);
            toast.success('Registration successful! Please login.');
            router.push('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
            <div className="hidden md:flex w-1/2 bg-orange-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2573&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50"></div>
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold mb-6"
                    >
                        Start Your Journey
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-[#de1f25]/20"
                    >
                        Create an account today and take the first step towards financial freedom and secure property investments.
                    </motion.p>
                </div>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white relative overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-lg my-auto"
                >
                    <div className="mb-8 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
                        <p className="text-gray-500">Provide your details to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-gray-900 transition-colors"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                                <input
                                    type="text" name="surname" value={formData.surname} onChange={handleChange} required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-gray-900 transition-colors"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email" name="email" value={formData.email} onChange={handleChange} required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-gray-900 transition-colors"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-gray-900 transition-colors"
                                placeholder="+234 800 000 0000"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password" name="password" value={formData.password} onChange={handleChange} required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-gray-900 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-600 focus:border-[#de1f25] bg-gray-50 focus:bg-white text-gray-900 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-[#de1f25] hover:bg-[#b0181d] text-white font-medium py-3 rounded-xl shadow-lg shadow-[#de1f25]/20 transition-all hover:-translate-y-0.5"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-600 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-[#de1f25] hover:text-[#de1f25]">
                            Sign in here
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
