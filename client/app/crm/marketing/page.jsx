'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, Users, Mail, BarChart, Star, Save, ClipboardList, RefreshCw, Eye,
    UserCheck, Phone, X, Filter, Search, Gift, Send, Target, ChevronDown, Trash2, MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Investor Detail Modal ────────────────────────────────────────────────────
function InvestorModal({ investor, onClose }) {
    const ann = getAnniversaryInfo(investor.createdAt);
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-gradient-to-br from-pink-600 to-purple-700 p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10"><X size={18} /></button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">{investor.firstName?.[0]}{investor.surname?.[0]}</div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{investor.firstName} {investor.surname}</h3>
                            <p className="text-purple-200 text-sm capitalize">{investor.gender || 'Investor'}{investor.religion ? ` · ${investor.religion}` : ''}{investor.state ? ` · ${investor.state}` : ''}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {ann && ann.daysLeft <= 30 && (
                        <div className="flex items-center gap-3 p-3 bg-amber-900/20 border border-amber-700/30 rounded-xl">
                            <Gift size={16} className="text-amber-400" />
                            <p className="text-sm text-amber-300 font-medium">Anniversary in {ann.daysLeft === 0 ? 'Today! 🎉' : `${ann.daysLeft} days`} (Year {ann.years})</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-800 rounded-xl p-3"><p className="text-xs text-gray-500 font-medium">Joined</p><p className="text-sm font-semibold text-white">{new Date(investor.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                        {investor.age && <div className="bg-gray-800 rounded-xl p-3"><p className="text-xs text-gray-500 font-medium">Age</p><p className="text-sm font-semibold text-white">{investor.age} yrs</p></div>}
                        {investor.state && <div className="bg-gray-800 rounded-xl p-3"><p className="text-xs text-gray-500 font-medium">State</p><p className="text-sm font-semibold text-white">{investor.state}</p></div>}
                    </div>
                    {investor.accountOfficer && (
                        <div className="bg-gray-800 rounded-xl p-3">
                            <p className="text-xs text-gray-500 font-medium mb-1">Account Officer</p>
                            <p className="text-sm text-white font-semibold">{investor.accountOfficer.firstName} {investor.accountOfficer.surname}</p>
                            <p className="text-xs text-gray-400">{investor.accountOfficer.email}</p>
                        </div>
                    )}
                    <div className="flex gap-3 pt-1">
                        <a href={`mailto:${investor.email}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-700 rounded-xl text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                            <Mail size={14} /> Email
                        </a>
                        {investor.phoneNumber && (
                            <a href={`https://wa.me/${investor.phoneNumber.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-sm text-white font-semibold transition-colors">
                                <Phone size={14} /> WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Targeted Survey Modal ────────────────────────────────────────────────────
function TargetedSurveyModal({ targetCriteria, targetCount, onClose, onSuccess }) {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;
        setLoading(true);
        try {
            await api.post('/surveys', {
                question,
                isActive: true,
                targeting: targetCriteria,
            });
            toast.success(`Targeted survey published to ${targetCount} investor${targetCount !== 1 ? 's' : ''}!`);
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to publish survey');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center"><Target size={18} className="text-amber-400" /></div>
                        <div>
                            <h3 className="font-bold text-white">Send Targeted Survey</h3>
                            <p className="text-xs text-gray-400">Will show as pop-up to {targetCount} matching investor{targetCount !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white rounded-full hover:bg-gray-800"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-5">
                    {/* Target summary */}
                    <div className="bg-gray-800/60 border border-gray-750 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Audience</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                            {targetCriteria.religion && <span className="text-xs bg-purple-800/50 text-purple-300 border border-purple-700/40 px-2 py-0.5 rounded-full capitalize">Religion: {targetCriteria.religion}</span>}
                            {targetCriteria.gender && <span className="text-xs bg-blue-800/50 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded-full capitalize">Gender: {targetCriteria.gender}</span>}
                            {targetCriteria.state && <span className="text-xs bg-green-800/50 text-green-300 border border-green-700/40 px-2 py-0.5 rounded-full">State: {targetCriteria.state}</span>}
                            {(targetCriteria.ageMin || targetCriteria.ageMax) && <span className="text-xs bg-amber-800/50 text-amber-300 border border-amber-700/40 px-2 py-0.5 rounded-full">Age: {targetCriteria.ageMin || '0'}–{targetCriteria.ageMax || '∞'}</span>}
                            {!targetCriteria.religion && !targetCriteria.gender && !targetCriteria.state && !targetCriteria.ageMin && !targetCriteria.ageMax && (
                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">All Investors</span>
                            )}
                        </div>
                        <p className="text-sm font-bold text-amber-400">{targetCount} investor{targetCount !== 1 ? 's' : ''} will see this survey</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Survey Question</label>
                            <textarea value={question} onChange={e => setQuestion(e.target.value)} required rows={3}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none leading-relaxed"
                                placeholder="e.g. How has your Ramadan experience been with our platform this year?" />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-700 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 transition-colors">Cancel</button>
                            <button type="submit" disabled={loading || !question.trim()}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition-colors disabled:opacity-50">
                                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                                {loading ? 'Publishing...' : 'Publish Survey'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function MarketingDashboard() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('surveys');
    const [loading, setLoading] = useState(true);
    const [surveys, setSurveys] = useState([]);
    const [investors, setInvestors] = useState([]);
    const [investorsLoading, setInvestorsLoading] = useState(false);
    const [surveyQuestion, setSurveyQuestion] = useState('To help us better serve you, tell us your experience using our app today.');
    const [surveyActive, setSurveyActive] = useState(true);
    const [activeSurveyStats, setActiveSurveyStats] = useState({ totalResponses: 0, averageRating: 0, ratingBreakdown: [0, 0, 0, 0, 0] });

    // Investor filters
    const [filterReligion, setFilterReligion] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterState, setFilterState] = useState('');
    const [filterAgeMin, setFilterAgeMin] = useState('');
    const [filterAgeMax, setFilterAgeMax] = useState('');
    const [investorSearch, setInvestorSearch] = useState('');
    const [selectedInvestor, setSelectedInvestor] = useState(null);
    const [showTargetedSurvey, setShowTargetedSurvey] = useState(false);

    useEffect(() => { fetchMarketingData(); }, []);

    const fetchMarketingData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/surveys/responses');
            setSurveys(data);
            const activeSurvey = data.find(s => s.isActive);
            if (activeSurvey) { setSurveyQuestion(activeSurvey.question); setSurveyActive(true); calculateStats(activeSurvey); }
            else if (data.length > 0) { setSurveyQuestion(data[0].question); setSurveyActive(false); }
        } catch (error) {
            toast.error('Failed to load surveys data');
        } finally {
            setLoading(false);
        }
    };

    const fetchInvestors = useCallback(async () => {
        setInvestorsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterReligion) params.set('religion', filterReligion);
            if (filterGender) params.set('gender', filterGender);
            if (filterState) params.set('state', filterState);
            if (filterAgeMin) params.set('ageMin', filterAgeMin);
            if (filterAgeMax) params.set('ageMax', filterAgeMax);
            const { data } = await api.get(`/users/investors?${params}`);
            setInvestors(data);
        } catch (e) {
            toast.error('Failed to load investor database');
        } finally {
            setInvestorsLoading(false);
        }
    }, [filterReligion, filterGender, filterState, filterAgeMin, filterAgeMax]);

    useEffect(() => {
        if (activeTab === 'outreach') fetchInvestors();
    }, [activeTab, fetchInvestors]);

    const calculateStats = (survey) => {
        if (!survey?.responses?.length) { setActiveSurveyStats({ totalResponses: 0, averageRating: 0, ratingBreakdown: [0, 0, 0, 0, 0] }); return; }
        const count = survey.responses.length;
        const totalRating = survey.responses.reduce((sum, r) => sum + r.rating, 0);
        const breakdown = [0, 0, 0, 0, 0];
        survey.responses.forEach(r => { const i = Math.min(Math.max(r.rating - 1, 0), 4); breakdown[i]++; });
        setActiveSurveyStats({ totalResponses: count, averageRating: parseFloat((totalRating / count).toFixed(1)), ratingBreakdown: breakdown });
    };

    const handleCreateSurvey = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Publishing survey...');
        try {
            await api.post('/surveys', { question: surveyQuestion, isActive: surveyActive });
            toast.success('Survey published!', { id: toastId });
            fetchMarketingData();
        } catch (error) {
            toast.error('Failed to publish survey', { id: toastId });
        }
    };

    const handleToggleSurvey = async (surveyId) => {
        try {
            await api.put(`/surveys/${surveyId}/toggle`);
            toast.success('Survey status changed!');
            fetchMarketingData();
        } catch { toast.error('Failed to change status'); }
    };

    const handleDeleteSurvey = async (surveyId) => {
        if (!confirm('Delete this survey and all responses?')) return;
        try {
            await api.delete(`/surveys/${surveyId}`);
            toast.success('Survey deleted');
            fetchMarketingData();
        } catch { toast.error('Failed to delete survey'); }
    };

    const totalResponsesCount = surveys.reduce((acc, curr) => acc + (curr.responses?.length || 0), 0);
    const activeSurvey = surveys.find(s => s.isActive);

    const filteredInvestors = investors.filter(inv =>
        `${inv.firstName} ${inv.surname} ${inv.email} ${inv.state || ''} ${inv.phoneNumber || ''}`.toLowerCase().includes(investorSearch.toLowerCase())
    );

    const targetCriteria = {
        religion: filterReligion || null,
        gender: filterGender || null,
        state: filterState || null,
        ageMin: filterAgeMin ? Number(filterAgeMin) : null,
        ageMax: filterAgeMax ? Number(filterAgeMax) : null,
    };

    const stats = [
        { name: 'Total Feedbacks', value: String(totalResponsesCount), icon: Users, color: 'bg-pink-500' },
        { name: 'Active Survey', value: activeSurvey ? 'Online' : 'Offline', icon: Megaphone, color: 'bg-yellow-500' },
        { name: 'Avg. Rating', value: activeSurveyStats.averageRating > 0 ? `${activeSurveyStats.averageRating} ★` : 'N/A', icon: Star, color: 'bg-blue-500' },
        { name: 'Total Investors', value: investors.length > 0 ? String(investors.length) : '—', icon: UserCheck, color: 'bg-purple-500' },
    ];

    if (loading) return <div className="p-10 text-center text-white">Loading marketing database...</div>;

    return (
        <div className="space-y-8 text-white">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Megaphone className="text-pink-500" />Marketing & Investor Outreach</h2>
                    <p className="text-gray-400">Manage surveys, segment your investor base, and run targeted campaigns.</p>
                </div>
                <button onClick={fetchMarketingData} className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition-all"><RefreshCw size={18} /></button>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div key={stat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 text-gray-900">
                        <div className="flex items-center gap-4">
                            <div className={`${stat.color} p-3 rounded-xl text-white`}><stat.icon size={24} /></div>
                            <div><p className="text-sm text-gray-500">{stat.name}</p><p className="text-2xl font-bold text-gray-900">{stat.value}</p></div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-white/10 p-1 rounded-xl w-fit">
                {[
                    { key: 'surveys', label: 'Feedback Surveys', icon: ClipboardList },
                    { key: 'outreach', label: 'Investor Outreach', icon: Target },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'}`}>
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Surveys ── */}
            {activeTab === 'surveys' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Publisher */}
                        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2"><ClipboardList className="text-amber-500" />Configure Active Survey</h3>
                            <form onSubmit={handleCreateSurvey} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2">Survey Question Text</label>
                                    <textarea value={surveyQuestion} onChange={e => setSurveyQuestion(e.target.value)} required rows={3}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 text-white outline-none resize-none leading-relaxed"
                                        placeholder="To help us better serve you, tell us your experience..." />
                                </div>
                                <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                                    <div className="flex items-center gap-2.5">
                                        <input id="surveyActive" type="checkbox" checked={surveyActive} onChange={e => setSurveyActive(e.target.checked)}
                                            className="rounded border-gray-800 text-amber-500 focus:ring-amber-500 bg-gray-900 w-4 h-4 cursor-pointer" />
                                        <label htmlFor="surveyActive" className="text-sm font-semibold cursor-pointer text-gray-300">Set active (pushes pop-up to investors)</label>
                                    </div>
                                    <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all text-sm">
                                        <Save size={16} /> Publish Survey
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Stats */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Active Survey Statistics</h3>
                                <p className="text-xs text-gray-500 mt-1">Breakdown for the currently online survey.</p>
                            </div>
                            {activeSurveyStats.totalResponses === 0 ? (
                                <div className="py-10 text-center text-gray-500 text-sm">No responses gathered yet.</div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-baseline justify-between border-b border-gray-800 pb-3">
                                        <span className="text-sm text-gray-400">Average Rating</span>
                                        <span className="text-3xl font-black text-amber-400 flex items-center gap-1">{activeSurveyStats.averageRating} <Star size={20} fill="currentColor" className="text-amber-500" /></span>
                                    </div>
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map(stars => {
                                            const count = activeSurveyStats.ratingBreakdown[stars - 1] || 0;
                                            const percent = Math.round((count / activeSurveyStats.totalResponses) * 100);
                                            return (
                                                <div key={stars} className="flex items-center gap-2 text-xs">
                                                    <span className="w-12 text-gray-400 font-bold">{stars} Stars</span>
                                                    <div className="flex-1 h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                                                    </div>
                                                    <span className="w-16 text-right text-gray-400 font-bold">{count} ({percent}%)</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Surveys history */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold">All Surveys & Submissions History</h3>
                        <div className="space-y-6">
                            {surveys.length === 0 ? (
                                <p className="text-center text-gray-500 py-10">No surveys created yet.</p>
                            ) : surveys.map(survey => (
                                <div key={survey._id} className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
                                    <div className="p-4 bg-gray-900/60 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h4 className="font-bold text-white text-base">"{survey.question}"</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-gray-500">Created: {new Date(survey.createdAt).toLocaleDateString()} · {survey.responses?.length || 0} replies</p>
                                                {survey.targeting && Object.values(survey.targeting).some(v => v) && (
                                                    <span className="text-[10px] bg-purple-900/60 text-purple-300 border border-purple-700/30 px-2 py-0.5 rounded-full">Targeted</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleToggleSurvey(survey._id)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${survey.isActive ? 'bg-emerald-600/10 border-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                                {survey.isActive ? 'Active (Click to Stop)' : 'Make Active'}
                                            </button>
                                            <button onClick={() => handleDeleteSurvey(survey._id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-800 rounded-lg transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-800 max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                        {(!survey.responses || survey.responses.length === 0) ? (
                                            <div className="p-4 text-center text-xs text-gray-600">No feedback received yet.</div>
                                        ) : survey.responses.map(resp => (
                                            <div key={resp._id} className="p-4 flex gap-4 items-start hover:bg-gray-950/40 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 font-black text-xs flex items-center justify-center shrink-0">{resp.userName?.[0] || 'U'}</div>
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold text-white">{resp.userName}</span>
                                                        <span className="text-[10px] text-gray-500">{new Date(resp.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={14} fill={i < resp.rating ? 'currentColor' : 'none'} className={i < resp.rating ? 'text-amber-500' : 'text-gray-700'} />))}
                                                        <span className="text-xs text-gray-400 font-bold ml-1">{resp.rating} stars</span>
                                                    </div>
                                                    {resp.feedback && <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/40 p-2.5 rounded-lg border border-gray-800 max-w-2xl whitespace-pre-wrap">{resp.feedback}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: Investor Outreach ── */}
            {activeTab === 'outreach' && (
                <div className="space-y-5">
                    {/* Filter Panel */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2"><Filter size={16} className="text-pink-400" />Segment Investors</h3>
                            <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">{filteredInvestors.length} / {investors.length} investors</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="relative lg:col-span-2">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input value={investorSearch} onChange={e => setInvestorSearch(e.target.value)} placeholder="Search name, email, state..."
                                    className="w-full pl-8 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/30 placeholder-gray-600" />
                            </div>
                            <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
                                className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none">
                                <option value="">All Genders</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <select value={filterReligion} onChange={e => setFilterReligion(e.target.value)}
                                className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none">
                                <option value="">All Religions</option>
                                <option value="muslim">Muslim</option>
                                <option value="christian">Christian</option>
                                <option value="other">Other</option>
                            </select>
                            <input value={filterState} onChange={e => setFilterState(e.target.value)} placeholder="State..."
                                className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none" />
                            <div className="flex gap-1">
                                <input value={filterAgeMin} onChange={e => setFilterAgeMin(e.target.value)} placeholder="Age min" type="number" min="0"
                                    className="w-1/2 px-2 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none" />
                                <input value={filterAgeMax} onChange={e => setFilterAgeMax(e.target.value)} placeholder="Max" type="number" min="0"
                                    className="w-1/2 px-2 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={fetchInvestors} className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-bold transition-colors">
                                <Filter size={14} /> Apply Filters
                            </button>
                            {(filterGender || filterReligion || filterState || filterAgeMin || filterAgeMax) && (
                                <button onClick={() => { setFilterGender(''); setFilterReligion(''); setFilterState(''); setFilterAgeMin(''); setFilterAgeMax(''); }}
                                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1"><X size={12} /> Clear All</button>
                            )}
                            <div className="ml-auto flex items-center gap-3">
                                <button onClick={() => setShowTargetedSurvey(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition-colors">
                                    <Target size={16} /> Send Targeted Survey ({filteredInvestors.length})
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Investor Table */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        {investorsLoading ? (
                            <div className="p-10 text-center"><RefreshCw size={24} className="animate-spin mx-auto text-gray-600 mb-3" /><p className="text-gray-500 text-sm">Loading investor database...</p></div>
                        ) : filteredInvestors.length === 0 ? (
                            <div className="p-12 text-center"><UserCheck size={40} className="mx-auto mb-3 text-gray-700" /><p className="text-gray-500 font-medium">No investors match your filters</p></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead><tr className="bg-gray-800/60 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="px-5 py-3.5">Investor</th>
                                        <th className="px-5 py-3.5">Segment</th>
                                        <th className="px-5 py-3.5">Account Officer</th>
                                        <th className="px-5 py-3.5">Joined</th>
                                        <th className="px-5 py-3.5">Anniversary</th>
                                        <th className="px-5 py-3.5 text-right">Contact</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-gray-800/60">
                                        {filteredInvestors.map(inv => {
                                            const ann = getAnniversaryInfo(inv.createdAt);
                                            return (
                                                <tr key={inv._id} className="hover:bg-gray-800/40 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">{inv.firstName?.[0]}{inv.surname?.[0]}</div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-white">{inv.firstName} {inv.surname}</p>
                                                                <p className="text-xs text-gray-500">{inv.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex flex-wrap gap-1">
                                                            {inv.gender && <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded font-medium capitalize">{inv.gender}</span>}
                                                            {inv.religion && <span className="text-[10px] px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded font-medium capitalize">{inv.religion}</span>}
                                                            {inv.state && <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded font-medium"><MapPin size={8} className="inline mr-0.5" />{inv.state}</span>}
                                                            {inv.age && <span className="text-[10px] px-1.5 py-0.5 bg-green-900/50 text-green-300 rounded font-medium">{inv.age}y</span>}
                                                            {!inv.gender && !inv.religion && !inv.state && !inv.age && <span className="text-[10px] text-gray-600 italic">No data</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {inv.accountOfficer ? (
                                                            <p className="text-xs text-gray-400">{inv.accountOfficer.firstName} {inv.accountOfficer.surname}</p>
                                                        ) : <span className="text-xs text-gray-600 italic">Unassigned</span>}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{new Date(inv.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                    <td className="px-5 py-3.5">
                                                        {ann && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ann.daysLeft === 0 ? 'bg-amber-400/20 text-amber-300' : ann.daysLeft <= 30 ? 'bg-amber-900/30 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
                                                            {ann.daysLeft === 0 ? '🎉 Today!' : ann.daysLeft <= 30 ? `🔔 ${ann.daysLeft}d` : `${ann.daysLeft}d`}
                                                        </span>}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button onClick={() => setSelectedInvestor(inv)} className="text-xs font-semibold text-pink-400 hover:text-pink-300 bg-pink-900/20 hover:bg-pink-900/40 px-2.5 py-1.5 rounded-lg transition-colors">
                                                                <Eye size={13} />
                                                            </button>
                                                            <a href={`mailto:${inv.email}`} className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"><Mail size={14} /></a>
                                                            {inv.phoneNumber && <a href={`https://wa.me/${inv.phoneNumber.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"><Phone size={14} /></a>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {selectedInvestor && <InvestorModal investor={selectedInvestor} onClose={() => setSelectedInvestor(null)} />}
                {showTargetedSurvey && (
                    <TargetedSurveyModal
                        targetCriteria={targetCriteria}
                        targetCount={filteredInvestors.length}
                        onClose={() => setShowTargetedSurvey(false)}
                        onSuccess={fetchMarketingData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
