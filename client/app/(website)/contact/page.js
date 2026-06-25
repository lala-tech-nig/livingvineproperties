"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

const STATIC_CONTACT_INFO = {
    address: "15, Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
    phone: "+234 800 123 4567\n+234 812 345 6789",
    email: "info@livingvineproperties.com\nsales@livingvineproperties.com",
};

export default function Contact() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        interest: "General Inquiry",
        message: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data) setSettings(data);
            } catch (e) {
                console.error("Failed to load settings in Contact Page:", e);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill in all required fields!");
            return;
        }

        setLoading(true);
        try {
            await api.post('/website/inquiries', formData);
            toast.success("Message sent successfully! We will contact you shortly.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                interest: "General Inquiry",
                message: ""
            });
        } catch (error) {
            console.error("Failed to submit inquiry:", error);
            toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="bg-primary text-white py-20 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                        {settings?.contactPageHeroTitle || "Get In Touch"}
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
                        {settings?.contactPageHeroSubtitle || "Have a question about an investment? Want to schedule a site inspection? Our team is ready to assist you."}
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
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {settings?.address || STATIC_CONTACT_INFO.address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-foreground">Phone Support</h4>
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {settings?.phone || STATIC_CONTACT_INFO.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-foreground">Email Us</h4>
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {settings?.email || STATIC_CONTACT_INFO.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-foreground">Office Hours</h4>
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {settings?.contactPageOfficeHours || "Mon - Fri: 8:00 AM - 5:00 PM\nSat: 10:00 AM - 2:00 PM (Inspections Only)"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="w-full h-80 bg-gray-200 rounded-2xl overflow-hidden relative shadow-lg border border-gray-300">
                            <div
                                className="absolute inset-0 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500"
                                style={{ backgroundImage: `url('${settings?.contactPageMapImage || "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop"}')` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <a 
                                    href={settings?.contactPageMapLink || "https://maps.google.com"} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-white px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                                >
                                    <MapPin size={16} className="text-primary" /> View on Google Maps
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-gray-50 p-10 rounded-3xl border border-gray-200 shadow-sm">
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Send a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-bold text-gray-700">Full Name *</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe" 
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white text-gray-900" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-bold text-gray-700">Email Address *</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com" 
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white text-gray-900" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-bold text-gray-700">Phone Number</label>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+234..." 
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white text-gray-900" 
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="interest" className="text-sm font-bold text-gray-700">I am interested in...</label>
                                <select 
                                    id="interest" 
                                    name="interest"
                                    value={formData.interest}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white text-gray-900"
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Land Banking">Land Banking</option>
                                    <option value="The Ambiance (Lekki)">The Ambiance (Lekki)</option>
                                    <option value="Greenfield Estate (Epe)">Greenfield Estate (Epe)</option>
                                    <option value="Partnership Proposal">Partnership Proposal</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-bold text-gray-700">Message *</label>
                                <textarea 
                                    id="message" 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5" 
                                    placeholder="How can we help you?" 
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none bg-white text-gray-900"
                                ></textarea>
                            </div>

                            <Button size="lg" className="w-full text-lg h-14" type="submit" disabled={loading}>
                                {loading ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
