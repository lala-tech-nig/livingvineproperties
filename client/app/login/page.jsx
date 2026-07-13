'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import {
    ShieldCheck, Eye, EyeOff, Briefcase, Users, TrendingUp,
    Settings, Star, Building2, ChevronRight, X
} from 'lucide-react';

// ── Role routing config ──────────────────────────────────────────────────────
const STAFF_ROLES = ['sales', 'marketing', 'hr', 'management', 'ceo', 'superadmin'];

const ROLE_CONFIG = {
    sales:      { label: 'Sales Representative', icon: TrendingUp,  color: 'from-blue-500 to-blue-700',     path: '/crm/sales' },
    marketing:  { label: 'Marketing',             icon: Users,       color: 'from-rose-500 to-rose-700',     path: '/crm/marketing' },
    hr:         { label: 'HR Manager',            icon: Briefcase,   color: 'from-teal-500 to-teal-700',     path: '/crm/hr' },
    management: { label: 'Management',            icon: Settings,    color: 'from-amber-500 to-amber-700',   path: '/management' },
    ceo:        { label: 'CEO',                   icon: Star,        color: 'from-indigo-500 to-indigo-700', path: '/crm/ceo' },
    superadmin: { label: 'Super Admin',           icon: ShieldCheck, color: 'from-purple-500 to-purple-700', path: '/crm/superadmin' },
};

// ── Role Selection Modal ─────────────────────────────────────────────────────
function RoleSelectModal({ roles, userData, onSelect, onClose }) {
    const staffRoles = roles.filter(r => STAFF_ROLES.includes(r));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6">
                        <button onClick={onClose} className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Building2 size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg leading-tight">Select Dashboard</h2>
                                <p className="text-gray-400 text-xs">Welcome back, {userData?.firstName}</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-3">
                            You have access to multiple dashboards. Please choose which portal you'd like to enter.
                        </p>
                    </div>

                    {/* Role options */}
                    <div className="p-4 space-y-3">
                        {staffRoles.map(role => {
                            const config = ROLE_CONFIG[role];
                            if (!config) return null;
                            const Icon = config.icon;
                            return (
                                <motion.button
                                    key={role}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onSelect(role)}
                                    className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-md shrink-0`}>
                                        <Icon size={22} className="text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-gray-900 text-sm">{config.label} Dashboard</p>
                                        <p className="text-xs text-gray-500 mt-0.5 capitalize">{role} portal</p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                                </motion.button>
                            );
                        })}
                    </div>
                    <div className="px-4 pb-4">
                        <p className="text-center text-[11px] text-gray-400">Access controlled by LIVING VINE PRPPERTIES INVESTMENT LIMITED · Role-based authorization</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ── Unified Staff Login Page ─────────────────────────────────────────────────
export default function UnifiedStaffLoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop');

    // Multi-role modal state
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [pendingData, setPendingData] = useState(null);

    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        const fetchBg = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data?.loginBackground) setBgImage(data.loginBackground);
            } catch (_) {}
        };
        fetchBg();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const persistAndRedirect = (data, chosenRole) => {
        const userPayload = {
            id: data._id,
            email: data.email,
            role: chosenRole,
            roles: data.roles,
            firstName: data.firstName,
            surname: data.surname,
            profileImage: data.profileImage || null,
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userPayload));
        setUser(userPayload, data.token);
        toast.success(`Welcome, ${data.firstName}!`);
        const path = ROLE_CONFIG[chosenRole]?.path || '/crm';
        router.push(path);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', formData);

            // Block investors from this login portal
            if (data.role === 'investor' && (!data.roles || !data.roles.some(r => STAFF_ROLES.includes(r)))) {
                toast.error('Access denied! Investors must use the Investor Login portal.');
                setLoading(false);
                return;
            }

            // Multi-role: show modal to pick dashboard
            if (data.requiresRoleSelection) {
                setPendingData(data);
                setShowRoleModal(true);
                setLoading(false);
                return;
            }

            // Single staff role — redirect directly
            if (STAFF_ROLES.includes(data.role)) {
                persistAndRedirect(data, data.role);
            } else {
                toast.error('Access denied! Unauthorized role for this portal.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role) => {
        setShowRoleModal(false);
        if (pendingData) {
            persistAndRedirect(pendingData, role);
        }
    };

    return (
        <>
            {/* Role selection modal */}
            {showRoleModal && pendingData && (
                <RoleSelectModal
                    roles={pendingData.roles || []}
                    userData={pendingData}
                    onSelect={handleRoleSelect}
                    onClose={() => setShowRoleModal(false)}
                />
            )}

            <div className="min-h-screen grid lg:grid-cols-2">
                {/* ── Left: branded image panel ────────────────────── */}
                <div
                    className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
                    style={{ backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/60" />
                    <div className="relative z-10">
                        <img src="/living-logo.png" alt="LIVING VINE PRPPERTIES INVESTMENT LIMITED" className="h-10 w-auto" onError={e => e.target.style.display = 'none'} />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-white leading-tight mb-4">
                            Staff Portal<br />
                            <span className="text-amber-400">Access Control</span>
                        </h1>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Unified login for all LIVING VINE PRPPERTIES INVESTMENT LIMITED staff. CRM, Management, HR, Sales, and Marketing teams use this portal.
                        </p>
                    </div>
                </div>

                {/* ── Right: login form ─────────────────────────────── */}
                <div className="flex items-center justify-center p-8 bg-white min-h-screen">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        {/* Mobile logo */}
                        <div className="lg:hidden mb-8 flex items-center gap-3">
                            <img src="/living-logo.png" alt="" className="h-9 w-auto" onError={e => e.target.style.display = 'none'} />
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-amber-200 mb-4">
                                <ShieldCheck size={14} />
                                Staff Portal
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Sign in</h2>
                            <p className="text-gray-500 text-sm">Enter your work email and password to access your dashboard.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Work Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    placeholder="you@livingvineproperties.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all text-sm pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.01 }}
                                whileTap={{ scale: loading ? 1 : 0.99 }}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        Sign In to Portal
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <div className="mt-8 space-y-3 text-sm text-center text-gray-400">
                            <p>
                                Are you an investor?{' '}
                                <Link href="/investor/login" className="text-amber-600 font-semibold hover:underline">
                                    Use the Investor Portal →
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
