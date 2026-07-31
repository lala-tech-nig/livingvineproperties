'use client';

import { useEffect } from 'react';
import api from '@/lib/axios';

export default function VisitorTracker() {
    useEffect(() => {
        try {
            // Track visit once per session per path
            const page = typeof window !== 'undefined' ? window.location.pathname : '/';
            const sessionKey = `lvp_visited_${page}`;
            
            if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
                sessionStorage.setItem(sessionKey, '1');
                api.post('/website/track-visit', { page }).catch(() => {});
            }
        } catch (_) { /* non-blocking */ }
    }, []);

    return null;
}
