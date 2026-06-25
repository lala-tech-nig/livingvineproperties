"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import api from "@/lib/axios";

export default function PrivacyPolicy() {
    const [policy, setPolicy] = useState({
        privacyPageTitle: "",
        privacyPageEffectiveDate: "",
        privacyPageContent: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data && data.privacyPageContent) {
                    setPolicy({
                        privacyPageTitle: data.privacyPageTitle || "",
                        privacyPageEffectiveDate: data.privacyPageEffectiveDate || "",
                        privacyPageContent: data.privacyPageContent
                    });
                }
            } catch (e) {
                console.error("Failed to load privacy policy settings:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    const renderContent = (text) => {
        if (!text) return null;
        return text.split('\n\n').map((block, i) => {
            const cleanBlock = block.trim();
            if (cleanBlock.startsWith('###')) {
                return <h3 key={i} className="text-xl font-bold mt-8 mb-4 text-foreground">{cleanBlock.replace('###', '').trim()}</h3>;
            }
            if (cleanBlock.startsWith('-')) {
                return (
                    <ul key={i} className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                        {cleanBlock.split('\n').map((li, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: li.replace('-', '').trim() }} />
                        ))}
                    </ul>
                );
            }
            return <p key={i} className="text-muted-foreground mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanBlock }} />;
        });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="bg-white">
            <SectionWrapper>
                <div className="max-w-3xl mx-auto prose prose-lg prose-slate text-foreground">
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-8">{policy.privacyPageTitle}</h1>
                    <p className="text-muted-foreground mb-8">Effective Date: {policy.privacyPageEffectiveDate}</p>
                    {renderContent(policy.privacyPageContent)}
                </div>
            </SectionWrapper>
        </div>
    );
}
