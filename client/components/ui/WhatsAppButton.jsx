"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import api from "@/lib/axios";

const WhatsAppButton = () => {
    const [whatsappLink, setWhatsappLink] = useState("https://wa.me/2348001234567");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data && data.whatsapp) {
                    const value = data.whatsapp.trim();
                    if (value.startsWith('http://') || value.startsWith('https://')) {
                        setWhatsappLink(value);
                    } else if (value.startsWith('wa.me/')) {
                        setWhatsappLink(`https://${value}`);
                    } else {
                        // Prepend wa.me and strip non-digit characters
                        const cleanDigits = value.replace(/\D/g, '');
                        if (cleanDigits) {
                            setWhatsappLink(`https://wa.me/${cleanDigits}`);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load WhatsApp contact number:", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2, type: "spring" }}
            className="fixed bottom-8 right-8 z-50"
        >
            <Link
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors"
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle size={32} fill="white" />
            </Link>
            <div className="absolute -top-10 right-0 bg-white px-3 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-lg whitespace-nowrap animate-bounce">
                Chat with us!
            </div>
        </motion.div>
    );
};

export default WhatsAppButton;
