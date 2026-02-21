"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SectionWrapper = ({ children, className, id }) => {
    return (
        <section id={id} className={cn("py-20 md:py-24 relative overflow-hidden", className)}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="container mx-auto px-4 relative z-10"
            >
                {children}
            </motion.div>
        </section>
    );
};

export default SectionWrapper;
