"use client";

import { cn } from "@/lib/utils";

const SectionWrapper = ({ children, className, id }) => {
    return (
        <section id={id} className={cn("py-20 md:py-24 relative overflow-hidden", className)}>
            <div className="container mx-auto px-4 relative z-10">
                {children}
            </div>
        </section>
    );
};

export default SectionWrapper;
