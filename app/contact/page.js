"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CONTACT_INFO } from "@/data";

export default function Contact() {
    return (
        <div className="pt-20 min-h-screen bg-background">
            {/* Hero */}
            <section className="bg-secondary text-secondary-foreground py-20 px-4 text-center">
                <div className="container mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6">Contact Us</h1>
                    <p className="text-xl max-w-2xl mx-auto text-secondary-foreground/80">
                        Get in touch with our team to discuss your investment goals.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <SectionWrapper delay={0.1}>
                        <h2 className="text-2xl font-serif font-bold mb-8">Get In Touch</h2>
                        <div className="space-y-6">
                            <Card className="border-none shadow-md bg-secondary/5">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Visit Us</h3>
                                        <p className="text-muted-foreground">{CONTACT_INFO.address}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md bg-secondary/5">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Call Us</h3>
                                        <p className="text-muted-foreground">{CONTACT_INFO.phone}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md bg-secondary/5">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Email Us</h3>
                                        <p className="text-muted-foreground">{CONTACT_INFO.email}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-12">
                            <h3 className="text-xl font-serif font-bold mb-4">Office Hours</h3>
                            <p className="text-muted-foreground">Monday - Friday: 8:00 AM - 6:00 PM</p>
                            <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                            <p className="text-muted-foreground">Sunday: Closed</p>
                        </div>
                    </SectionWrapper>

                    {/* Contact Form */}
                    <SectionWrapper delay={0.2} className="bg-card rounded-2xl p-8 border shadow-lg h-fit">
                        <h2 className="text-2xl font-serif font-bold mb-6">Send a Message</h2>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                                    <input type="text" id="name" className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <input type="email" id="email" className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="john@example.com" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                <select id="subject" className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary focus:outline-none">
                                    <option>Investment Inquiry</option>
                                    <option>Joint Venture Proposal</option>
                                    <option>General Question</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium">Message</label>
                                <textarea id="message" rows={5} className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="How can we help you?"></textarea>
                            </div>

                            <Button type="submit" size="lg" className="w-full">
                                Send Message
                            </Button>
                        </form>
                    </SectionWrapper>
                </div>
            </div>
        </div>
    );
}
