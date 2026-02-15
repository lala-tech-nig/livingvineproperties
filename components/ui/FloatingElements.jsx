"use client";

import { motion } from "framer-motion";

const FloatingElements = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Gold Orb */}
            <motion.div
                animate={{
                    y: [0, -30, 0],
                    x: [0, 20, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-20 right-[10%] w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"
            />

            {/* Red Accent */}
            <motion.div
                animate={{
                    y: [0, 40, 0],
                    x: [0, -30, 0],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute bottom-40 left-[5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"
            />
        </div>
    );
};

export default FloatingElements;
