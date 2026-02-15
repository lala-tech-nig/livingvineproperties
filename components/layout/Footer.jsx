import Link from "next/link";
import { Mail, MapPin, Phone, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { NAV_LINKS, CONTACT_INFO, SERVICES } from "@/data";

const Footer = () => {
    return (
        <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t border-white/10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h3 className="font-serif text-2xl font-bold text-primary">Living Vine</h3>
                        <p className="text-secondary-foreground/70 text-sm leading-relaxed">
                            We provide broad spectrum real estate investment opportunities with high level of security for capital invested.
                        </p>
                        <div className="flex space-x-4 pt-4">
                            {/* Social placeholders */}
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary hover:text-black transition-colors"><Facebook size={18} /></a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary hover:text-black transition-colors"><Instagram size={18} /></a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-primary hover:text-black transition-colors"><Linkedin size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-6">Our Services</h4>
                        <ul className="space-y-3">
                            {SERVICES.map((service) => (
                                <li key={service.title}>
                                    <Link href={service.href} className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                                        {service.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-serif text-lg font-semibold mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-secondary-foreground/70">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>{CONTACT_INFO.address}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-secondary-foreground/70">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>{CONTACT_INFO.phone}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-secondary-foreground/70">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>{CONTACT_INFO.email}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondary-foreground/50">
                    <p>© {new Date().getFullYear()} Living Vine Properties & Investments Ltd. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
