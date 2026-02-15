"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const variants = {
        default: "bg-primary text-white hover:bg-[#b91c1c] shadow-sm hover:shadow-md transition-shadow",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
        gold: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm",
        glass: "bg-white/90 border border-gray-200 text-foreground hover:bg-gray-100", // Made opaque for corporate professional look
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes = {
        default: "h-12 px-6 py-2 text-base",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-14 rounded-full px-8 text-lg",
        icon: "h-10 w-10",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 font-serif tracking-wide",
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    );
});
Button.displayName = "Button";

export { Button };
