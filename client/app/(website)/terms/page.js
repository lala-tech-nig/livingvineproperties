"use client";

import { useState, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import api from "@/lib/axios";

export default function TermsOfService() {
    const [terms, setTerms] = useState({
        termsPageTitle: "Terms of Service",
        termsPageEffectiveDate: "February 15, 2026",
        termsPageContent: `### 1. Terms
By accessing the website at [livingvineproperties.com](https://livingvineproperties.com), you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.

### 2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on Living Vine Properties' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- modify or copy the materials;
- use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
- attempt to decompile or reverse engineer any software contained on Living Vine Properties' website;
- remove any copyright or other proprietary notations from the materials; or
- transfer the materials to another person or "mirror" the materials on any other server.

### 3. Disclaimer
The materials on Living Vine Properties' website are provided on an 'as is' basis. Living Vine Properties makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

### 4. Limitations
In no event shall Living Vine Properties or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Living Vine Properties' website.`
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const { data } = await api.get('/website/settings');
                if (data && data.termsPageContent) {
                    setTerms({
                        termsPageTitle: data.termsPageTitle || "Terms of Service",
                        termsPageEffectiveDate: data.termsPageEffectiveDate || "February 15, 2026",
                        termsPageContent: data.termsPageContent
                    });
                }
            } catch (e) {
                console.error("Failed to load terms of service settings:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchTerms();
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
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-8">{terms.termsPageTitle}</h1>
                    <p className="text-muted-foreground mb-8">Effective Date: {terms.termsPageEffectiveDate}</p>
                    {renderContent(terms.termsPageContent)}
                </div>
            </SectionWrapper>
        </div>
    );
}
