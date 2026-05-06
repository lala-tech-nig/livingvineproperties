'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AttendancePage() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/attendance/check-in`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Checked in successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/attendance/check-out`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Checked out successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-900">Attendance Tracking</h2>
                <p className="text-gray-500">Log your daily work hours and track your attendance history.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Morning Check-in</h3>
                    <p className="text-gray-500 mb-6">Mark your arrival for today.</p>
                    <button 
                        onClick={handleCheckIn}
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                        Check In Now
                    </button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                        <XCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Evening Check-out</h3>
                    <p className="text-gray-500 mb-6">Log your departure for today.</p>
                    <button 
                        onClick={handleCheckOut}
                        disabled={loading}
                        className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50"
                    >
                        Check Out Now
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock size={18} /> Recent History</h3>
                <div className="text-center py-8 text-gray-400 text-sm italic">
                    Attendance history will be displayed here soon.
                </div>
            </div>
        </div>
    );
}
