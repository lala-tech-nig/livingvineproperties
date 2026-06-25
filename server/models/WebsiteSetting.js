const mongoose = require('mongoose');

const websiteSettingSchema = new mongoose.Schema({
    // Global Contacts & Social Handles
    address: {
        type: String,
        default: '15, Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    },
    phone: {
        type: String,
        default: '+234 800 123 4567',
    },
    email: {
        type: String,
        default: 'invest@livingvineproperties.com',
    },
    whatsapp: {
        type: String,
        default: 'https://wa.me/2348001234567',
    },
    facebook: {
        type: String,
        default: '#',
    },
    twitter: {
        type: String,
        default: '#',
    },
    instagram: {
        type: String,
        default: '#',
    },
    linkedin: {
        type: String,
        default: '#',
    },

    // Marquee Ticker Settings
    marqueeTitle: {
        type: String,
        default: 'Living Vine Properties Investment Limited',
    },
    marqueeTagline: {
        type: String,
        default: '"...Quest for uniqueness in service..."',
    },
    marqueeEmail: {
        type: String,
        default: 'info@livingvineproperties.com',
    },
    marqueePhone: {
        type: String,
        default: '+234 (0) 800 000 0001',
    },

    // Homepage About Snippet
    aboutTitle: {
        type: String,
        default: 'Proudly Indigenous. \n Global Standards.',
    },
    aboutSubtitle: {
        type: String,
        default: 'Who We Are',
    },
    aboutDescription1: {
        type: String,
        default: "Living Vine Properties isn't just a real estate company; we are a movement. Born from a deep understanding of the Nigerian land tenure system and the local investment climate, we bridge the gap between ambition and ownership.",
    },
    aboutDescription2: {
        type: String,
        default: "We exist to prove that trust, transparency, and high returns can coexist in the indigenous market. When you invest with us, you aren't just buying land—you are securing a legacy.",
    },
    aboutImage: {
        type: String,
        default: '/lagos.jpg',
    },
    aboutFeature1: {
        type: String,
        default: '100% Verified Documentation',
    },
    aboutFeature2: {
        type: String,
        default: 'Strategic Locations Only',
    },
    aboutFeature3: {
        type: String,
        default: 'Guaranteed Capital Appreciation',
    },

    // --- NEW FIELDS ---

    // Home Page Features
    homeStats: {
        type: [{
            label: String,
            value: String
        }],
        default: [
            { label: "Land Units Sold", value: "2,500+" },
            { label: "Happy Investors", value: "850+" },
            { label: "Project Locations", value: "15+" },
            { label: "Years Experience", value: "10+" }
        ]
    },
    homeServicesBadge: {
        type: String,
        default: 'What We Offer'
    },
    homeServicesTitle: {
        type: String,
        default: 'Wealth Creation Strategies'
    },
    homeServicesDesc: {
        type: String,
        default: "We've curated a suite of real estate solutions designed to help you secure, grow, and multiply your capital in the Nigerian market."
    },
    homeProjectsBadge: {
        type: String,
        default: 'Portfolio'
    },
    homeProjectsTitle: {
        type: String,
        default: 'Featured Developments'
    },
    homeAppTeaserBadge: {
        type: String,
        default: 'Coming Soon'
    },
    homeAppTeaserTitle: {
        type: String,
        default: 'Invest on the Go. Anytime, Anywhere.'
    },
    homeAppTeaserDesc: {
        type: String,
        default: 'Track your portfolio, receive real-time project updates, and secure new land acquisitions directly from your smartphone. The future of indigenous real estate investment is in your pocket.'
    },
    homeAppTeaserFeatures: {
        type: [String],
        default: [
            "Live portfolio tracking & ROI analytics",
            "Push notifications on project milestones",
            "One-tap investment top-up & withdrawal"
        ]
    },
    homeCTATitle: {
        type: String,
        default: 'Start Your Journey to Generational Wealth.'
    },
    homeCTADesc: {
        type: String,
        default: 'Join hundreds of smart investors securing their future with Living Vine Properties. Secure, transparent, and built on indigenous trust.'
    },
    homeCTABtnText: {
        type: String,
        default: 'Invest Now'
    },
    homeCTAAltBtnText: {
        type: String,
        default: 'Talk to an Advisor'
    },

    // About Page Content
    aboutPageHeroTitle: {
        type: String,
        default: 'Building Legacies, One Acre at a Time.'
    },
    aboutPageHeroSubtitle: {
        type: String,
        default: 'We are Living Vine Properties. An indigenous real estate company committed to bridging the gap between ambition and ownership through transparency, integrity, and strategic innovation.'
    },
    aboutPageEstablishedText: {
        type: String,
        default: 'Established 2015'
    },
    aboutPageMissionTitle: {
        type: String,
        default: 'Our Mission'
    },
    aboutPageMissionDesc: {
        type: String,
        default: 'To empower individuals and organizations with secure, profitable real estate investment opportunities that create generational wealth, while contributing significantly to the infrastructural development of Nigeria.'
    },
    aboutPageVisionTitle: {
        type: String,
        default: 'Our Vision'
    },
    aboutPageVisionDesc: {
        type: String,
        default: 'To be the most trusted and preferred real estate partner in Africa, known for our unwavering commitment to client satisfaction, project excellence, and community growth.'
    },
    aboutPageCoreValuesTitle: {
        type: String,
        default: 'What Drives Us'
    },
    aboutPageCoreValuesSubtitle: {
        type: String,
        default: 'These core values guide every decision we make and every interaction we have.'
    },
    aboutPageCoreValues: {
        type: [{
            title: String,
            desc: String,
            iconName: String
        }],
        default: [
            { title: "Integrity", desc: "We are transparent in our dealings. No hidden fees, no ambiguity using verifiable documentation.", iconName: "CheckCircle" },
            { title: "Excellence", desc: "We don't settle for average. Our projects are designed to meet global standards of quality and aesthetics.", iconName: "Award" },
            { title: "Client First", desc: "Your financial goals are our priority. We tailor our solutions to meet your specific investment needs.", iconName: "Users" }
        ]
    },
    aboutPageTeamTitle: {
        type: String,
        default: 'Meet The Minds'
    },
    aboutPageTeamSubtitle: {
        type: String,
        default: 'Leadership'
    },
    aboutPageTeam: {
        type: [{
            name: String,
            role: String,
            img: String
        }],
        default: [
            { name: "Micheal Okonkwo", role: "MD / CEO", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop" },
            { name: "Sarah Adebayo", role: "Head of Operations", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop" },
            { name: "Barr. Tunde Cole", role: "Legal Secretary", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop" }
        ]
    },
    aboutPageCertificationsTitle: {
        type: String,
        default: 'Certified & Registered With'
    },
    aboutPageCertifications: {
        type: [String],
        default: ["CAC RC: 7739391", "NRS", "EFCC SCUML"]
    },

    // Investments Page Content
    investmentsPageHeroTitle: {
        type: String,
        default: 'Grow Your Wealth With Real Assets'
    },
    investmentsPageHeroSubtitle: {
        type: String,
        default: 'Discover our tailored investment packages designed for security, high returns, and long-term capital appreciation.'
    },
    investmentsPageHeroBtnText: {
        type: String,
        default: 'Schedule a Consultation'
    },
    investmentsPageLandBankingBadge: {
        type: String,
        default: 'Wealth Strategy'
    },
    investmentsPageLandBankingTitle: {
        type: String,
        default: 'Land Banking'
    },
    investmentsPageLandBankingDesc: {
        type: String,
        default: 'Land Banking is the practice of buying land in undeveloped or developing areas with the intention of holding it for high capital appreciation. It is one of the safest and most profitable real estate strategies.'
    },
    investmentsPageLandBankingBenefits: {
        type: [String],
        default: [
            "Secure Title Documents (C of O, Gazette)",
            "100% ROI within 12-24 months in prime locations",
            "Zero maintenance costs while you hold"
        ]
    },
    investmentsPageLandBankingImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop'
    },
    investmentsPageLandBankingBtnText: {
        type: String,
        default: 'View Available Lands'
    },
    investmentsPageDevBadge: {
        type: String,
        default: 'Construction'
    },
    investmentsPageDevTitle: {
        type: String,
        default: 'Property Development'
    },
    investmentsPageDevDesc: {
        type: String,
        default: 'We design and build premium residential and commercial structures tailored to modern living. From automated smart homes to eco-friendly office spaces, our developments define luxury.'
    },
    investmentsPageDevBenefits: {
        type: [String],
        default: [
            "Smart Home Integration",
            "Premium Finishing & Materials",
            "Eco-Friendly Designs",
            "Facility Management Services"
        ]
    },
    investmentsPageDevImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2831&auto=format&fit=crop'
    },
    investmentsPageDevBtnText: {
        type: String,
        default: 'See Our Projects'
    },
    investmentsPageAppreciationTitle: {
        type: String,
        default: 'The Power of Appreciation'
    },
    investmentsPageAppreciationNote: {
        type: String,
        default: '*Projections based on historical data of the Ibeju-Lekki corridor. Real estate values in this axis have consistently outperformed traditional savings.'
    },
    investmentsPageAppreciationYears: {
        type: [{
            year: String,
            growth: String,
            percentage: Number
        }],
        default: [
            { year: "Year 1", growth: "Initial Investment", percentage: 30 },
            { year: "Year 3", growth: "50% Growth", percentage: 60 },
            { year: "Year 5+", growth: "150% ROI", percentage: 100 }
        ]
    },
    investmentsPageProcessTitle: {
        type: String,
        default: 'Ready to Start?'
    },
    investmentsPageProcessBtnText: {
        type: String,
        default: 'Begin Process'
    },
    investmentsPageProcessSteps: {
        type: [{
            step: String,
            title: String
        }],
        default: [
            { step: "01", title: "Free Consultation" },
            { step: "02", title: "Site Inspection" },
            { step: "03", title: "Payment & Documentation" },
            { step: "04", title: "Asset Allocation" }
        ]
    },

    // Contact Page Content
    contactPageHeroTitle: {
        type: String,
        default: 'Get In Touch'
    },
    contactPageHeroSubtitle: {
        type: String,
        default: 'Have a question about an investment? Want to schedule a site inspection? Our team is ready to assist you.'
    },
    contactPageOfficeHours: {
        type: String,
        default: 'Mon - Fri: 8:00 AM - 5:00 PM\nSat: 10:00 AM - 2:00 PM (Inspections Only)'
    },
    contactPageMapImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674'
    },
    contactPageMapLink: {
        type: String,
        default: 'https://maps.google.com'
    },

    // Projects Page Content
    projectsPageHeroTitle: {
        type: String,
        default: 'Our Portfolio'
    },
    projectsPageHeroSubtitle: {
        type: String,
        default: 'Explore our track record of excellence. From sold-out estates to upcoming luxury developments.'
    },

    // Privacy Policy Page
    privacyPageTitle: {
        type: String,
        default: 'Privacy Policy'
    },
    privacyPageEffectiveDate: {
        type: String,
        default: 'February 15, 2026'
    },
    privacyPageContent: {
        type: String,
        default: `### 1. Introduction
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
    },

    // Terms of Service Page
    termsPageTitle: {
        type: String,
        default: 'Terms of Service'
    },
    termsPageEffectiveDate: {
        type: String,
        default: 'February 15, 2026'
    },
    termsPageContent: {
        type: String,
        default: `### 1. Terms
By accessing the website at livingvineproperties.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.

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
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSetting', websiteSettingSchema);

