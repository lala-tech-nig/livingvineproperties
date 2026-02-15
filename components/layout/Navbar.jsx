"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, COMPANY_NAME } from "@/data";
import { Button } from "@/components/ui/Button";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-white border-gray-200 shadow-sm py-4"
                    : "bg-white/95 border-transparent py-6"
            )}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="font-serif text-2xl font-bold tracking-tighter flex items-center gap-2">
                    <span className="text-primary text-3xl">LV</span>
                    <div className="flex flex-col leading-none">
                        <span className="text-lg text-foreground">Living Vine</span>
                        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Properties</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors relative group",
                                "text-foreground hover:text-primary",
                                pathname === link.href ? "text-primary font-bold" : ""
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Button
                        size="sm"
                        asChild
                    >
                        <Link href="/contact">Get Started</Link>
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div
                    className="md:hidden bg-white border-b border-gray-200 shadow-xl absolute top-full left-0 right-0"
                >
                    <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-lg font-medium py-3 border-b border-gray-50 text-foreground",
                                    pathname === link.href ? "text-primary" : "text-gray-600"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Button className="w-full mt-4" asChild>
                            <Link href="/contact">Invest Now</Link>
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
