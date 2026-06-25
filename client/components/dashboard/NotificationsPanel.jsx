'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BellRing, CheckCheck, Trash2, RefreshCw,
    ShieldAlert, CheckCircle2, Info, Mail
} from 'lucide-react';

const TYPE_STYLES = {
    critical: { icon: ShieldAlert, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', label: 'Critical' },
    success:  { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', label: 'Success' },
    info:     { icon: Info, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', label: 'Info' },
    default:  { icon: Bell, bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-500', label: 'General' },
};

function getType(notification) {
    const title = (notification.title || '').toLowerCase();
    if (title.includes('critical') || title.includes('alert') || title.includes('danger') || title.includes('urgent')) return 'critical';
    if (title.includes('success') || title.includes('approved') || title.includes('completed')) return 'success';
    if (title.includes('info') || title.includes('update') || title.includes('reminder')) return 'info';
    return 'default';
}

function timeAgo(dateStr) {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

export default function NotificationsPage({ variant = 'user' }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    const endpoint = variant === 'all' ? '/notifications/all' : '/notifications';

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get(endpoint);
            setNotifications(data);
        } catch (err) {
            // Don't show error if it's just an empty list
            if (err.response?.status !== 404) {
                setNotifications([]);
            }
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const markRead = async (notifId) => {
        try {
            await api.put(`/notifications/${notifId}/read`);
            setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
        } catch { /* silent */ }
    };

    const markAllRead = async () => {
        setMarkingAll(true);
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        } catch {
            toast.error('Failed to mark all read');
        } finally {
            setMarkingAll(false);
        }
    };

    const deleteNotif = async (notifId) => {
        try {
            await api.delete(`/notifications/${notifId}`);
            setNotifications(prev => prev.filter(n => n._id !== notifId));
        } catch {
            toast.error('Failed to delete');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6 pb-20 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BellRing className="text-[#de1f25]" size={28} />
                        {variant === 'all' ? 'System Notifications' : 'My Notifications'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {variant === 'all'
                            ? 'All platform activity and system-wide alerts.'
                            : 'Important operational insights and account alerts.'
                        }
                        {unreadCount > 0 && <span className="ml-2 text-[#de1f25] font-semibold">{unreadCount} unread</span>}
                    </p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            disabled={markingAll}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            {markingAll ? <RefreshCw size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                            Mark all read
                        </button>
                    )}
                    <button
                        onClick={fetchNotifications}
                        className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white rounded-2xl p-5 flex gap-4 border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <Bell size={48} className="mx-auto mb-4 text-gray-200" />
                    <h3 className="font-semibold text-gray-500 text-lg mb-1">No notifications yet</h3>
                    <p className="text-sm text-gray-400">System events and activity updates will appear here automatically.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {notifications.map((notif, idx) => {
                            const type = getType(notif);
                            const style = TYPE_STYLES[type] || TYPE_STYLES.default;
                            const Icon = style.icon;

                            return (
                                <motion.div
                                    key={notif._id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 16 }}
                                    transition={{ delay: idx * 0.04 }}
                                    onClick={() => !notif.isRead && markRead(notif._id)}
                                    className={`relative flex items-start gap-4 p-5 rounded-2xl border shadow-sm cursor-pointer transition-all
                                        ${notif.isRead ? 'bg-white border-gray-100 opacity-70 hover:opacity-90' : `${style.bg} ${style.border} hover:shadow-md`}
                                    `}
                                >
                                    {/* Unread dot */}
                                    {!notif.isRead && (
                                        <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#de1f25] ring-2 ring-white" />
                                    )}

                                    {/* Icon */}
                                    <div className={`mt-0.5 shrink-0 p-2.5 rounded-full ${notif.isRead ? 'bg-gray-100 text-gray-400' : `bg-white ${style.text} shadow-sm`}`}>
                                        <Icon size={18} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`font-semibold text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                                                {notif.title}
                                            </p>
                                            <span className="text-xs text-gray-400 shrink-0 mt-0.5">{timeAgo(notif.createdAt)}</span>
                                        </div>
                                        <p className={`text-sm mt-0.5 ${notif.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {notif.message}
                                        </p>
                                        {variant === 'all' && notif.userId && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                → {notif.userId.firstName} {notif.userId.surname} ({notif.userId.role})
                                            </p>
                                        )}
                                    </div>

                                    {/* Delete */}
                                    {variant === 'user' && (
                                        <button
                                            onClick={e => { e.stopPropagation(); deleteNotif(notif._id); }}
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
