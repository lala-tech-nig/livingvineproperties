"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import api from "@/lib/axios";

export default function PrivacyPolicy() {
    const [policy, setPolicy] = useState({
        privacyPageTitle: "Privacy Policy",
        privacyPageEffectiveDate: "February 15, 2026",
        privacyPageContent: `### 1. Introduction
Living Vine Properties ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.

### 2. Information We Collect
We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
- **Identity Data:** includes first name, maiden name, last name, username or similar identifier.
- **Contact Data:** includes billing address, delivery address, email address and telephone numbers.
- **Technical Data:** includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.

### 3. How We Use Your Data
We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
- Where we need to perform the contract we are about to enter into or have entered into with you.
- Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.
- Where we need to comply with a legal or regulatory obligation.

### 4. Data Security
We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.`
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data && data.privacyPageContent) {
                    setPolicy({
                        privacyPageTitle: data.privacyPageTitle || "Privacy Policy",
                        privacyPageEffectiveDate: data.privacyPageEffectiveDate || "February 15, 2026",
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
