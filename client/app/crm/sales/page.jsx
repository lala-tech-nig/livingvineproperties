'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Calendar, Clock, ArrowRight, UserCheck, Phone, Mail, X, Gift, MapPin, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// ─── Helpers ────────────────────────────────────────────────────────────────
function getAnniversaryInfo(dateStr) {
    if (!dateStr) return null;
    const joined = new Date(dateStr);
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), joined.getMonth(), joined.getDate());
    if (thisYear < now) thisYear.setFullYear(now.getFullYear() + 1);
    const daysLeft = Math.ceil((thisYear - now) / (1000 * 60 * 60 * 24));
    const years = now.getFullYear() - joined.getFullYear() + (thisYear.getFullYear() > now.getFullYear() ? 0 : 1);
    return { daysLeft, years };
}

function InvestorModal({ investor, onClose }) {
    const ann = getAnniversaryInfo(investor.createdAt);
    const initials = `${investor.firstName?.[0] || ''}${investor.surname?.[0] || ''}`;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10"><X size={18} /></button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">{initials}</div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{investor.firstName} {investor.surname}</h3>
                            <p className="text-blue-200 text-sm capitalize">{investor.gender || 'Investor'} {investor.religion ? `· ${investor.religion}` : ''}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {ann && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl ${ann.daysLeft <= 30 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                            <Gift size={18} className={ann.daysLeft <= 30 ? 'text-amber-500' : 'text-gray-400'} />
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Anniversary</p>
                                <p className="text-sm font-semibold text-gray-900">Year {ann.years} · {ann.daysLeft === 0 ? '🎉 Today!' : `${ann.daysLeft} days away`}</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-xs text-gray-400 font-medium">Joined</p><p className="font-semibold text-gray-800">{new Date(investor.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                        {investor.state && <div><p className="text-xs text-gray-400 font-medium">State</p><p className="font-semibold text-gray-800">{investor.state}</p></div>}
                        {investor.age && <div><p className="text-xs text-gray-400 font-medium">Age</p><p className="font-semibold text-gray-800">{investor.age} yrs</p></div>}
                        <div><p className="text-xs text-gray-400 font-medium">Status</p><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${investor.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{investor.isActive ? 'Active' : 'Suspended'}</span></div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                        <a href={`mailto:${investor.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <Mail size={14} className="text-gray-400" />{investor.email}
                        </a>
                        {investor.phoneNumber && (
                            <a href={`https://wa.me/${investor.phoneNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                                <Phone size={14} className="text-gray-400" />{investor.phoneNumber}
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">WhatsApp</span>
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function SalesDashboard() {
    const { user } = useAuthStore();
    const [customers, setCustomers] = useState([]);
    const [leads, setLeads] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [myInvestors, setMyInvestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvestor, setSelectedInvestor] = useState(null);
    const [investorSearch, setInvestorSearch] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [custRes, leadsRes, tasksRes, investorsRes] = await Promise.all([
                    api.get('/crm/customers').catch(() => ({ data: [] })),
                    api.get('/crm/leads').catch(() => ({ data: [] })),
                    api.get('/tasks').catch(() => ({ data: [] })),
                    api.get('/users/my-investors').catch(() => ({ data: [] })),
                ]);
                setCustomers(custRes.data);
                setLeads(leadsRes.data);
                setTasks(tasksRes.data);
                setMyInvestors(investorsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate); d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });
    const newLeads = leads.filter(l => l.status === 'new');

    // Anniversary alerts (within 30 days)
    const anniversaryAlerts = myInvestors.filter(inv => {
        const ann = getAnniversaryInfo(inv.createdAt);
        return ann && ann.daysLeft <= 30;
    });

    const stats = [
        { name: 'Active Customers', value: loading ? '...' : customers.length.toString(), icon: Users, color: 'bg-blue-500', href: '/crm/sales/customers' },
        { name: 'New Leads', value: loading ? '...' : newLeads.length.toString(), icon: Target, color: 'bg-orange-500', href: '/crm/sales/leads' },
        { name: 'Due Today', value: loading ? '...' : todayTasks.length.toString(), icon: Calendar, color: 'bg-[#de1f25]', href: '/crm/sales/tasks' },
        { name: 'My Investors', value: loading ? '...' : myInvestors.length.toString(), icon: UserCheck, color: 'bg-purple-500', href: '#my-investors' },
    ];

    const filteredInvestors = myInvestors.filter(inv =>
        `${inv.firstName} ${inv.surname} ${inv.email} ${inv.state || ''}`.toLowerCase().includes(investorSearch.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-white">Welcome back, {user?.firstName}!</h2>
                <p className="text-gray-400">Here's what's happening with your sales pipeline today.</p>
            </header>

            {/* Anniversary Alerts */}
            {!loading && anniversaryAlerts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-900/30 border border-amber-700/40 rounded-2xl p-4 flex items-start gap-3">
                    <Gift className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-amber-300 font-bold text-sm">🎉 Upcoming Investor Anniversaries</p>
                        <p className="text-amber-400/80 text-xs mt-1">
                            {anniversaryAlerts.slice(0, 3).map(i => `${i.firstName} ${i.surname} (${getAnniversaryInfo(i.createdAt)?.daysLeft === 0 ? 'Today!' : `${getAnniversaryInfo(i.createdAt)?.daysLeft}d`})`).join(' · ')}
                            {anniversaryAlerts.length > 3 && ` +${anniversaryAlerts.length - 3} more`}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div key={stat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <Link href={stat.href} className="flex items-center gap-4 group">
                            <div className={`${stat.color} p-3 rounded-xl text-white`}><stat.icon size={24} /></div>
                            <div>
                                <p className="text-sm text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Customers */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-gray-900">Recent Customers</h3>
                        <Link href="/crm/sales/customers" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[1, 2, 3].map(i => (<div key={i} className="animate-pulse flex gap-3 items-center"><div className="w-9 h-9 rounded-full bg-gray-200" /><div className="flex-1 space-y-1.5"><div className="h-3 bg-gray-200 rounded w-1/3" /><div className="h-2.5 bg-gray-200 rounded w-1/2" /></div></div>))}</div>
                    ) : customers.slice(0, 5).length === 0 ? (
                        <div className="text-center py-8 text-gray-400"><Users size={36} className="mx-auto mb-3 opacity-20" /><p className="text-sm">No customers yet</p></div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {customers.slice(0, 5).map(c => (
                                <div key={c._id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">{c.firstName?.charAt(0)}{c.lastName?.charAt(0)}</div>
                                        <div><p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p><p className="text-xs text-gray-500">{c.email}</p></div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* High Priority Tasks */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-gray-900">High Priority Tasks</h3>
                        <Link href="/crm/sales/tasks" className="text-xs text-[#de1f25] hover:underline flex items-center gap-1">All tasks <ArrowRight size={12} /></Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[1, 2, 3].map(i => (<div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />))}</div>
                    ) : tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').slice(0, 5).length === 0 ? (
                        <div className="text-center py-8 text-gray-400"><Calendar size={36} className="mx-auto mb-3 opacity-20" /><p className="text-sm">No high-priority tasks</p></div>
                    ) : (
                        <div className="space-y-2">
                            {tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').slice(0, 5).map(t => (
                                <div key={t._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${t.priority === 'urgent' ? 'bg-purple-500' : 'bg-red-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                                        {t.dueDate && <p className="text-xs text-gray-500">Due: {new Date(t.dueDate).toLocaleDateString()}</p>}
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${t.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{t.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── My Investors ──────────────────────────────────────────────── */}
            <div id="my-investors" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center"><UserCheck size={18} className="text-purple-600" /></div>
                        <div>
                            <h3 className="font-bold text-gray-900">My Investor Portfolio</h3>
                            <p className="text-xs text-gray-500">{myInvestors.length} investor{myInvestors.length !== 1 ? 's' : ''} assigned to you</p>
                        </div>
                    </div>
                    <input value={investorSearch} onChange={e => setInvestorSearch(e.target.value)}
                        placeholder="Search name, email, state..." className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700" />
                </div>

                {loading ? (
                    <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />)}</div>
                ) : filteredInvestors.length === 0 ? (
                    <div className="p-12 text-center">
                        <UserCheck size={40} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-gray-400 text-sm font-medium">{myInvestors.length === 0 ? 'No investors assigned to you yet' : 'No results match your search'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-5 py-3">Investor</th>
                                <th className="px-5 py-3">Contact</th>
                                <th className="px-5 py-3">Demographics</th>
                                <th className="px-5 py-3">Joined</th>
                                <th className="px-5 py-3">Anniversary</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredInvestors.map(inv => {
                                    const ann = getAnniversaryInfo(inv.createdAt);
                                    return (
                                        <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">
                                                        {inv.firstName?.[0]}{inv.surname?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{inv.firstName} {inv.surname}</p>
                                                        <p className="text-xs text-gray-400">{inv.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex gap-2">
                                                    <a href={`mailto:${inv.email}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Mail size={14} /></a>
                                                    {inv.phoneNumber && <a href={`https://wa.me/${inv.phoneNumber.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Phone size={14} /></a>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {inv.gender && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium capitalize">{inv.gender}</span>}
                                                    {inv.religion && <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium capitalize">{inv.religion}</span>}
                                                    {inv.state && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">{inv.state}</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}</td>
                                            <td className="px-5 py-3">
                                                {ann && (
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ann.daysLeft === 0 ? 'bg-amber-200 text-amber-800' : ann.daysLeft <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {ann.daysLeft === 0 ? '🎉 Today!' : ann.daysLeft <= 30 ? `${ann.daysLeft}d 🔔` : `${ann.daysLeft}d`}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button onClick={() => setSelectedInvestor(inv)} className="text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">
                                                    View Info
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedInvestor && <InvestorModal investor={selectedInvestor} onClose={() => setSelectedInvestor(null)} />}
            </AnimatePresence>
        </div>
    );
}
