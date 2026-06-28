'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Home, Loader2, Search, X, ChevronRight, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_COLOR = {
    Available:    'bg-emerald-100 text-emerald-700',
    Sold:         'bg-red-100 text-red-700',
    Ongoing:      'bg-blue-100 text-blue-700',
    'Coming Soon':'bg-amber-100 text-amber-700',
};

export default function InvestorPropertiesPage() {
    const [projects, setProjects]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');

    useEffect(() => {
        api.get('/website/projects')
            .then(r => setProjects(r.data || []))
            .catch(() => toast.error('Failed to load properties'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = projects.filter(p =>
        !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 gap-2">
                <Loader2 size={22} className="animate-spin text-[#de1f25]" />
                <span className="text-sm text-gray-400">Loading properties...</span>
            </div>
        );
    }

    return (
        <div className="pb-4">
            {/* Page title */}
            <div className="mb-4">
                <h2 className="text-xl font-black text-gray-900">Explore Properties</h2>
                <p className="text-xs text-gray-400 mt-0.5">{projects.length} available listing{projects.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Search bar */}
            <div className="relative mb-5">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or location…"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#de1f25]/20 focus:border-[#de1f25] transition-all shadow-sm"
                />
                {search && (
                    <button onClick={() => setSearch('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Properties grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <Home size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">No properties found</p>
                    <p className="text-xs text-gray-300">Try a different search term</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((proj, i) => (
                        <motion.div
                            key={proj._id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}>
                            <Link href={`/investor/properties/${proj._id}`}
                                className="flex gap-3 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm active:scale-[0.99] transition-transform">

                                {/* Property image */}
                                <div className="shrink-0 w-28 h-28 bg-gray-100 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${proj.image || '/lagos.jpg'}')` }} />

                                {/* Details */}
                                <div className="flex-1 py-3 pr-3 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between gap-1">
                                            <h3 className="text-sm font-black text-gray-900 leading-tight truncate">{proj.title}</h3>
                                            <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[proj.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {proj.status || 'Available'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <MapPin size={10} className="text-gray-400 shrink-0" />
                                            <p className="text-[11px] text-gray-400 truncate">{proj.location}</p>
                                        </div>
                                        {proj.price && (
                                            <p className="text-xs font-black text-[#de1f25] mt-1">{proj.price}</p>
                                        )}
                                        {proj.size && (
                                            <p className="text-[10px] text-gray-400 mt-0.5">{proj.size}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 mt-2 text-[#de1f25]">
                                        <MessageSquare size={11} />
                                        <span className="text-[10px] font-bold">Enquire about this property</span>
                                        <ChevronRight size={10} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
