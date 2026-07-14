'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import WebsiteLoader from './WebsiteLoader';
import { useWebsiteData } from '@/lib/websiteData';

const MIN_DISPLAY_MS = 1200; // Minimum loader display time for smooth UX

export default function WebsiteLoaderWrapper({ children }) {
    const { settings, loading } = useWebsiteData();
    const [loaderDismissed, setLoaderDismissed] = useState(false);
    const hideFnRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    const loaderCaption = settings?.loaderCaption || 'Welcome to LIVING VINE PROPERTIES INVESTMENT LIMITED';
    const loaderEnabled = settings?.loaderEnabled !== false;

    // When context marks settings as loaded, trigger the hide (after min display time)
    useEffect(() => {
        if (!loading.settings && loaderEnabled && hideFnRef.current && !loaderDismissed) {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
            setTimeout(() => {
                if (hideFnRef.current) hideFnRef.current();
                setLoaderDismissed(true);
            }, remaining);
        }

        // If loader is disabled via settings, skip it immediately
        if (!loading.settings && !loaderEnabled) {
            setLoaderDismissed(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading.settings, loaderEnabled]);

    // Called by WebsiteLoader when it mounts — receives the hide function
    const handleReady = useCallback((hideFn) => {
        hideFnRef.current = hideFn;
        // If settings were already resolved before loader mounted, dismiss now
        if (!loading.settings && loaderEnabled && !loaderDismissed) {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
            setTimeout(() => {
                hideFn();
                setLoaderDismissed(true);
            }, remaining);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading.settings, loaderEnabled]);

    if (!loaderEnabled || loaderDismissed) {
        return <>{children}</>;
    }

    return (
        <>
            <WebsiteLoader caption={loaderCaption} onReady={handleReady} />
            {children}
        </>
    );
}

