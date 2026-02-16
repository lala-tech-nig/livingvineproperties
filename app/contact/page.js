"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Contact() {
    return (
        <>
            <Navbar />
            <div className="pt-20 bg-white">
                {/* Hero */}
                <section className="bg-primary text-white py-20 text-center">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Get In Touch</h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
                            Have a question about an investment? Want to schedule a site inspection? Our team is ready to assist you.
                        </p>
                    </div>
                </section>

                <SectionWrapper>
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Info & Map */}
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-foreground mb-8">Visit Our Office</h2>

                            <div className="space-y-8 mb-12">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-foreground">Headquarters</h4>
                                        <p className="text-muted-foreground">15, Admiralty Way, Lekki Phase 1,<br /> Lagos, Nigeria</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-foreground">Phone Support</h4>
                                        <p className="text-muted-foreground">+234 800 123 4567<br />+234 812 345 6789</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-foreground">Email Us</h4>
                                        <p className="text-muted-foreground">info@livingvineproperties.com<br />sales@livingvineproperties.com</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-foreground">Office Hours</h4>
                                        <p className="text-muted-foreground">Mon - Fri: 8:00 AM - 5:00 PM<br />Sat: 10:00 AM - 2:00 PM (Inspections Only)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Static Map Image Placeholder */}
                            <div className="w-full h-80 bg-gray-200 rounded-2xl overflow-hidden relative shadow-lg border border-gray-300">
                                <div
                                    className="absolute inset-0 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500"
                                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop')" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                    <div className="bg-white px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" /> View on Google Maps
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-gray-50 p-10 rounded-3xl border border-gray-200 shadow-sm">
                            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Send a Message</h2>
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-bold text-gray-700">Full Name</label>
                                        <input type="text" id="name" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-bold text-gray-700">Email Address</label>
                                        <input type="email" id="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-bold text-gray-700">Phone Number</label>
                                    <input type="tel" id="phone" placeholder="+234..." className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="interest" className="text-sm font-bold text-gray-700">I am interested in...</label>
                                    <select id="interest" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white">
                                        <option>General Inquiry</option>
                                        <option>Land Banking</option>
                                        <option>The Ambiance (Lekki)</option>
                                        <option>Greenfield Estate (Epe)</option>
                                        <option>Partnership Proposal</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-bold text-gray-700">Message</label>
                                    <textarea id="message" rows="5" placeholder="How can we help you?" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"></textarea>
                                </div>

                                <Button size="lg" className="w-full text-lg h-14" type="submit">
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </SectionWrapper>
            </div>
            <Footer />
        </>
    );
}
