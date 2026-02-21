"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2, type: "spring" }}
            className="fixed bottom-8 right-8 z-50"
        >
            <Link
                href="https://wa.me/2348001234567" // Replace with actual number
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors"
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle size={32} fill="white" />
            </Link>
            <div className="absolute -top-10 right-0 bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap animate-bounce">
                Chat with us!
            </div>
        </motion.div>
    );
};

export default WhatsAppButton;
