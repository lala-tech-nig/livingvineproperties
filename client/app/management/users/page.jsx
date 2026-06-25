'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Shield, ShieldOff, ChevronDown, RefreshCw,
    Mail, Phone, UserCog, CheckCircle, XCircle, Clock, Filter
} from 'lucide-react';

const ROLES_ASSIGNABLE = ['management', 'hr', 'sales', 'marketing'];
const CEO_ASSIGNABLE = ['management', 'hr', 'sales', 'marketing', 'ceo'];
const SUPERADMIN_ASSIGNABLE = ['management', 'hr', 'sales', 'marketing', 'ceo', 'superadmin'];

const ROLE_COLORS = {
    superadmin: 'bg-purple-100 text-purple-800 border-purple-200',
    ceo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    management: 'bg-amber-100 text-amber-800 border-amber-200',
    hr: 'bg-teal-100 text-teal-800 border-teal-200',
    sales: 'bg-blue-100 text-blue-800 border-blue-200',
    marketing: 'bg-rose-100 text-rose-800 border-rose-200',
    investor: 'bg-green-100 text-green-800 border-green-200',
};

const ROLE_LABELS = {
    superadmin: 'Super Admin',
    ceo: 'CEO',
    management: 'Management',
    hr: 'HR Manager',
    sales: 'Sales Rep',
    marketing: 'Marketing',
    investor: 'Investor',
};

export default function ManagementUsers() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);
    const [openRoleMenu, setOpenRoleMenu] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users/all');
            // Exclude investors from this management view (investors have their own portal)
            const operationalUsers = data.filter(u => u.role !== 'investor');
            setUsers(operationalUsers);
            setFiltered(operationalUsers);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    useEffect(() => {
        let result = users;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(u =>
                u.firstName?.toLowerCase().includes(q) ||
                u.surname?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
            );
        }
        if (roleFilter !== 'all') {
            result = result.filter(u => u.role === roleFilter);
        }
        setFiltered(result);
    }, [search, roleFilter, users]);

    const handleToggleSuspend = async (userId) => {
        setActionLoading(userId + '-suspend');
        try {
            const { data } = await api.put(`/users/${userId}/suspend`);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.isActive } : u));
            toast.success(data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setOpenRoleMenu(null);
        setActionLoading(userId + '-role');
        try {
            const { data } = await api.put(`/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success(data.message || `Role updated to ${newRole}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Role update failed');
        } finally {
            setActionLoading(null);
        }
    };

    const getAssignableRoles = () => {
        if (currentUser?.role === 'superadmin') return SUPERADMIN_ASSIGNABLE;
        if (currentUser?.role === 'ceo') return CEO_ASSIGNABLE;
        return ROLES_ASSIGNABLE;
    };

    const canModify = (targetUser) => {
        const tiers = { superadmin: 100, ceo: 80, management: 60, hr: 40, sales: 20, marketing: 20, investor: 0 };
        return (tiers[currentUser?.role] || 0) > (tiers[targetUser.role] || 0);
    };

    const totalActive = users.filter(u => u.isActive).length;
    const totalSuspended = users.filter(u => !u.isActive).length;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="text-amber-500" size={28} />
                        Staff Directory
                    </h1>
                    <p className="text-gray-400 mt-1">Manage operational accounts and access roles across the organization.</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Staff</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{totalActive}</p>
                    <p className="text-xs text-gray-500 mt-1">Active</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-rose-400">{totalSuspended}</p>
                    <p className="text-xs text-gray-500 mt-1">Suspended</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm transition-colors"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm appearance-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none cursor-pointer transition-colors"
                    >
                        <option value="all">All Roles</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="ceo">CEO</option>
                        <option value="management">Management</option>
                        <option value="hr">HR</option>
                        <option value="sales">Sales</option>
                        <option value="marketing">Marketing</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Staff Member</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="5" className="px-6 py-4">
                                            <div className="animate-pulse flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                        <Users size={40} className="mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No staff members found</p>
                                        <p className="text-sm mt-1">Try adjusting your search filters</p>
                                    </td>
                                </tr>
                            ) : filtered.map((u, idx) => (
                                <motion.tr
                                    key={u._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    {/* Name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {u.firstName?.charAt(0)}{u.surname?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{u.firstName} {u.surname}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {u.phoneNumber && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                                    <Phone size={12} className="text-gray-400" />
                                                    {u.phoneNumber}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                                <Mail size={12} className="text-gray-400" />
                                                {u.email}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Role — with dropdown for reassignment */}
                                    <td className="px-6 py-4">
                                        {canModify(u) ? (
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenRoleMenu(openRoleMenu === u._id ? null : u._id)}
                                                    disabled={actionLoading === u._id + '-role'}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold uppercase hover:opacity-80 transition-all ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                >
                                                    {actionLoading === u._id + '-role' ? (
                                                        <span className="animate-spin">⟳</span>
                                                    ) : (
                                                        <>
                                                            {ROLE_LABELS[u.role] || u.role}
                                                            <ChevronDown size={12} />
                                                        </>
                                                    )}
                                                </button>

                                                <AnimatePresence>
                                                    {openRoleMenu === u._id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                                                        >
                                                            <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Assign Role</p>
                                                            {getAssignableRoles()
                                                                .filter(r => r !== u.role)
                                                                .map(r => (
                                                                    <button
                                                                        key={r}
                                                                        onClick={() => handleRoleChange(u._id, r)}
                                                                        className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <span className={`w-2 h-2 rounded-full inline-block ${ROLE_COLORS[r]?.split(' ')[0] || 'bg-gray-400'}`} />
                                                                        {ROLE_LABELS[r] || r}
                                                                    </button>
                                                                ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold uppercase ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {ROLE_LABELS[u.role] || u.role}
                                            </span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            {u.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        {canModify(u) ? (
                                            <button
                                                onClick={() => handleToggleSuspend(u._id)}
                                                disabled={actionLoading === u._id + '-suspend'}
                                                title={u.isActive ? 'Suspend Account' : 'Activate Account'}
                                                className={`p-2 rounded-lg transition-colors ${u.isActive ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'} disabled:opacity-50`}
                                            >
                                                {actionLoading === u._id + '-suspend' ? (
                                                    <RefreshCw size={18} className="animate-spin" />
                                                ) : u.isActive ? (
                                                    <ShieldOff size={18} />
                                                ) : (
                                                    <Shield size={18} />
                                                )}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-300 italic">No access</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Close dropdown on outside click */}
            {openRoleMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setOpenRoleMenu(null)} />
            )}
        </div>
    );
}
