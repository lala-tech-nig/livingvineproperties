"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";

const ROICalculator = () => {
    const [amount, setAmount] = useState(1000000); // 1 Million default
    const ROI_PERCENTAGE = 0.26; // 26%
    const DURATION_YEARS = 1;

    const roi = amount * ROI_PERCENTAGE;
    const total = amount + roi;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <SectionWrapper className="bg-white">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-primary p-6 text-white text-center">
                    <h3 className="text-2xl font-serif font-bold">Investment Calculator</h3>
                    <p className="opacity-80">See how your money grows with Living Vine.</p>
                </div>

                <div className="p-8 md:p-12">
                    <div className="mb-10">
                        <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Investment Amount</label>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-4xl font-serif font-bold text-foreground">
                                {formatCurrency(amount)}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="500000"
                            max="50000000"
                            step="100000"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>₦500k</span>
                            <span>₦50M+</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-2xl">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Guaranteed ROI (26%)</div>
                            <motion.div
                                key={roi}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-2xl font-bold text-green-600"
                            >
                                +{formatCurrency(roi)}
                            </motion.div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Total Value after 1 Year</div>
                            <motion.div
                                key={total}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-3xl font-bold text-primary"
                            >
                                {formatCurrency(total)}
                            </motion.div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6 mt-4">
                        *Disclaimer: Projections are based on current market rates for our prime land banking projects. Terms and conditions apply.
                    </p>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default ROICalculator;
