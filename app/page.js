"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { SERVICES } from "@/data";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
          {/* Placeholder for high-quality hero image */}
          <Image
            src="/hero-placeholder.jpg"
            alt="Luxury Real Estate"
            fill
            className="object-cover opacity-60"
            priority
          />
          {/* Fallback gradient if no image */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black opacity-80 mix-blend-multiply" />
        </div>

        <div className="container relative z-20 px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-white mb-6 leading-tight"
          >
            Investing in the <span className="text-primary italic">Future</span> of <br /> Real Estate
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Unlock guaranteed returns and premium property assets with Living Vine Properties. Your trusted partner in wealth creation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="bg-primary hover:bg-[#b5952f] text-black font-semibold text-lg px-8">
              Explore Opportunities
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 text-lg px-8">
              Contact Us
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-primary to-transparent" />
        </motion.div>
      </section>

      {/* Services Highlight */}
      <SectionWrapper className="bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Our Expertise</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer a broad spectrum of real estate investment services tailored to meet your financial goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="border-border/40 bg-card hover:bg-accent/5 transition-colors group cursor-pointer hover:border-primary/50">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-black transition-colors text-primary">
                      <Icon size={24} />
                    </div>
                    <CardTitle className="mb-2 text-xl group-hover:text-primary transition-colors">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary text-secondary-foreground overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/10">
                {/* Placeholder for About Image */}
                <div className="absolute inset-0 flex items-center justify-center text-white/10">
                  <Building2 size={120} />
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Why Living Vine?</h2>
              <p className="text-secondary-foreground/80 mb-8 text-lg leading-relaxed">
                We are driven by a commitment to **integrity, transparency, and innovation**. Our team of experts works tirelessly to identify high-value opportunities that secure your financial future.
              </p>

              <div className="space-y-4">
                {[
                  "Guaranteed Return on Investment",
                  "Strategic Partnerships & Joint Ventures",
                  "Transparent Land Acquisition Process",
                  "Client-Centric Approach"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="text-primary shrink-0" size={20} />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="mt-10 bg-primary/90 text-black hover:bg-primary" asChild>
                <Link href="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <SectionWrapper className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container px-4 mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-black">Ready to Invest?</h2>
          <p className="text-black/80 text-xl mb-10">
            Join hundreds of investors who have trusted Living Vine Properties with their real estate portfolio.
          </p>
          <Button size="lg" className="bg-black text-white hover:bg-black/80 h-14 px-10 text-lg rounded-full">
            Start Your Journey
          </Button>
        </div>
      </SectionWrapper>
    </div>
  );
}
