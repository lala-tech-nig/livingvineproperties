'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Clock, CheckCircle, XCircle, RefreshCw, CalendarCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

function formatTime(date) {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function getDuration(checkIn, checkOut) {
    if (!checkIn || !checkOut) return null;
    const ms = new Date(checkOut) - new Date(checkIn);
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
}

export default function AttendancePage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [todayRecord, setTodayRecord] = useState(null);

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const { data } = await api.get('/hr/attendance/my');
            setHistory(data);
            // Find today's record
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEntry = data.find(a => {
                const d = new Date(a.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            });
            setTodayRecord(todayEntry || null);
        } catch (err) {
            // History endpoint may not exist yet — show empty gracefully
            setHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/hr/attendance/check-in', {});
            toast.success('Checked in successfully!');
            setTodayRecord(data);
            setHistory(prev => [data, ...prev]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/hr/attendance/check-out', {});
            toast.success('Checked out successfully!');
            setTodayRecord(data);
            setHistory(prev => prev.map(a => a._id === data._id ? data : a));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    const checkedIn = !!todayRecord?.checkIn;
    const checkedOut = !!todayRecord?.checkOut;

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <CalendarCheck className="text-emerald-500" size={26} />
                    Attendance Tracker
                </h2>
                <p className="text-gray-400 mt-1">Log your daily work hours and view attendance history.</p>
            </header>

            {/* Today's Status */}
            {todayRecord && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-4 flex items-center gap-4"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle size={22} />
                    </div>
                    <div className="flex-1">
                        <p className="text-emerald-300 font-semibold text-sm">Today's Record</p>
                        <div className="flex gap-6 mt-1 text-xs text-emerald-400/80">
                            <span>In: <span className="font-bold text-emerald-300">{formatTime(todayRecord.checkIn)}</span></span>
                            {todayRecord.checkOut && (
                                <span>Out: <span className="font-bold text-emerald-300">{formatTime(todayRecord.checkOut)}</span></span>
                            )}
                            {getDuration(todayRecord.checkIn, todayRecord.checkOut) && (
                                <span>Duration: <span className="font-bold text-emerald-300">{getDuration(todayRecord.checkIn, todayRecord.checkOut)}</span></span>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-900">
                <div className={`bg-white p-8 rounded-3xl shadow-sm border flex flex-col items-center justify-center text-center transition-all ${checkedIn ? 'border-emerald-200 opacity-60' : 'border-gray-100 hover:shadow-md'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${checkedIn ? 'bg-emerald-100 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-1">Morning Check-in</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        {checkedIn ? `Checked in at ${formatTime(todayRecord?.checkIn)}` : 'Mark your arrival for today.'}
                    </p>
                    <button
                        onClick={handleCheckIn}
                        disabled={loading || checkedIn}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {checkedIn ? '✓ Already Checked In' : 'Check In Now'}
                    </button>
                </div>

                <div className={`bg-white p-8 rounded-3xl shadow-sm border flex flex-col items-center justify-center text-center transition-all ${!checkedIn || checkedOut ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:shadow-md'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${checkedOut ? 'bg-rose-100 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                        <XCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-1">Evening Check-out</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        {checkedOut ? `Checked out at ${formatTime(todayRecord?.checkOut)}` : 'Log your departure for today.'}
                    </p>
                    <button
                        onClick={handleCheckOut}
                        disabled={loading || !checkedIn || checkedOut}
                        className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {checkedOut ? '✓ Already Checked Out' : 'Check Out Now'}
                    </button>
                </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={18} className="text-gray-500" />
                        Attendance History
                    </h3>
                    <button
                        onClick={fetchHistory}
                        className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <RefreshCw size={15} className={historyLoading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {historyLoading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex gap-4 items-center">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Clock size={36} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No attendance records yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {history.map((record, idx) => (
                            <motion.div
                                key={record._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.04 }}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.checkOut ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <CalendarCheck size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{formatDate(record.date)}</p>
                                    <div className="flex gap-4 text-xs text-gray-500 mt-0.5">
                                        <span>In: <strong>{formatTime(record.checkIn)}</strong></span>
                                        {record.checkOut && <span>Out: <strong>{formatTime(record.checkOut)}</strong></span>}
                                        {getDuration(record.checkIn, record.checkOut) && (
                                            <span className="text-emerald-600 font-medium">{getDuration(record.checkIn, record.checkOut)}</span>
                                        )}
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${record.checkOut ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {record.checkOut ? 'Complete' : 'In Progress'}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
