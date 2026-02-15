"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";

export default function TermsOfService() {
    return (
        <div className="pt-20 bg-white">
            <SectionWrapper>
                <div className="max-w-3xl mx-auto prose prose-lg prose-slate">
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Terms of Service</h1>
                    <p className="text-muted-foreground">Effective Date: February 15, 2026</p>

                    <h3>1. Terms</h3>
                    <p>
                        By accessing the website at <a href="https://livingvineproperties.com">livingvineproperties.com</a>, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </p>

                    <h3>2. Use License</h3>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (information or software) on Living Vine Properties' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul>
                        <li>modify or copy the materials;</li>
                        <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                        <li>attempt to decompile or reverse engineer any software contained on Living Vine Properties' website;</li>
                        <li>remove any copyright or other proprietary notations from the materials; or</li>
                        <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                    </ul>

                    <h3>3. Disclaimer</h3>
                    <p>
                        The materials on Living Vine Properties' website are provided on an 'as is' basis. Living Vine Properties makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>

                    <h3>4. Limitations</h3>
                    <p>
                        In no event shall Living Vine Properties or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Living Vine Properties' website.
                    </p>

                    <h3>5. Accuracy of Materials</h3>
                    <p>
                        The materials appearing on Living Vine Properties' website could include technical, typographical, or photographic errors. Living Vine Properties does not warrant that any of the materials on its website are accurate, complete or current. Living Vine Properties may make changes to the materials contained on its website at any time without notice. However Living Vine Properties does not make any commitment to update the materials.
                    </p>

                    <h3>6. Governing Law</h3>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws of Lagos State, Nigeria and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                    </p>
                </div>
            </SectionWrapper>
        </div>
    );
}
