'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/axios';

// Default values used while loading or if the API fails
const DEFAULTS = {
    marqueeTitle: 'Living Vine Properties Investment Limited',
    marqueeTagline: '"...Quest for uniqueness in service..."',
    marqueeEmail: 'info@livingvineproperties.com',
    marqueePhone: '+234 (0) 800 000 0001',
};

export default function TopMarquee() {
    const pathname = usePathname();
    const [data, setData] = useState(DEFAULTS);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data: settings } = await api.get('/website/settings');
                if (settings) {
                    setData({
                        marqueeTitle: settings.marqueeTitle || DEFAULTS.marqueeTitle,
                        marqueeTagline: settings.marqueeTagline || DEFAULTS.marqueeTagline,
                        marqueeEmail: settings.marqueeEmail || DEFAULTS.marqueeEmail,
                        marqueePhone: settings.marqueePhone || DEFAULTS.marqueePhone,
                    });
                }
            } catch (e) {
                // Silently fall back to defaults on error
            }
        };
        fetchSettings();
    }, []);

    // Hide the marquee on dashboard pages
    if (
        pathname.includes('/(dashboard)') ||
        pathname.startsWith('/ceo') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/superadmin') ||
        pathname.startsWith('/hr') ||
        pathname.startsWith('/sales') ||
        pathname.startsWith('/marketing') ||
        pathname.startsWith('/investor')
    ) {
        return null;
    }

    return (
        <>
            <div className="bg-linear-to-r from-orange-950 via-orange-900 to-orange-950 text-orange-50 py-2.5 overflow-hidden border-b border-orange-400/20 z-[60] shadow-sm fixed top-0 left-0 right-0">
                <div className="whitespace-nowrap flex animate-marquee">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-16 items-center px-8">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                                <span className="font-bold tracking-widest uppercase text-[10px] lg:text-xs">
                                    {data.marqueeTitle}
                                </span>
                            </div>
                            <span className="text-orange-300 italic text-xs font-serif">
                                {data.marqueeTagline}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] lg:text-xs font-medium text-orange-100/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></span>
                                Email: {data.marqueeEmail}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] lg:text-xs font-medium text-orange-100/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></span>
                                Phone: {data.marqueePhone}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Spacer to push content below fixed elements */}
            <div className="h-[100px] lg:h-[120px]" />
        </>
    );
}
