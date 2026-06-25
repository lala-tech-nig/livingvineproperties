"use client";

import { useState, useEffect } from "react";
import { Award, Briefcase, CheckCircle, Target, Users } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { Card, CardContent } from "@/components/ui/Card";
import api from "@/lib/axios";

const iconMap = {
    CheckCircle: CheckCircle,
    Award: Award,
    Users: Users,
    Target: Target
};

export default function About() {
    const [settings, setSettings] = useState({
        aboutPageEstablishedText: "",
        aboutPageHeroTitle: "",
        aboutPageHeroSubtitle: "",
        aboutPageMissionTitle: "",
        aboutPageMissionDesc: "",
        aboutPageVisionTitle: "",
        aboutPageVisionDesc: "",
        aboutPageCoreValuesTitle: "",
        aboutPageCoreValuesSubtitle: "",
        aboutPageCoreValues: [],
        aboutPageTeamTitle: "",
        aboutPageTeamSubtitle: "",
        aboutPageTeam: [],
        aboutPageCertificationsTitle: "",
        aboutPageCertifications: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAboutSettings = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data) {
                    setSettings({
                        aboutPageEstablishedText: data.aboutPageEstablishedText || "",
                        aboutPageHeroTitle: data.aboutPageHeroTitle || "",
                        aboutPageHeroSubtitle: data.aboutPageHeroSubtitle || "",
                        aboutPageMissionTitle: data.aboutPageMissionTitle || "",
                        aboutPageMissionDesc: data.aboutPageMissionDesc || "",
                        aboutPageVisionTitle: data.aboutPageVisionTitle || "",
                        aboutPageVisionDesc: data.aboutPageVisionDesc || "",
                        aboutPageCoreValuesTitle: data.aboutPageCoreValuesTitle || "",
                        aboutPageCoreValuesSubtitle: data.aboutPageCoreValuesSubtitle || "",
                        aboutPageCoreValues: data.aboutPageCoreValues || [],
                        aboutPageTeamTitle: data.aboutPageTeamTitle || "",
                        aboutPageTeamSubtitle: data.aboutPageTeamSubtitle || "",
                        aboutPageTeam: data.aboutPageTeam || [],
                        aboutPageCertificationsTitle: data.aboutPageCertificationsTitle || "",
                        aboutPageCertifications: data.aboutPageCertifications || []
                    });
                }
            } catch (e) {
                console.error("Failed to load about page settings:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAboutSettings();
    }, []);

    // Split title by newlines to render br tags
    const renderTitle = (titleText) => {
        return titleText.split('\n').map((line, i, arr) => (
            <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
            </span>
        ));
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative bg-secondary text-white py-32 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/80 z-10" />
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')" }}
                    />
                </div>

                <div className="container relative z-20 mx-auto max-w-4xl">
                    <div className="inline-block mb-4">
                        <span className="py-1 px-3 border border-white/30 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-sm">
                            {settings.aboutPageEstablishedText}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
                        {renderTitle(settings.aboutPageHeroTitle)}
                    </h1>
                    <p className="text-xl text-gray-300 font-light leading-relaxed">
                        {settings.aboutPageHeroSubtitle}
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <SectionWrapper className="bg-white">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="bg-gray-50 p-10 rounded-2xl border-l-4 border-primary">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-foreground">{settings.aboutPageMissionTitle}</h2>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {settings.aboutPageMissionDesc}
                        </p>
                    </div>

                    <div className="bg-gray-50 p-10 rounded-2xl border-l-4 border-yellow-505">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-600">
                                <Award size={32} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-foreground">{settings.aboutPageVisionTitle}</h2>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {settings.aboutPageVisionDesc}
                        </p>
                    </div>
                </div>
            </SectionWrapper>

            {/* Core Values */}
            <SectionWrapper className="bg-gray-50">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-primary font-bold tracking-widest uppercase mb-2">Our DNA</h2>
                    <h3 className="text-4xl font-serif font-bold mb-4 text-foreground">{settings.aboutPageCoreValuesTitle}</h3>
                    <p className="text-muted-foreground text-lg">
                        {settings.aboutPageCoreValuesSubtitle}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {settings.aboutPageCoreValues.map((val, i) => {
                        const Icon = iconMap[val.iconName] || CheckCircle;
                        return (
                            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-8 text-center px-8 pb-10">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                                        <Icon size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold font-serif mb-4 text-foreground">{val.title}</h4>
                                    <p className="text-muted-foreground">{val.desc}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </SectionWrapper>

            {/* Leadership Team */}
            <SectionWrapper className="bg-white">
                <div className="text-center mb-16">
                    <h2 className="text-primary font-bold tracking-widest uppercase mb-2">{settings.aboutPageTeamSubtitle}</h2>
                    <h3 className="text-4xl font-serif font-bold mb-4 text-foreground">{settings.aboutPageTeamTitle}</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {settings.aboutPageTeam.map((member, i) => (
                        <div key={i} className="group text-center">
                            <div className="relative h-80 w-full mb-6 overflow-hidden rounded-xl bg-gray-200">
                                <div
                                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                    style={{ backgroundImage: `url('${member.img}')` }}
                                />
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-foreground">{member.name}</h4>
                            <p className="text-primary font-medium uppercase tracking-wider text-sm">{member.role}</p>
                        </div>
                    ))}
                </div>
            </SectionWrapper>

            {/* Certifications & Trust */}
            <section className="py-20 bg-gray-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-serif font-bold mb-10 opacity-80">{settings.aboutPageCertificationsTitle}</h3>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {settings.aboutPageCertifications.map((cert, i) => {
                            const Icon = i % 3 === 0 ? Briefcase : i % 3 === 1 ? Award : CheckCircle;
                            return (
                                <div key={i} className="text-2xl font-bold flex items-center gap-2">
                                    <Icon /> {cert}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
