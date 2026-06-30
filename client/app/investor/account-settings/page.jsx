'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import {
    User, Calendar, Gift, Plus, Trash2, Save, CheckCircle2,
    ChevronLeft, Loader2, Heart, Cake, Star, Sparkles,
    MapPin, Briefcase, Shield, Camera, Phone, Mail, UserCheck, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

// ── Preset celebration date labels ──────────────────────────────────────────
const PRESET_LABELS = [
    { label: 'Birthday',           icon: Cake,    color: 'bg-pink-100 text-pink-600' },
    { label: 'Wedding Anniversary', icon: Heart,   color: 'bg-red-100 text-red-600' },
    { label: 'Business Anniversary',icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
    { label: 'Child\'s Birthday',   icon: Star,    color: 'bg-amber-100 text-amber-600' },
    { label: 'Other',               icon: Gift,    color: 'bg-purple-100 text-purple-600' },
];

// ── Profile completion ring ──────────────────────────────────────────────────
function CompletionRing({ percent }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const color = percent >= 80 ? '#22c55e' : percent >= 50 ? '#f59e0b' : '#de1f25';

    return (
        <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <div className="text-center z-10">
                <p className="text-2xl font-black text-gray-900">{percent}%</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-tight">Complete</p>
            </div>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AccountSettingsPage() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [completion, setCompletion]   = useState(null);
    const [activeSection, setActiveSection] = useState('profile');
    const [photoUrl, setPhotoUrl]       = useState('');
    const [photoUploading, setPhotoUploading] = useState(false);
    const photoInputRef = useRef(null);

    // Profile fields
    const [profile, setProfile] = useState({
        gender: '', religion: '', state: '', address: '', occupation: '', dob: '',
    });

    // Celebration dates
    const [celebrationDates, setCelebrationDates] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [newDate, setNewDate] = useState({ label: 'Birthday', customLabel: '', date: '' });
    const [showCustomLabel, setShowCustomLabel] = useState(false);

    const runningInvestments = investments.filter(inv => ['active', 'approved'].includes(inv.status));

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, completionRes, investmentsRes] = await Promise.all([
                api.get('/users/profile'),
                api.get('/users/profile/completion'),
                api.get('/investments/my').catch(() => ({ data: [] }))
            ]);
            const p = profileRes.data;
            setProfile({
                gender:     p.gender     || '',
                religion:   p.religion   || '',
                state:      p.state      || '',
                address:    p.address    || '',
                occupation: p.occupation || '',
                dob:        p.dob        ? p.dob.split('T')[0] : '',
            });
            setCelebrationDates(p.celebrationDates || []);
            setPhotoUrl(p.profileImage || '');
            setCompletion(completionRes.data);
            setInvestments(investmentsRes.data || []);
        } catch {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.put('/users/profile', { ...profile });
            const { data } = await api.get('/users/profile/completion');
            setCompletion(data);
            toast.success('Profile updated successfully!');
        } catch {
            toast.error('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCelebrationDates = async () => {
        setSaving(true);
        try {
            await api.put('/users/profile', { celebrationDates });
            const { data } = await api.get('/users/profile/completion');
            setCompletion(data);
            toast.success('Anniversary dates saved!');
        } catch {
            toast.error('Failed to save dates');
        } finally {
            setSaving(false);
        }
    };

    const handleAddDate = () => {
        const label = newDate.label === 'Other' ? (newDate.customLabel.trim() || 'Special Date') : newDate.label;
        if (!newDate.date) { toast.error('Please pick a date'); return; }
        setCelebrationDates(prev => [...prev, { label, date: newDate.date }]);
        setNewDate({ label: 'Birthday', customLabel: '', date: '' });
        setShowCustomLabel(false);
        toast.success(`${label} added!`);
    };

    const handleRemoveDate = (idx) => {
        setCelebrationDates(prev => prev.filter((_, i) => i !== idx));
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

        setPhotoUploading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const { data } = await api.post('/users/profile/photo', { imageBase64: ev.target.result });
                    setPhotoUrl(data.profileImage);
                    // Update authStore so sidebar avatar updates instantly
                    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                    if (storedToken) {
                        const updatedUser = { ...user, profileImage: data.profileImage };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        setUser(updatedUser, storedToken);
                    }
                    toast.success('Profile photo updated!');
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Upload failed');
                } finally {
                    setPhotoUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch { setPhotoUploading(false); }
    };

    const daysUntil = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
        if (next < now) next.setFullYear(now.getFullYear() + 1);
        return Math.ceil((next - now) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 size={32} className="animate-spin text-[#de1f25]" />
                <p className="text-gray-500 text-sm">Loading your account settings...</p>
            </div>
        );
    }

    const incompleteItems = completion?.checks?.filter(c => !c.done) || [];

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {/* Profile Photo + Header */}
            <div className="flex items-start gap-5">
                {/* Avatar with upload */}
                <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#de1f25] to-orange-500 flex items-center justify-center text-white text-2xl font-black overflow-hidden shadow-lg">
                        {photoUrl
                            ? <img src={photoUrl} alt="profile" className="w-full h-full object-cover" />
                            : <span>{user?.firstName?.charAt(0)}{user?.surname?.charAt(0)}</span>
                        }
                    </div>
                    <button onClick={() => photoInputRef.current?.click()} disabled={photoUploading}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-[#de1f25] rounded-full flex items-center justify-center text-[#de1f25] hover:bg-[#de1f25] hover:text-white transition-colors shadow-md disabled:opacity-60">
                        {photoUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                    <p className="text-gray-500 text-sm mt-1">Complete your profile so we can serve and celebrate you better.</p>
                    <p className="text-xs text-gray-400 mt-1">Tap the camera icon to update your profile photo.</p>
                </div>
            </div>

            {/* Completion Card */}
            {completion && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <CompletionRing percent={completion.percent} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900">Profile Completion</h3>
                                {completion.percent === 100 && <Sparkles size={16} className="text-amber-500" />}
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                {completion.percent === 100
                                    ? '🎉 Your profile is fully complete!'
                                    : `${completion.done} of ${completion.total} items completed. Fill in the remaining ${incompleteItems.length} to unlock full benefits.`}
                            </p>
                            {/* Progress bar */}
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${completion.percent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${completion.percent >= 80 ? 'bg-green-500' : completion.percent >= 50 ? 'bg-amber-500' : 'bg-[#de1f25]'}`} />
                            </div>
                            {/* Checklist */}
                            <div className="flex flex-wrap gap-2">
                                {completion.checks.map(c => (
                                    <span key={c.key} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${c.done ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {c.done ? <CheckCircle2 size={10} /> : <div className="w-2 h-2 rounded-full border border-gray-400" />}
                                        {c.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Section Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
                {[
                    { key: 'profile',  label: 'Personal Info',     icon: User },
                    { key: 'celebrate',label: 'Anniversary Dates', icon: Gift },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveSection(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeSection === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <tab.icon size={15} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Section: Personal Info ── */}
            {activeSection === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><User size={18} className="text-blue-600" /></div>
                        <div>
                            <h3 className="font-bold text-gray-900">Personal Information</h3>
                            <p className="text-xs text-gray-400">Basic demographic details that help us personalise your experience.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Date of Birth */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Cake size={12} /> Date of Birth
                            </label>
                            <input type="date" value={profile.dob} onChange={e => setProfile(p => ({ ...p, dob: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 focus:border-[#de1f25] bg-gray-50 text-gray-900" />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gender</label>
                            <select value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 bg-gray-50 text-gray-900">
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Religion */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Religion</label>
                            <select value={profile.religion} onChange={e => setProfile(p => ({ ...p, religion: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 bg-gray-50 text-gray-900">
                                <option value="">Select religion</option>
                                <option value="muslim">Muslim</option>
                                <option value="christian">Christian</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* State */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <MapPin size={12} /> State of Residence
                            </label>
                            <input type="text" value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}
                                placeholder="e.g. Lagos"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 focus:border-[#de1f25] bg-gray-50 text-gray-900" />
                        </div>

                        {/* Occupation */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Briefcase size={12} /> Occupation
                            </label>
                            <input type="text" value={profile.occupation} onChange={e => setProfile(p => ({ ...p, occupation: e.target.value }))}
                                placeholder="e.g. Business Owner"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 focus:border-[#de1f25] bg-gray-50 text-gray-900" />
                        </div>

                        {/* Home Address */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <MapPin size={12} /> Home Address
                            </label>
                            <textarea value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                                rows={2} placeholder="Full residential address"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 focus:border-[#de1f25] bg-gray-50 text-gray-900 resize-none" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button onClick={handleSaveProfile} disabled={saving}
                            className="flex items-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-[#de1f25]/20 transition-all disabled:opacity-60">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* ── Section: Celebration Dates ── */}
            {activeSection === 'celebrate' && (
                <motion.div key="celebrate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    {/* Intro */}
                    <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center"><Gift size={20} className="text-rose-500" /></div>
                            <div>
                                <h3 className="font-bold text-gray-900">Celebration Dates</h3>
                                <p className="text-xs text-gray-500">Tell us which dates you'd love us to celebrate you on.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Add your important dates — birthdays, anniversaries, and more. We'll send you personalised messages and exclusive surprises on those special days. 🎉
                        </p>
                    </div>

                    {/* Add new date */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2"><Plus size={16} className="text-[#de1f25]" />Add a Special Date</h4>

                        {/* Preset label pills */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Type of Date</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_LABELS.map(({ label, icon: Icon, color }) => (
                                    <button key={label} type="button"
                                        onClick={() => { setNewDate(p => ({ ...p, label })); setShowCustomLabel(label === 'Other'); }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${newDate.label === label ? `${color} border-transparent ring-2 ring-offset-1 ring-[#de1f25]/30` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                        <Icon size={12} /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom label (shown for "Other") */}
                        {showCustomLabel && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Custom Label</label>
                                <input type="text" value={newDate.customLabel} onChange={e => setNewDate(p => ({ ...p, customLabel: e.target.value }))}
                                    placeholder="e.g. Graduation Day, Business Launch"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 bg-gray-50 text-gray-900" />
                            </motion.div>
                        )}

                        {/* Date picker */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                            <div className="flex gap-3">
                                <input type="date" value={newDate.date} onChange={e => setNewDate(p => ({ ...p, date: e.target.value }))}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 focus:border-[#de1f25] bg-gray-50 text-gray-900" />
                                <button type="button" onClick={handleAddDate}
                                    className="bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-1.5 text-sm">
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Existing dates list */}
                    {celebrationDates.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-50">
                                <h4 className="font-bold text-gray-900">Your Celebration Calendar</h4>
                                <p className="text-xs text-gray-400">{celebrationDates.length} date{celebrationDates.length !== 1 ? 's' : ''} saved</p>
                            </div>
                            <div className="divide-y divide-gray-50">
                                <AnimatePresence>
                                    {celebrationDates.map((cd, idx) => {
                                        const days = daysUntil(cd.date);
                                        const preset = PRESET_LABELS.find(p => p.label === cd.label);
                                        const IconComp = preset?.icon || Gift;
                                        const color = preset?.color || 'bg-purple-100 text-purple-600';
                                        return (
                                            <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                                                    <IconComp size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm">{cd.label}</p>
                                                    <p className="text-xs text-gray-400">{new Date(cd.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${days === 0 ? 'bg-amber-100 text-amber-700' : days <= 30 ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        {days === 0 ? '🎉 Today!' : days <= 30 ? `🔔 ${days}d away` : `${days} days`}
                                                    </span>
                                                </div>
                                                <button onClick={() => handleRemoveDate(idx)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={15} />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                            <div className="p-5 border-t border-gray-50 flex justify-end">
                                <button onClick={handleSaveCelebrationDates} disabled={saving}
                                    className="flex items-center gap-2 bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-[#de1f25]/20 transition-all disabled:opacity-60">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'Saving...' : 'Save Dates'}
                                </button>
                            </div>
                        </div>
                    )}

                    {celebrationDates.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            <Gift size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No dates added yet.</p>
                            <p className="text-xs mt-1">Add your first special date above.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Mobile-only portfolio & account officer details */}
            <div className="lg:hidden mt-8 space-y-6 text-gray-900">
                {/* Running Portfolios Card */}
                <div className="bg-[#de1f25] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <p className="text-xs font-bold uppercase tracking-wider text-red-200 mb-2">Running Portfolios</p>
                    <p className="text-4xl font-black">{runningInvestments.length}</p>
                </div>

                {/* Account Officer Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                            <UserCheck size={16} className="text-orange-850" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Officer</p>
                            <p className="text-[10px] text-gray-300">Your dedicated representative</p>
                        </div>
                    </div>
                    {user?.accountOfficer ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-800 to-orange-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-inner">
                                    {user.accountOfficer.firstName?.[0]}{user.accountOfficer.surname?.[0]}
                                </div>
                                <div>
                                    <p className="font-extrabold text-gray-900 text-sm leading-none">{user.accountOfficer.firstName} {user.accountOfficer.surname}</p>
                                    <span className="text-[9px] font-bold text-orange-700 capitalize bg-orange-50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                                        {user.accountOfficer.role}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2.5 pt-3 border-t border-gray-50 text-xs">
                                <a href={`mailto:${user.accountOfficer.email}`} className="flex items-center gap-2 text-gray-500 hover:text-[#de1f25] transition-colors">
                                    <Mail size={14} className="text-gray-300" />
                                    <span className="truncate">{user.accountOfficer.email}</span>
                                </a>
                                {user.accountOfficer.phoneNumber && (
                                    <a href={`tel:${user.accountOfficer.phoneNumber}`} className="flex items-center gap-2 text-gray-500 hover:text-[#de1f25] transition-colors">
                                        <Phone size={14} className="text-gray-300" />
                                        <span>{user.accountOfficer.phoneNumber}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400">
                            <UserCheck size={24} className="mx-auto mb-2 opacity-30" />
                            <p className="text-xs font-semibold">No assigned Account Officer</p>
                        </div>
                    )}
                </div>

                {/* All Investments List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">All Investments</p>
                    <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto pr-1">
                        {investments.map(inv => (
                            <Link key={inv._id} href={`/investor/investment/${inv._id}`}
                                className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 transition-colors group">
                                <div className="min-w-0">
                                    <p className="text-sm font-extrabold text-gray-900">₦{inv.amountToInvest?.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">{inv._id.slice(-6).toUpperCase()}</p>
                                </div>
                                <span className={`shrink-0 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border ${
                                    inv.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' :
                                    inv.status === 'approved' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                    inv.status === 'reviewing' ? 'bg-yellow-50 border-yellow-200 text-amber-700' :
                                    'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                    {inv.status}
                                </span>
                            </Link>
                        ))}
                        {investments.length === 0 && (
                            <div className="text-center py-6 text-gray-400">
                                <p className="text-xs font-semibold">No portfolios created yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
