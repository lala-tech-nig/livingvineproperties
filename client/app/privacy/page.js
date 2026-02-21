"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicy() {
    return (
        <>
            <Navbar />
            <div className="pt-20 bg-white">
                <SectionWrapper>
                    <div className="max-w-3xl mx-auto prose prose-lg prose-slate">
                        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Privacy Policy</h1>
                        <p className="text-muted-foreground">Effective Date: February 15, 2026</p>

                        <h3>1. Introduction</h3>
                        <p>
                            Living Vine Properties ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                        </p>

                        <h3>2. Information We Collect</h3>
                        <p>
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        </p>
                        <ul>
                            <li><strong>Identity Data:</strong> includes first name, maiden name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                        </ul>

                        <h3>3. How We Use Your Data</h3>
                        <p>
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul>
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>

                        <h3>4. Data Security</h3>
                        <p>
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>

                        <h3>5. Contact Details</h3>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us at: <br />
                            <strong>Email:</strong> legal@livingvineproperties.com <br />
                            <strong>Address:</strong> 15, Admiralty Way, Lekki Phase 1, Lagos, Nigeria.
                        </p>
                    </div>
                </SectionWrapper>
            </div>
            <Footer />
        </>
    );
}
