'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusCircle, Upload, TrendingUp, Headphones, ChevronRight, X, CheckCircle2,
    Building2, ShieldCheck, BarChart3
} from 'lucide-react';

const SLIDES = [
    {
        icon: '🏡',
        color: 'from-[#de1f25] to-orange-500',
        title: 'Welcome to Living Vine Properties',
        subtitle: 'Your Trusted Investment Partner',
        description: 'We help you grow your wealth through secure, high-yield real estate investments. This quick tour will show you how to get started.',
        illustration: null,
        tip: null,
    },
    {
        icon: null,
        IconComponent: PlusCircle,
        color: 'from-blue-600 to-blue-400',
        title: 'Choose Your Investment',
        subtitle: 'Step 1 — Select a Plan',
        description: 'Click "New Investment" from the dashboard or bottom navigation. Browse available investment plans and select the one that fits your goals and budget.',
        tip: '💡 Plans have different ROI rates and durations. Choose wisely!',
    },
    {
        icon: null,
        IconComponent: ShieldCheck,
        color: 'from-purple-600 to-purple-400',
        title: 'Verify Your Identity',
        subtitle: 'Step 2 — Identity & Details',
        description: 'Provide your personal details, NIN/BVN for identity verification, and your bank account details for returns payment.',
        tip: '🔒 Your information is encrypted and stored securely.',
    },
    {
        icon: null,
        IconComponent: Upload,
        color: 'from-amber-500 to-yellow-400',
        title: 'Upload Payment Receipt',
        subtitle: 'Step 3 — Confirm Payment',
        description: 'After your investment is approved, make payment to the provided company account, then upload your payment receipt from your investment detail page.',
        tip: '📋 Your investment becomes active once payment is confirmed.',
    },
    {
        icon: null,
        IconComponent: BarChart3,
        color: 'from-green-600 to-green-400',
        title: 'Track Your Returns',
        subtitle: 'Step 4 — Monitor Growth',
        description: 'Once your investment is active, monitor your portfolio from the Overview dashboard. You\'ll see your investment amount, expected ROI, and maturity date.',
        tip: '📈 You\'ll receive notifications for every investment status update.',
    },
    {
        icon: null,
        IconComponent: Headphones,
        color: 'from-teal-600 to-teal-400',
        title: 'We\'re Always Here',
        subtitle: 'Step 5 — Support',
        description: 'Use the Messages section to contact your account officer directly. You can also visit the Support tab for assistance with any queries.',
        tip: '💬 Your dedicated account officer is just a message away.',
    },
    {
        icon: '🎉',
        color: 'from-[#de1f25] to-orange-500',
        title: 'You\'re All Set!',
        subtitle: 'Ready to Invest',
        description: 'You\'re ready to start your investment journey with Living Vine Properties. Let\'s grow your wealth together!',
        tip: null,
        isFinal: true,
    },
];

export default function OnboardingTour({ onComplete }) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);

    const slide = SLIDES[current];
    const isLast = current === SLIDES.length - 1;

    const goNext = () => {
        if (isLast) { onComplete(); return; }
        setDirection(1);
        setCurrent(c => c + 1);
    };

    const goPrev = () => {
        if (current === 0) return;
        setDirection(-1);
        setCurrent(c => c - 1);
    };

    const handleSkip = () => onComplete();

    const variants = {
        enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            >
                {/* Header */}
                <div className={`bg-gradient-to-br ${slide.color} p-8 text-white text-center relative min-h-[200px] flex flex-col items-center justify-center`}>
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={current}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="flex flex-col items-center"
                        >
                            {slide.icon ? (
                                <div className="text-5xl mb-3">{slide.icon}</div>
                            ) : slide.IconComponent ? (
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                                    <slide.IconComponent size={32} />
                                </div>
                            ) : null}
                            <p className="text-xs font-bold tracking-widest uppercase text-white/70 mb-1">{slide.subtitle}</p>
                            <h2 className="text-xl font-bold font-serif leading-tight">{slide.title}</h2>
                        </motion.div>
                    </AnimatePresence>

                    {/* Skip button */}
                    {!isLast && (
                        <button onClick={handleSkip} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={`body-${current}`}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
                        >
                            <p className="text-gray-600 text-sm leading-relaxed text-center">{slide.description}</p>
                            {slide.tip && (
                                <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
                                    {slide.tip}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 py-2">
                        {SLIDES.map((_, i) => (
                            <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                                className={`transition-all rounded-full ${i === current ? 'w-6 h-2 bg-[#de1f25]' : 'w-2 h-2 bg-gray-200'}`}
                            />
                        ))}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex gap-3">
                        {current > 0 && (
                            <button onClick={goPrev} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                                ← Back
                            </button>
                        )}
                        <button
                            onClick={goNext}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5 ${isLast ? 'flex-1 bg-green-500 hover:bg-green-600' : 'flex-1 bg-[#de1f25] hover:bg-[#b0181d]'}`}
                        >
                            {isLast ? (
                                <><CheckCircle2 size={16} /> Start Investing</>
                            ) : (
                                <>Next <ChevronRight size={16} /></>
                            )}
                        </button>
                    </div>

                    {/* Skip link at bottom for early slides */}
                    {current === 0 && (
                        <button onClick={handleSkip} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
                            Skip tour
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
