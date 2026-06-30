'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { X, Download, ShieldCheck } from 'lucide-react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOSUser, setIsIOSUser] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const pathname = usePathname();

    const isDashboard = pathname.startsWith('/investor') || pathname.startsWith('/management') || pathname.startsWith('/crm');

    useEffect(() => {
        // Detect if already installed or in standalone mode
        const runningStandalone = 
            window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true;
        setIsStandalone(runningStandalone);

        // Detect iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOSUser(ios);

        // Check local storage for dismissal
        const hasDismissed = localStorage.getItem('pwa_dismissed_dashboard_v1');

        if (runningStandalone) return;

        // If iOS and not dismissed, prompt after a short delay on dashboard
        if (ios && isDashboard && !hasDismissed) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
            return () => clearTimeout(timer);
        }

        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (isDashboard && !hasDismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, [isDashboard]);

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
        localStorage.setItem('pwa_dismissed_dashboard_v1', 'true');
        setShowPrompt(false);
    };

    // If standalone or not on a dashboard, do not show the modal prompt
    if (isStandalone || !isDashboard) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop with premium blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Centered Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative z-10 border border-gray-100 text-center flex flex-col items-center overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>

                        {/* Top Icon / High-res logo container */}
                        <div className="w-20 h-20 bg-gradient-to-br from-[#de1f25] to-orange-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-[#de1f25]/20 text-white shrink-0 relative overflow-hidden">
                            <img 
                                src="/icon-192x192.png" 
                                alt="Living Vine Properties Logo" 
                                className="w-16 h-16 rounded-2xl object-cover"
                            />
                        </div>

                        {/* Text descriptions */}
                        <h3 className="text-lg font-extrabold text-gray-900 mb-2 leading-snug">
                            Install Living Vine App
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed mb-6">
                            Add the application directly to your home screen for immediate access to your portfolios, real-time push notifications, and offline utility.
                        </p>

                        {/* iOS Safari Instructions */}
                        {isIOSUser && (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left text-[11px] text-amber-800 space-y-2 mb-6 w-full">
                                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                                    <span>💡</span> iOS Safari Installation Guide:
                                </p>
                                <ol className="list-decimal pl-4.5 space-y-1.5 font-medium text-amber-900/90">
                                    <li>Tap the <span className="font-bold text-slate-800">Share</span> button (box with up arrow) in Safari.</li>
                                    <li>Scroll down and tap <span className="font-bold text-slate-800">"Add to Home Screen"</span>.</li>
                                    <li>Tap <span className="font-bold text-slate-800">Add</span> in the top-right corner.</li>
                                </ol>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleDismiss}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-colors text-xs"
                            >
                                Not Now
                            </button>
                            {!isIOSUser && (
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 py-3 bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold rounded-xl transition-all shadow-md shadow-[#de1f25]/10 text-xs flex items-center justify-center gap-1.5"
                                >
                                    <Download size={14} /> Install Now
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
