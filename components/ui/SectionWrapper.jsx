"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SectionWrapper = ({ children, className, id, delay = 0 }) => {
    return (
        <section id={id} className={cn("py-16 md:py-24", className)}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </section>
    );
};

export default SectionWrapper;
