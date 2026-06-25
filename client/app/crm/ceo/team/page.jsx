'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, ShieldOff, Users, RefreshCw, Mail, Phone,
    ChevronDown, UserCog, Search
} from 'lucide-react';

const ROLE_LABELS = {
    superadmin: 'Super Admin',
    ceo: 'CEO',
    management: 'Management',
    hr: 'HR Manager',
    sales: 'Sales Rep',
    marketing: 'Marketing Lead',
};

const ROLE_COLORS = {
    superadmin: 'bg-purple-100 text-purple-800',
    ceo: 'bg-indigo-100 text-indigo-800',
    management: 'bg-amber-100 text-amber-800',
    hr: 'bg-teal-100 text-teal-800',
    sales: 'bg-blue-100 text-blue-800',
    marketing: 'bg-rose-100 text-rose-800',
};

const TIER_ACCENT = {
    superadmin: 'from-purple-500 to-purple-700',
    ceo: 'from-indigo-500 to-indigo-700',
    management: 'from-amber-500 to-amber-700',
    hr: 'from-teal-500 to-teal-700',
    sales: 'from-blue-500 to-blue-700',
    marketing: 'from-rose-500 to-rose-700',
};

export default function CeoTeam() {
    const { user: currentUser } = useAuthStore();
    const [team, setTeam] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [openRoleMenu, setOpenRoleMenu] = useState(null);

    const fetchTeam = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users/all');
            // CEO sees all operational staff (no investors)
            const staff = data.filter(u => u.role !== 'investor');
            setTeam(staff);
            setFiltered(staff);
        } catch (err) {
            toast.error('Failed to load team data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTeam(); }, [fetchTeam]);

    useEffect(() => {
        if (!search) {
            setFiltered(team);
        } else {
            const q = search.toLowerCase();
            setFiltered(team.filter(u =>
                u.firstName?.toLowerCase().includes(q) ||
                u.surname?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
            ));
        }
    }, [search, team]);

    const tiers = { superadmin: 100, ceo: 80, management: 60, hr: 40, sales: 20, marketing: 20, investor: 0 };
    const myTier = tiers[currentUser?.role] || 0;
    const canModify = (targetUser) => myTier > (tiers[targetUser.role] || 0);

    const getAssignableRoles = () => {
        return Object.keys(tiers).filter(r => r !== 'investor' && tiers[r] < myTier);
    };

    const handleToggleSuspend = async (userId) => {
        setActionLoading(userId + '-suspend');
        try {
            const { data } = await api.put(`/users/${userId}/suspend`);
            setTeam(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.isActive } : u));
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
            setTeam(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success(data.message || `Role reassigned to ${newRole}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Role update failed');
        } finally {
            setActionLoading(null);
        }
    };

    const activeCount = team.filter(u => u.isActive).length;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="text-[#de1f25]" size={28} />
                        Executive Team Overview
                    </h1>
                    <p className="text-gray-400 mt-1">Full visibility into staff roles, activity status, and access levels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500">Active Staff</p>
                        <p className="text-2xl font-bold text-emerald-400">{activeCount}/{team.length}</p>
                    </div>
                    <button
                        onClick={fetchTeam}
                        className="p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search staff by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#de1f25]/30 focus:border-[#de1f25]/60 outline-none text-sm transition-colors"
                />
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
                            <div className="flex gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-gray-800" />
                                <div className="flex-1 space-y-2 pt-2">
                                    <div className="h-3 bg-gray-800 rounded w-3/4" />
                                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-8 bg-gray-800 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-600">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium text-gray-400">No staff members found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filtered.map((member, idx) => (
                            <motion.div
                                key={member._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
                            >
                                {/* Top accent strip based on role */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${TIER_ACCENT[member.role] || 'from-gray-400 to-gray-600'}`} />

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${TIER_ACCENT[member.role] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white font-bold text-lg`}>
                                                {member.firstName?.charAt(0)}{member.surname?.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{member.firstName} {member.surname}</h3>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${member.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            {member.isActive ? '● Active' : '● Suspended'}
                                        </span>
                                    </div>

                                    {member.phoneNumber && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-3">
                                            <Phone size={12} className="text-gray-400" />
                                            {member.phoneNumber}
                                        </p>
                                    )}

                                    {/* Role Badge & Reassign */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="relative">
                                            {canModify(member) ? (
                                                <>
                                                    <button
                                                        onClick={() => setOpenRoleMenu(openRoleMenu === member._id ? null : member._id)}
                                                        disabled={actionLoading === member._id + '-role'}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase hover:opacity-80 transition-all ${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-700'}`}
                                                    >
                                                        {actionLoading === member._id + '-role' ? '...' : ROLE_LABELS[member.role] || member.role}
                                                        <ChevronDown size={11} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {openRoleMenu === member._id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                                                transition={{ duration: 0.12 }}
                                                                className="absolute z-50 bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[150px]"
                                                            >
                                                                <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100">Change Role</p>
                                                                {getAssignableRoles()
                                                                    .filter(r => r !== member.role)
                                                                    .map(r => (
                                                                        <button
                                                                            key={r}
                                                                            onClick={() => handleRoleChange(member._id, r)}
                                                                            className={`w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors`}
                                                                        >
                                                                            {ROLE_LABELS[r] || r}
                                                                        </button>
                                                                    ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-700'}`}>
                                                    {ROLE_LABELS[member.role] || member.role}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {canModify(member) && (
                                        <button
                                            onClick={() => handleToggleSuspend(member._id)}
                                            disabled={actionLoading === member._id + '-suspend'}
                                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-colors border ${
                                                member.isActive
                                                    ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                            } disabled:opacity-50`}
                                        >
                                            {actionLoading === member._id + '-suspend' ? (
                                                <RefreshCw size={16} className="animate-spin" />
                                            ) : member.isActive ? (
                                                <><ShieldOff size={16} /> Suspend Account</>
                                            ) : (
                                                <><Shield size={16} /> Activate Account</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {openRoleMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setOpenRoleMenu(null)} />
            )}
        </div>
    );
}
