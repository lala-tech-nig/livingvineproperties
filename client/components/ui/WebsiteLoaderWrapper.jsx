'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import WebsiteLoader from './WebsiteLoader';
import api from '@/lib/axios';

const MIN_DISPLAY_MS = 1200; // Minimum loader display time for smooth UX

export default function WebsiteLoaderWrapper({ children }) {
    const [loaderCaption, setLoaderCaption] = useState('Welcome to LIVING VINE PRPPERTIES INVESTMENT LIMITED');
    const [loaderEnabled, setLoaderEnabled] = useState(true);
    const [settingsFetched, setSettingsFetched] = useState(false);
    const hideFnRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    // Fetch loader settings from the API
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data?.loaderCaption) setLoaderCaption(data.loaderCaption);
                if (data?.loaderEnabled === false) {
                    setLoaderEnabled(false);
                }
            } catch (_) {
                // Fail silently — disable loader on error
                setLoaderEnabled(false);
            } finally {
                setSettingsFetched(true);
            }
        };
        fetchSettings();
    }, []);

    // Once settings are fetched, signal loader to hide (respecting MIN_DISPLAY_MS)
    useEffect(() => {
        if (settingsFetched && loaderEnabled && hideFnRef.current) {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
            setTimeout(() => {
                if (hideFnRef.current) hideFnRef.current();
            }, remaining);
        }
    }, [settingsFetched, loaderEnabled]);

    // Called by WebsiteLoader when it mounts — receives the hide function
    const handleReady = useCallback((hideFn) => {
        hideFnRef.current = hideFn;
        // If settings were already fetched before loader mounted, dismiss immediately
        if (settingsFetched && loaderEnabled) {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
            setTimeout(hideFn, remaining);
        }
    }, [settingsFetched, loaderEnabled]);

    if (!loaderEnabled) {
        return <>{children}</>;
    }

    return (
        <>
            <WebsiteLoader caption={loaderCaption} onReady={handleReady} />
            {children}
        </>
    );
}
