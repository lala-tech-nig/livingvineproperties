"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";
import { motion } from "framer-motion";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Investments", href: "/investments" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [siteSettings, setSiteSettings] = useState(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data) setSiteSettings(data);
            } catch (e) {
                // silent
            }
        };
        loadSettings();
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-[44px] left-0 right-0 z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-white border-gray-200 shadow-sm py-4"
                    : "bg-white/95 border-transparent py-6"
            )}
        >
            <div className="container mx-auto px-4 flex justify-between items-center relative">
                {/* Logo */}
                <Link href="/" className="flex items-center shrink-0 z-10">
                    <Image
                        src="/living-logo.png"
                        alt="Living Vine Properties"
                        width={160}
                        height={48}
                        className="h-10 md:h-12 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Centered Desktop Nav Links */}
                <div className="hidden md:flex items-center justify-center space-x-8 absolute inset-x-0 mx-auto pointer-events-none w-max">
                    <div className="flex items-center space-x-8 pointer-events-auto">
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
                    </div>
                </div>

                {/* Right side: Our Profile button + Auth Buttons */}
                <div className="hidden md:flex items-center gap-3 shrink-0 z-10">
                    {siteSettings?.companyProfilePdf && (
                        <button
                            onClick={() => window.open(siteSettings.companyProfilePdf, '_blank')}
                            className="relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-[#7d1419] via-[#b0181d] to-[#7d1419] text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                            </span>
                            <FileText size={14} className="text-amber-300" />
                            Our Profile
                            <motion.span
                                animate={{ x: [0, 3, 0] }}
                                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                                className="text-xs"
                            >👆</motion.span>
                        </button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                    >
                        <Link href="/investor/login">Login</Link>
                    </Button>
                    <Button
                        size="sm"
                        asChild
                    >
                        <Link href="/investor/register">Get Started</Link>
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground z-10"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div
                    className="md:hidden bg-white border-b border-gray-200 shadow-xl absolute top-full left-0 right-0 animate-in slide-in-from-top-5"
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
                        {siteSettings?.companyProfilePdf && (
                            <button
                                onClick={() => window.open(siteSettings.companyProfilePdf, '_blank')}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#7d1419] via-[#b0181d] to-[#7d1419] text-white py-3 rounded-xl font-bold text-sm shadow-md mt-2"
                            >
                                <FileText size={16} className="text-amber-300" />
                                Our Profile ↗
                            </button>
                        )}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <Button variant="outline" asChild>
                                <Link href="/investor/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/investor/register">Get Started</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
