'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { ShieldCheck } from 'lucide-react';

const CRM_ROLES = ['sales', 'marketing', 'hr', 'ceo', 'superadmin'];

const ROLE_REDIRECT = {
    sales: '/crm/sales',
    marketing: '/crm/marketing',
    hr: '/crm/hr',
    ceo: '/crm/ceo',
    superadmin: '/crm/superadmin',
};

export default function CRMLoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', formData);

            if (!CRM_ROLES.includes(data.role)) {
                toast.error(
                    data.role === 'investor'
                        ? 'Access denied! Investors must use the Investor Login portal.'
                        : data.role === 'management'
                        ? 'Access denied! Management must use the Manager Login portal.'
                        : 'Access denied! Unauthorized role.'
                );
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

            toast.success(`Welcome, ${data.firstName}!`);
            router.push(ROLE_REDIRECT[data.role] || '/crm');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-950 flex-col md:flex-row">
            {/* Left Panel */}
            <div className="hidden md:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center border-r border-gray-800">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-[#de1f25] rounded-xl flex items-center justify-center">
                            <ShieldCheck size={24} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Staff Portal</span>
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold mb-6 font-serif leading-tight"
                    >
                        CRM Staff Access
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 leading-relaxed"
                    >
                        Access the Living Vine CRM system. Authorized for Sales, Marketing, HR, CEO & Superadmin accounts only.
                    </motion.p>
                    <div className="mt-8 grid grid-cols-3 gap-3">
                        {['Sales', 'Marketing', 'HR', 'CEO', 'Superadmin'].map(role => (
                            <span key={role} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-gray-400 text-center font-medium">
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-gray-950 relative">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10">
                        <Link href="/" className="inline-block text-xs font-bold text-[#de1f25] mb-6 tracking-widest uppercase hover:underline">
                            ← Back to Website
                        </Link>
                        <h2 className="text-3xl font-bold text-white mb-2 font-serif">Staff Sign In</h2>
                        <p className="text-gray-500">Enter your staff credentials to access the CRM.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 focus:ring-2 focus:ring-[#de1f25] focus:border-[#de1f25] transition-colors text-white placeholder-gray-600"
                                placeholder="staff@livingvine.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 focus:ring-2 focus:ring-[#de1f25] focus:border-[#de1f25] transition-colors text-white placeholder-gray-600"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#de1f25] hover:bg-[#b0181d] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-[#de1f25]/20 transition-all hover:shadow-[#de1f25]/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:transform-none"
                        >
                            {loading ? 'Authenticating...' : 'Access CRM Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-gray-800 pt-6 flex justify-around text-xs">
                        <Link href="/investor/login" className="text-gray-600 hover:text-[#de1f25] font-medium">Investor Portal</Link>
                        <span className="text-gray-800">|</span>
                        <Link href="/management/login" className="text-gray-600 hover:text-[#de1f25] font-medium">Manager Portal</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
