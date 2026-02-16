"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const variants = {
        default: "bg-primary text-white hover:bg-[#b91c1c] shadow-lg shadow-primary/20",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
        gold: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg shadow-yellow-600/20",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes = {
        default: "h-12 px-6 py-2 text-base",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-14 rounded-full px-8 text-lg",
        icon: "h-10 w-10",
    };

    const classes = cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 font-serif tracking-wide",
        variants[variant],
        sizes[size],
        className
    );

    if (asChild) {
        return React.cloneElement(children, {
            className: cn(children.props.className, classes),
            ref,
        });
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={classes}
            ref={ref}
            {...props}
        >
            {children}
        </motion.button>
    );
});
Button.displayName = "Button";

export { Button };
