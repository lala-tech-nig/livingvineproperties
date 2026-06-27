'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Briefcase } from 'lucide-react';

export default function ManagerLoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
    const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop');

    useEffect(() => {
        const fetchBg = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data?.loginBackground) {
                    setBgImage(data.loginBackground);
                }
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

            if (data.role !== 'management') {
                toast.error(
                    data.role === 'investor'
                        ? 'Access denied! Investors must use the Investor Login portal.'
                        : 'Access denied! CRM staff must use the Staff CRM portal.'
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

            toast.success(`Welcome, Manager ${data.firstName}!`);
            router.push('/management');

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
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-500" 
                    style={{ backgroundImage: `url('${bgImage}')` }}
                />
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-gray-950 relative">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10">
                        <Link href="/" className="inline-block text-xs font-bold text-amber-500 mb-6 tracking-widest uppercase hover:underline">
                            ← Back to Website
                        </Link>
                        <h2 className="text-3xl font-bold text-white mb-2 font-serif">Manager Sign In</h2>
                        <p className="text-gray-500">Enter your credentials to access the manager dashboard.</p>
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
                                className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-white placeholder-gray-600"
                                placeholder="manager@livingvineproperties.com"
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
                                className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-white placeholder-gray-600"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-amber-600/20 transition-all hover:shadow-amber-600/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:transform-none"
                        >
                            {loading ? 'Authenticating...' : 'Access Management Console'}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-gray-800 pt-6 flex justify-around text-xs">
                        <Link href="/investor/login" className="text-gray-600 hover:text-amber-500 font-medium">Investor Portal</Link>
                        <span className="text-gray-800">|</span>
                        <Link href="/crm/login" className="text-gray-600 hover:text-amber-500 font-medium">CRM Staff Portal</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
