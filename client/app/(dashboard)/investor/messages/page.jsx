'use client';

import { MessageSquare, Inbox, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InvestorMessages() {
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <MessageSquare className="text-[#de1f25]" size={32} />
                        Messages & Support
                    </h1>
                    <p className="text-gray-500 mt-2">Communicate with management regarding your active portfolios.</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Inbox className="text-gray-300" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No direct messages</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    Your inbox is currently empty. To speak with our team, please visit a specific investment portfolio and use the activity thread.
                </p>

                <a href="/investor" className="bg-[#de1f25] hover:bg-[#b0181d] text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md shadow-[#de1f25]/20">
                    Go to Active Portfolios
                </a>
            </div>
        </div>
    );
}
