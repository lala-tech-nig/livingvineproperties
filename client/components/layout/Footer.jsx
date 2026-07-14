"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Instagram, Facebook, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWebsiteData } from "@/lib/websiteData";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Investments", href: "/investments" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
];

const Footer = () => {
    const { settings, services } = useWebsiteData();


    // Helper to resolve social links
    const socialLinks = [
        { platform: "Instagram", url: settings?.instagram || "#" },
        { platform: "LinkedIn", url: settings?.linkedin || "#" },
        { platform: "Twitter", url: settings?.twitter || "#" },
        { platform: "Facebook", url: settings?.facebook || "#" },
    ];

    return (
        <footer className="bg-secondary text-white pt-20 pb-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-yellow-500 to-primary" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <h3 className="font-serif text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Living Vine
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            We are a proudly indigenous real estate investment partner helping you build wealth through secure land ownership and development.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social, idx) => {
                                const Icon = social.platform === "Instagram" ? Instagram : social.platform === "LinkedIn" ? Linkedin : social.platform === "Twitter" ? Twitter : Facebook;
                                return (
                                    <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-white/10">
                                        <Icon size={18} />
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-6 text-primary">Discover</h4>
                        <ul className="space-y-3">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                                        <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-6 text-primary">Invest With Us</h4>
                        <ul className="space-y-3">
                            {services.slice(0, 4).map((service) => (
                                <li key={service.title}>
                                    <Link href={service.href || '/investments'} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {service.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-6 text-primary">Contact Us</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4 text-sm text-gray-300 group">
                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <MapPin size={16} />
                                </div>
                                <span>{settings?.address}</span>
                            </li>
                            {settings?.phone && (
                            <li className="flex items-center gap-4 text-sm text-gray-300 group">
                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Phone size={16} />
                                </div>
                                <span>{settings.phone}</span>
                            </li>
                            )}
                            {settings?.email && (
                            <li className="flex items-center gap-4 text-sm text-gray-300 group">
                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Mail size={16} />
                                </div>
                                <span>{settings.email}</span>
                            </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} LIVING VINE PROPERTIES INVESTMENT LIMITED. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
