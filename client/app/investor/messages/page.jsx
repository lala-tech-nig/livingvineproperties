'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    MessageSquare, Headphones, Mail, Phone, MapPin, Send,
    Loader2, UserCheck, HelpCircle, ExternalLink, ArrowRight
} from 'lucide-react';

export default function InvestorMessages() {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [loadingChat, setLoadingChat] = useState(true);
    const [msg, setMsg] = useState('');
    const [sending, setSending] = useState(false);
    const chatBottomRef = useRef(null);

    const accountOfficer = user?.accountOfficer;

    // Fetch support messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get('/support/messages');
                setMessages(data);
            } catch (err) {
                console.error('Failed to load support messages', err);
            } finally {
                setLoadingChat(false);
            }
        };

        fetchMessages();

        // Poll for new messages every 8 seconds
        const interval = setInterval(fetchMessages, 8000);
        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!msg.trim()) return;
        setSending(true);
        try {
            const { data } = await api.post('/support/messages', { message: msg });
            setMessages(prev => [...prev, data]);
            setMsg('');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Clean phone number for WhatsApp URL
    const getWhatsAppLink = (phone) => {
        if (!phone) return 'https://wa.me/2348031234567'; // Default general support
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanPhone}?text=Hello%2C%20I%20have%20a%20question%20regarding%20my%20investment%20portfolio.`;
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#de1f25]/10 flex items-center justify-center text-[#de1f25]">
                        <Headphones size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Support & Chat Center</h1>
                        <p className="text-gray-500 text-sm mt-1">Get in touch with your Account Officer or message the support team directly.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ── Left Column: Contact info & Account Officer ── */}
                <div className="space-y-6 lg:col-span-1">
                    
                    {/* Account Officer Card */}
                    {accountOfficer ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#de1f25]/10 to-orange-500/10 rounded-bl-full" />
                            
                            <div className="flex items-center gap-2 mb-4">
                                <UserCheck className="text-emerald-600" size={18} />
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Your Account Officer</span>
                            </div>

                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#de1f25] to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                                    {accountOfficer.firstName?.[0]}{accountOfficer.surname?.[0]}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 text-base truncate">
                                        {accountOfficer.firstName} {accountOfficer.surname}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                                        {accountOfficer.role || 'Relationship Manager'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm border-t border-gray-50 pt-4 mb-5">
                                <a href={`mailto:${accountOfficer.email}`} className="flex items-center gap-2.5 text-gray-600 hover:text-[#de1f25] transition-colors">
                                    <Mail size={15} className="text-gray-400 shrink-0" />
                                    <span className="truncate">{accountOfficer.email}</span>
                                </a>
                                {accountOfficer.phoneNumber && (
                                    <a href={`tel:${accountOfficer.phoneNumber}`} className="flex items-center gap-2.5 text-gray-600 hover:text-[#de1f25] transition-colors">
                                        <Phone size={15} className="text-gray-400 shrink-0" />
                                        <span>{accountOfficer.phoneNumber}</span>
                                    </a>
                                )}
                            </div>

                            <a href={getWhatsAppLink(accountOfficer.phoneNumber)} target="_blank" rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.851-4.388 9.854-9.778.002-2.61-1.01-5.063-2.851-6.906C16.435 2.079 13.99 1.066 11.4 1.066c-5.437 0-9.852 4.388-9.855 9.78 0 1.944.515 3.82 1.492 5.51L2.012 21.9l5.77-1.503c1.627.887 3.245 1.258 4.79 1.258z" />
                                </svg>
                                Chat on WhatsApp
                            </a>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <HelpCircle className="text-amber-500" size={18} />
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Quick Assistance</span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed mb-5">
                                You don't have an assigned Account Officer yet. You can chat with our general support team via WhatsApp or use the direct chat panel on the right.
                            </p>
                            <a href={getWhatsAppLink(null)} target="_blank" rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.851-4.388 9.854-9.778.002-2.61-1.01-5.063-2.851-6.906C16.435 2.079 13.99 1.066 11.4 1.066c-5.437 0-9.852 4.388-9.855 9.78 0 1.944.515 3.82 1.492 5.51L2.012 21.9l5.77-1.503c1.627.887 3.245 1.258 4.79 1.258z" />
                                </svg>
                                WhatsApp General Support
                            </a>
                        </div>
                    )}

                    {/* General Contact Info Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Contact Information</h3>
                        
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <Mail size={15} className="text-[#de1f25]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Support</p>
                                    <a href="mailto:support@livingvineproperties.com" className="font-semibold text-gray-800 hover:text-[#de1f25] transition-colors mt-0.5 block">
                                        support@livingvineproperties.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <Phone size={15} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Call Center</p>
                                    <a href="tel:+2348031234567" className="font-semibold text-gray-800 hover:text-[#de1f25] transition-colors mt-0.5 block">
                                        +234 (803) 123-4567
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin size={15} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Head Office</p>
                                    <p className="font-medium text-gray-700 mt-0.5 leading-relaxed">
                                        124, Living Vine Plaza, Lekki Phase 1, Lagos, Nigeria
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Column: Direct Chat Panel ── */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[520px]">
                        
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#de1f25] to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                        LV
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Living Vine Support Chat</h3>
                                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online · Typically replies in minutes</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                            {loadingChat ? (
                                <div className="h-full flex flex-col items-center justify-center gap-2">
                                    <Loader2 size={24} className="animate-spin text-[#de1f25]" />
                                    <p className="text-xs text-gray-400">Loading conversation history...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                                        <MessageSquare size={20} className="text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm">No messages yet</p>
                                        <p className="text-xs text-gray-400 max-w-xs mt-1">
                                            Start a conversation with our support desk below.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((c, i) => {
                                    const isMe = c.sender?._id === user?.id || c.sender === user?.id;
                                    const senderName = c.sender ? `${c.sender.firstName} ${c.sender.surname}` : 'User';
                                    return (
                                        <div key={c._id || i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-[#de1f25]/10 text-[#de1f25]' : 'bg-gray-100 text-gray-600'}`}>
                                                {(senderName || 'U')[0].toUpperCase()}
                                            </div>
                                            <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                                                <span className="text-[10px] text-gray-400">
                                                    {isMe ? 'You' : `${senderName} (Support)`} · {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                    isMe 
                                                        ? 'bg-[#de1f25] text-white rounded-tr-sm' 
                                                        : 'bg-white border border-gray-150 text-gray-800 rounded-tl-sm shadow-sm'
                                                }`}>
                                                    {c.message}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatBottomRef} />
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex gap-3">
                            <input
                                type="text"
                                value={msg}
                                onChange={e => setMsg(e.target.value)}
                                placeholder="Type your message here..."
                                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#de1f25]/20 focus:border-[#de1f25] text-sm outline-none bg-gray-50/50"
                            />
                            <button
                                type="submit"
                                disabled={sending || !msg.trim()}
                                className="bg-[#de1f25] hover:bg-[#b0181d] disabled:opacity-40 text-white w-12 h-12 rounded-2xl transition-all flex items-center justify-center shrink-0 shadow-md shadow-[#de1f25]/20"
                            >
                                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
