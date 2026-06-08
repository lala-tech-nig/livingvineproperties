'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Megaphone, Users, Mail, BarChart, Star, Save, ClipboardList, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';

export default function MarketingDashboard() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [surveys, setSurveys] = useState([]);
    const [surveyQuestion, setSurveyQuestion] = useState('To help us better serve you, tell us your experience using our app today.');
    const [surveyActive, setSurveyActive] = useState(true);
    const [activeSurveyStats, setActiveSurveyStats] = useState({
        totalResponses: 0,
        averageRating: 0,
        ratingBreakdown: [0, 0, 0, 0, 0] // 1 to 5 stars counts
    });

    useEffect(() => {
        fetchMarketingData();
    }, []);

    const fetchMarketingData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/surveys/responses');
            setSurveys(data);
            
            // Extract stats from the active survey if any
            const activeSurvey = data.find(s => s.isActive);
            if (activeSurvey) {
                setSurveyQuestion(activeSurvey.question);
                setSurveyActive(activeSurvey.isActive);
                calculateStats(activeSurvey);
            } else if (data.length > 0) {
                // Pre-fill question with the most recent survey question
                setSurveyQuestion(data[0].question);
                setSurveyActive(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load surveys data');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (survey) => {
        if (!survey || !survey.responses || survey.responses.length === 0) {
            setActiveSurveyStats({
                totalResponses: 0,
                averageRating: 0,
                ratingBreakdown: [0, 0, 0, 0, 0]
            });
            return;
        }
        
        const count = survey.responses.length;
        const totalRating = survey.responses.reduce((sum, r) => sum + r.rating, 0);
        const avg = parseFloat((totalRating / count).toFixed(1));
        
        const breakdown = [0, 0, 0, 0, 0];
        survey.responses.forEach(r => {
            const index = Math.min(Math.max(r.rating - 1, 0), 4);
            breakdown[index]++;
        });

        setActiveSurveyStats({
            totalResponses: count,
            averageRating: avg,
            ratingBreakdown: breakdown
        });
    };

    const handleCreateSurvey = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Publishing new feedback survey...');
        try {
            const { data } = await api.post('/surveys', {
                question: surveyQuestion,
                isActive: surveyActive
            });
            toast.success('Feedback survey published successfully!', { id: toastId });
            
            // Reload surveys list
            const { data: updatedSurveys } = await api.get('/surveys/responses');
            setSurveys(updatedSurveys);
            const activeSurvey = updatedSurveys.find(s => s.isActive);
            if (activeSurvey) calculateStats(activeSurvey);
        } catch (error) {
            console.error(error);
            toast.error('Failed to publish survey', { id: toastId });
        }
    };

    const handleToggleSurvey = async (surveyId) => {
        try {
            const { data } = await api.put(`/surveys/${surveyId}/toggle`);
            toast.success(`Survey status changed!`);
            
            // Reload list
            const { data: updatedSurveys } = await api.get('/surveys/responses');
            setSurveys(updatedSurveys);
            const activeSurvey = updatedSurveys.find(s => s.isActive);
            if (activeSurvey) {
                setSurveyQuestion(activeSurvey.question);
                setSurveyActive(activeSurvey.isActive);
                calculateStats(activeSurvey);
            } else {
                setSurveyActive(false);
                setActiveSurveyStats({ totalResponses: 0, averageRating: 0, ratingBreakdown: [0, 0, 0, 0, 0] });
            }
        } catch (error) {
            toast.error('Failed to change status');
        }
    };

    const handleDeleteSurvey = async (surveyId) => {
        if (!confirm('Are you sure you want to delete this survey and all its responses?')) return;
        try {
            await api.delete(`/surveys/${surveyId}`);
            toast.success('Survey deleted');
            fetchMarketingData();
        } catch (error) {
            toast.error('Failed to delete survey');
        }
    };

    // Calculate aggregated stats
    const totalResponsesCount = surveys.reduce((acc, curr) => acc + (curr.responses?.length || 0), 0);
    const activeSurvey = surveys.find(s => s.isActive);

    const stats = [
        { name: 'Total Feedbacks', value: String(totalResponsesCount), icon: Users, color: 'bg-pink-500' },
        { name: 'Active Question', value: activeSurvey ? 'Online' : 'Offline', icon: Megaphone, color: 'bg-yellow-500' },
        { name: 'Average Rating', value: activeSurveyStats.averageRating > 0 ? `${activeSurveyStats.averageRating} ★` : 'N/A', icon: Mail, color: 'bg-blue-500' },
        { name: 'Conv. Rate', value: activeSurveyStats.totalResponses > 0 ? `${activeSurveyStats.totalResponses} replies` : '0 replies', icon: BarChart, color: 'bg-green-500' },
    ];

    if (loading) return <div className="p-10 text-center text-white">Loading marketing database...</div>;

    return (
        <div className="space-y-8 text-white">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Megaphone className="text-pink-500" />
                        Marketing & Client Feedback Hub
                    </h2>
                    <p className="text-gray-400">Configure client-wide pop-up experience surveys and analyze rating feedbacks.</p>
                </div>
                <button onClick={fetchMarketingData} className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition-all">
                    <RefreshCw size={18} />
                </button>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 text-gray-900"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`${stat.color} p-3 rounded-xl text-white`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Survey Publisher and Active Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Publisher */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ClipboardList className="text-amber-500" />
                        Configure Active Survey
                    </h3>
                    <form onSubmit={handleCreateSurvey} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Survey Question Text</label>
                            <textarea
                                value={surveyQuestion}
                                onChange={e => setSurveyQuestion(e.target.value)}
                                required
                                rows={3}
                                className="w-full bg-gray-950 border border-gray-850 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 text-white outline-none resize-none leading-relaxed"
                                placeholder="To help us better serve you, tell us your experience using our app today..."
                            />
                        </div>
                        <div className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-850">
                            <div className="flex items-center gap-2.5">
                                <input
                                    id="surveyActive"
                                    type="checkbox"
                                    checked={surveyActive}
                                    onChange={e => setSurveyActive(e.target.checked)}
                                    className="rounded border-gray-800 text-amber-500 focus:ring-amber-500 bg-gray-900 w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="surveyActive" className="text-sm font-semibold cursor-pointer text-gray-300">Set active (automatically pushes pop-up modal on client screens)</label>
                            </div>
                            <button
                                type="submit"
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all text-sm shadow-md"
                            >
                                <Save size={16} /> Publish Survey
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2. Active Stats Breakdown */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold">Active Survey Statistics</h3>
                        <p className="text-xs text-gray-500 mt-1">Breakdown metrics for the currently online questionnaire.</p>
                    </div>

                    {activeSurveyStats.totalResponses === 0 ? (
                        <div className="py-10 text-center text-gray-500 text-sm">
                            No responses gathered for this active survey yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-baseline justify-between border-b border-gray-800 pb-3">
                                <span className="text-sm text-gray-400">Average Rating</span>
                                <span className="text-3xl font-black text-amber-400 flex items-center gap-1">
                                    {activeSurveyStats.averageRating} <Star size={20} fill="currentColor" className="text-amber-500" />
                                </span>
                            </div>

                            {/* Stars progress lines */}
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map(stars => {
                                    const count = activeSurveyStats.ratingBreakdown[stars - 1] || 0;
                                    const percent = Math.round((count / activeSurveyStats.totalResponses) * 100);
                                    return (
                                        <div key={stars} className="flex items-center gap-2 text-xs">
                                            <span className="w-12 text-gray-400 font-bold">{stars} Stars</span>
                                            <div className="flex-1 h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-850">
                                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                                            </div>
                                            <span className="w-8 text-right text-gray-400 font-bold">{count} ({percent}%)</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="text-[10px] text-gray-650 text-center border-t border-gray-850 pt-3 mt-4">
                        Active submissions are recorded in real-time.
                    </div>
                </div>
            </div>

            {/* List of Surveys and Feedbacks */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-bold">All Surveys & Submissions History</h3>

                <div className="space-y-6">
                    {surveys.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No surveys have been created yet.</p>
                    ) : surveys.map(survey => (
                        <div key={survey._id} className="bg-gray-950 border border-gray-850 rounded-2xl overflow-hidden shadow-sm">
                            {/* Survey Header details */}
                            <div className="p-4 bg-gray-900/60 border-b border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h4 className="font-bold text-white text-base leading-snug">"{survey.question}"</h4>
                                    <p className="text-xs text-gray-550 mt-1">
                                        Created: {new Date(survey.createdAt).toLocaleDateString()} &bull; Total Replies: {survey.responses?.length || 0}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleSurvey(survey._id)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                            survey.isActive 
                                                ? 'bg-emerald-600/10 border-emerald-600/20 text-emerald-400 hover:bg-emerald-650/20' 
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                    >
                                        {survey.isActive ? 'Active (Click to Stop)' : 'Make Active'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSurvey(survey._id)}
                                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-850 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Responses log list */}
                            <div className="divide-y divide-gray-850 max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                {(!survey.responses || survey.responses.length === 0) ? (
                                    <div className="p-4 text-center text-xs text-gray-600">No client feedback received for this question.</div>
                                ) : survey.responses.map(resp => (
                                    <div key={resp._id} className="p-4 flex gap-4 items-start bg-gray-950/20 hover:bg-gray-950/40 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 font-black text-xs flex items-center justify-center shrink-0">
                                            {resp.userName ? resp.userName[0] : 'U'}
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-white">{resp.userName}</span>
                                                <span className="text-[10px] text-gray-500">{new Date(resp.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={14} 
                                                        fill={i < resp.rating ? 'currentColor' : 'none'}
                                                        className={i < resp.rating ? 'text-amber-500' : 'text-gray-700'} 
                                                    />
                                                ))}
                                                <span className="text-xs text-gray-400 font-bold ml-1">{resp.rating} stars</span>
                                            </div>
                                            {resp.feedback && (
                                                <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/40 p-2.5 rounded-lg border border-gray-850 max-w-2xl whitespace-pre-wrap">
                                                    {resp.feedback}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
