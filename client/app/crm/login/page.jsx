'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy CRM login — redirects to the unified staff login portal at /login.
 * Kept for backward compatibility with bookmarks and external links.
 */
export default function CRMLoginRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm font-medium">Redirecting to Staff Portal...</p>
            </div>
        </div>
    );
}
