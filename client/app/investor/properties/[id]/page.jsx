'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ChevronLeft, MapPin, MessageSquare, Home, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const fmtTime = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const now  = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (sameDay) return date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function PropertyEnquiryPage() {
    const { id }   = useParams();
    const router   = useRouter();
    const { user } = useAuthStore();

    const [project, setProject]     = useState(null);
    const [messages, setMessages]   = useState([]);
    const [text, setText]           = useState('');
    const [loading, setLoading]     = useState(true);
    const [sending, setSending]     = useState(false);

    const bottomRef  = useRef(null);
    const inputRef   = useRef(null);

    /* ── Fetch project + message thread ── */
    useEffect(() => {
        const load = async () => {
            try {
                const [projRes, msgRes] = await Promise.all([
                    api.get('/website/projects'),
                    // Reuse comment thread keyed on the project id
                    api.get(`/comments/${id}`).catch(() => ({ data: [] })),
                ]);
                const found = (projRes.data || []).find(p => p._id === id);
                setProject(found || null);
                setMessages(msgRes.data || []);
            } catch {
                toast.error('Failed to load property details');
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    /* ── Auto-scroll on new message ── */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ── Send message ── */
    const send = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        setSending(true);
        // Optimistic update
        const optimistic = {
            _id: `opt-${Date.now()}`,
            message: trimmed,
            createdAt: new Date().toISOString(),
            userId: { _id: user?._id, firstName: user?.firstName, surname: user?.surname, profileImage: user?.profileImage },
            role: user?.role,
        };
        setMessages(prev => [...prev, optimistic]);
        setText('');

        try {
            const { data } = await api.post(`/comments/${id}`, { message: trimmed });
            // Replace the optimistic message with the real one from server
            setMessages(prev => prev.map(m => m._id === optimistic._id ? data : m));
        } catch (err) {
            // Rollback optimistic
            setMessages(prev => prev.filter(m => m._id !== optimistic._id));
            setText(trimmed);
            toast.error(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] gap-2">
                <Loader2 size={22} className="animate-spin text-[#de1f25]" />
                <span className="text-sm text-gray-400">Loading…</span>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
                <AlertTriangle size={36} className="text-amber-400" />
                <p className="text-gray-600 font-semibold">Property not found</p>
                <button onClick={() => router.back()} className="text-sm text-[#de1f25] underline underline-offset-2">Go back</button>
            </div>
        );
    }

    return (
        /* Full-height flex column — header + chat area + input bar */
        <div className="flex flex-col h-[calc(100vh-7rem)] -mx-4 -mt-4 lg:mx-0 lg:mt-0 lg:h-auto lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm overflow-hidden bg-white">

            {/* ── Property Header Banner ── */}
            <div className="shrink-0">
                {/* Back button row (mobile only, below the layout header) */}
                <div className="lg:hidden flex items-center gap-2 px-4 pt-4 pb-2 bg-white border-b border-gray-100">
                    <button onClick={() => router.back()}
                        className="p-1.5 rounded-xl bg-gray-100 text-gray-600 active:bg-gray-200 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Property Enquiry</span>
                </div>

                {/* Property card */}
                <div className="flex gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 bg-gray-100"
                        style={{ backgroundImage: `url('${project.image || '/lagos.jpg'}')` }} />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-sm font-black text-gray-900 leading-tight truncate">{project.title}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={10} className="text-gray-400 shrink-0" />
                            <p className="text-[11px] text-gray-400 truncate">{project.location}</p>
                        </div>
                        {project.price && (
                            <p className="text-xs font-black text-[#de1f25] mt-0.5">{project.price}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 self-center">
                        <div className="flex items-center gap-1 bg-emerald-50 rounded-full px-2 py-0.5">
                            <MessageSquare size={10} className="text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-700">Live Chat</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Message thread ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                {/* Welcome system message */}
                <div className="flex justify-center">
                    <span className="text-[10px] text-gray-400 bg-white rounded-full px-3 py-1 border border-gray-100 shadow-sm">
                        💬 Ask us anything about this property
                    </span>
                </div>

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-3 text-center">
                        <div className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                            <MessageSquare size={22} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">No messages yet</p>
                        <p className="text-xs text-gray-400 max-w-xs">
                            Send your first message to enquire about <strong>{project.title}</strong>. Our team will respond shortly.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                            const isMe = msg.userId?._id === user?._id ||
                                         msg.userId?.firstName === user?.firstName;
                            const initials = `${msg.userId?.firstName?.[0] || '?'}${msg.userId?.surname?.[0] || ''}`;
                            const isManagement = ['management', 'ceo', 'superadmin', 'hr', 'sales', 'marketing'].includes(msg.role);

                            return (
                                <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>

                                    {/* Avatar */}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden
                                        ${isManagement ? 'bg-gradient-to-br from-[#de1f25] to-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {msg.userId?.profileImage
                                            ? <img src={msg.userId.profileImage} alt="avatar" className="w-full h-full object-cover" />
                                            : initials
                                        }
                                    </div>

                                    {/* Bubble */}
                                    <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                                        {!isMe && (
                                            <span className="text-[9px] text-gray-400 px-1 font-semibold">
                                                {msg.userId?.firstName} {msg.userId?.surname}
                                                {isManagement && <span className="ml-1 text-[#de1f25]">• LVP Team</span>}
                                            </span>
                                        )}
                                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                            ${isMe
                                                ? 'bg-[#de1f25] text-white rounded-tr-sm'
                                                : isManagement
                                                    ? 'bg-white text-gray-800 border border-[#de1f25]/20 rounded-tl-sm'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                            }`}>
                                            {msg.message || msg.text}
                                        </div>
                                        <span className="text-[9px] text-gray-400 px-1">{fmtTime(msg.createdAt)}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={bottomRef} />
            </div>

            {/* ── Message input bar ── */}
            <form onSubmit={send}
                className="shrink-0 flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
                <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={`Message about ${project.title}…`}
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-[#de1f25]/20 focus:border-[#de1f25] focus:bg-white transition-all"
                />
                <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="w-10 h-10 rounded-2xl bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95 shadow-md shadow-[#de1f25]/20 shrink-0">
                    {sending
                        ? <Loader2 size={16} className="animate-spin" />
                        : <Send size={16} />
                    }
                </button>
            </form>
        </div>
    );
}
