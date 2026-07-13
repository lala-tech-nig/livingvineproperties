'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebsiteLoader({ caption = 'Welcome to LIVING VINE PROPERTIES INVESTMENT LIMITED', onReady }) {
    const [visible, setVisible] = useState(true);
    const hideRef = useRef(null);

    // Expose a hide() function to the parent via onReady callback
    useEffect(() => {
        if (onReady) {
            onReady(() => {
                setTimeout(() => setVisible(false), 400);
            });
        }
    }, [onReady]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
                >
                    {/* Radial glow background */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#de1f25]/5 blur-3xl" />
                        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-orange-400/5 blur-2xl" />
                    </div>

                    {/* Spinning rings */}
                    <div className="relative flex items-center justify-center mb-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-28 h-28 rounded-full border-[3px] border-transparent"
                            style={{ borderTopColor: 'rgba(222,31,37,0.3)', borderRightColor: 'rgba(222,31,37,0.1)' }}
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-20 h-20 rounded-full border-[3px] border-transparent"
                            style={{ borderTopColor: 'rgba(222,31,37,0.65)', borderLeftColor: 'rgba(251,146,60,0.3)' }}
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-12 h-12 rounded-full border-[3px] border-transparent"
                            style={{ borderTopColor: '#de1f25', borderRightColor: 'rgba(251,146,60,0.5)' }}
                        />
                        <motion.div
                            animate={{ scale: [1, 1.06, 1] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden relative z-10"
                            style={{ boxShadow: '0 0 24px rgba(222,31,37,0.12)' }}
                        >
                            <img
                                src="/living-logo.png"
                                alt="LIVING VINE PROPERTIES INVESTMENT LIMITED"
                                className="w-10 h-10 object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </motion.div>
                    </div>

                    {/* Animated dots */}
                    <div className="flex items-center gap-1.5 mb-5">
                        {[0, 1, 2, 3].map((i) => (
                            <motion.span
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                                className="block w-1.5 h-1.5 rounded-full bg-[#de1f25]"
                            />
                        ))}
                    </div>

                    {/* Caption — editable from manager dashboard */}
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-sm font-semibold text-gray-500 tracking-wide text-center max-w-xs px-6"
                    >
                        {caption}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.35 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400"
                    >
                        LIVING VINE PROPERTIES INVESTMENT LIMITED
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
