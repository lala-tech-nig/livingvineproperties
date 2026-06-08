'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, X } from 'lucide-react';
import api from '@/lib/axios';

export default function SurveyModal({ survey, onClose }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setLoading(true);
        try {
            await api.post('/surveys/response', { rating, feedback });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden relative text-gray-900"
                >
                    {/* Close button (only shown if not yet submitted) */}
                    {!submitted && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}

                    <div className="p-6 sm:p-8 space-y-6">
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                        <Star size={24} fill="currentColor" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-snug">Share Your Feedback</h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {survey.question}
                                    </p>
                                </div>

                                {/* Star Selector */}
                                <div className="flex justify-center items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 focus:outline-none transition-transform active:scale-95"
                                        >
                                            <Star
                                                size={36}
                                                fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                                                className={`transition-colors duration-150 ${
                                                    (hoverRating || rating) >= star
                                                        ? 'text-amber-500 fill-amber-500'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Comments Textarea */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Tell us more about your experience
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 resize-none transition-colors"
                                        placeholder="Any suggestions, issues, or compliments..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={rating === 0 || loading}
                                    className="w-full bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#de1f25]/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
                                >
                                    {loading ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6 space-y-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={36} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Thank You!</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                                    Your response has been received. We appreciate you taking the time to help us serve you better.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
