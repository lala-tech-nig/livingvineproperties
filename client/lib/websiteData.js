'use client';

/**
 * WebsiteDataContext
 * ------------------
 * Centralises all public API data needed by the (website) section.
 *
 * Strategy:
 *  - On the landing page (/), fetch hero + services + projects + settings in
 *    one coordinated Promise.all (3 HTTP requests instead of 8+).
 *  - On inner pages, fetch only `settings` (needed by shared layout components)
 *    plus the page-specific data.
 *  - Results are cached in a module-level Map so navigating between pages
 *    never re-fetches data already in memory for the session.
 *  - Every component that previously called api.get() on its own now reads
 *    from this context instead.
 */

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';

// ─── Module-level session cache ─────────────────────────────────────────────
// Survives client-side navigation but resets on hard reload.
const _cache = new Map();

function getCached(key) {
    return _cache.has(key) ? _cache.get(key) : null;
}
function setCached(key, value) {
    _cache.set(key, value);
}

// ─── Context definition ──────────────────────────────────────────────────────
const WebsiteDataContext = createContext({
    hero: [],
    services: [],
    projects: [],
    settings: null,
    loading: {
        hero: true,
        services: true,
        projects: true,
        settings: true,
    },
    /** Call this on any page that needs the full landing-page dataset */
    fetchLandingData: () => {},
    /** Call this on inner pages that only need settings */
    fetchSettingsOnly: () => {},
});

export function useWebsiteData() {
    return useContext(WebsiteDataContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function WebsiteDataProvider({ children }) {
    const [hero, setHero] = useState(getCached('hero') || []);
    const [services, setServices] = useState(getCached('services') || []);
    const [projects, setProjects] = useState(getCached('projects') || []);
    const [settings, setSettings] = useState(getCached('settings') || null);
    const [loading, setLoading] = useState({
        hero: !getCached('hero'),
        services: !getCached('services'),
        projects: !getCached('projects'),
        settings: !getCached('settings'),
    });

    // Track in-flight fetches so concurrent mounts don't duplicate requests
    const fetchingRef = useRef({
        landing: false,
        settings: false,
    });

    // ── Fetch landing-page data (hero + services + projects + settings) ──────
    const fetchLandingData = async () => {
        // If all four are already cached, skip entirely
        if (
            getCached('hero') &&
            getCached('services') &&
            getCached('projects') &&
            getCached('settings')
        ) {
            return;
        }

        if (fetchingRef.current.landing) return; // de-duplicate concurrent calls
        fetchingRef.current.landing = true;

        try {
            // Build only the requests that are not yet cached
            const requests = [];
            const keys = [];

            if (!getCached('hero')) {
                requests.push(api.get('/website/hero'));
                keys.push('hero');
            }
            if (!getCached('services')) {
                requests.push(api.get('/website/services'));
                keys.push('services');
            }
            if (!getCached('projects')) {
                requests.push(api.get('/website/projects'));
                keys.push('projects');
            }
            if (!getCached('settings')) {
                requests.push(api.get('/website/settings'));
                keys.push('settings');
            }

            const results = await Promise.all(requests);

            const updates = {};
            results.forEach(({ data }, i) => {
                updates[keys[i]] = data;
            });

            // Apply results and update cache
            if (updates.hero !== undefined) {
                const value = Array.isArray(updates.hero) && updates.hero.length > 0 ? updates.hero : [];
                setCached('hero', value);
                setHero(value);
            }
            if (updates.services !== undefined) {
                const value = Array.isArray(updates.services) ? updates.services : [];
                setCached('services', value);
                setServices(value);
            }
            if (updates.projects !== undefined) {
                const value = Array.isArray(updates.projects) ? updates.projects : [];
                setCached('projects', value);
                setProjects(value);
            }
            if (updates.settings !== undefined) {
                setCached('settings', updates.settings);
                setSettings(updates.settings);
            }
        } catch (error) {
            console.error('[WebsiteDataContext] Failed to fetch landing data:', error);
        } finally {
            fetchingRef.current.landing = false;
            // Mark all as loaded regardless of partial failure
            setLoading({ hero: false, services: false, projects: false, settings: false });
        }
    };

    // ── Fetch settings only (used by inner pages / shared layout) ────────────
    const fetchSettingsOnly = async () => {
        if (getCached('settings')) {
            setLoading((prev) => ({ ...prev, settings: false }));
            return;
        }
        if (fetchingRef.current.settings) return;
        fetchingRef.current.settings = true;
        try {
            const { data } = await api.get('/website/settings');
            if (data) {
                setCached('settings', data);
                setSettings(data);
            }
        } catch (error) {
            console.error('[WebsiteDataContext] Failed to fetch settings:', error);
        } finally {
            fetchingRef.current.settings = false;
            setLoading((prev) => ({ ...prev, settings: false }));
        }
    };

    const value = {
        hero,
        services,
        projects,
        settings,
        loading,
        fetchLandingData,
        fetchSettingsOnly,
    };

    return (
        <WebsiteDataContext.Provider value={value}>
            {children}
        </WebsiteDataContext.Provider>
    );
}
