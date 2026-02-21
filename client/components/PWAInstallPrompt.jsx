'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check local storage if user already dismissed (using new key to force display)
        const hasDismissed = localStorage.getItem('pwa_dismissed_v2');

        const ready = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!hasDismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', ready);

        return () => {
            window.removeEventListener('beforeinstallprompt', ready);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted PWA installation');
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa_dismissed_v2', 'true');
        setShowPrompt(false);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    className="fixed bottom-20 left-4 right-4 md:bottom-10 md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-white rounded-2xl shadow-2xl p-6 z-[60] border border-gray-100 flex flex-col items-center text-center isolate"
                >
                    <div className="w-16 h-16 bg-[#de1f25]/10 text-[#de1f25] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Install our app for seamless investment experience</h3>
                    <p className="text-gray-500 mb-6 text-sm">Access your investments quickly directly from your home screen.</p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors w-1/3"
                        >
                            Not now
                        </button>
                        <button
                            onClick={handleInstall}
                            className="px-4 py-3 rounded-xl bg-[#de1f25] text-white font-medium hover:bg-[#b0181d] transition-colors flex-1 shadow-md hover:shadow-lg"
                        >
                            Install App
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
