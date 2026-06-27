const mongoose = require('mongoose');

const websiteSettingSchema = new mongoose.Schema({
    // Global Contacts & Social Handles
    address: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        default: '',
    },
    whatsapp: {
        type: String,
        default: '',
    },
    facebook: {
        type: String,
        default: '',
    },
    twitter: {
        type: String,
        default: '',
    },
    instagram: {
        type: String,
        default: '',
    },
    linkedin: {
        type: String,
        default: '',
    },

    // Marquee Ticker Settings
    marqueeTitle: {
        type: String,
        default: '',
    },
    marqueeTagline: {
        type: String,
        default: '',
    },
    marqueeEmail: {
        type: String,
        default: '',
    },
    marqueePhone: {
        type: String,
        default: '',
    },

    // Homepage About Snippet
    aboutTitle: {
        type: String,
        default: '',
    },
    aboutSubtitle: {
        type: String,
        default: '',
    },
    aboutDescription1: {
        type: String,
        default: '',
    },
    aboutDescription2: {
        type: String,
        default: '',
    },
    aboutImage: {
        type: String,
        default: '',
    },
    aboutFeature1: {
        type: String,
        default: '',
    },
    aboutFeature2: {
        type: String,
        default: '',
    },
    aboutFeature3: {
        type: String,
        default: '',
    },

    // Homepage extended
    homeStats: {
        type: [{
            label: String,
            value: String
        }],
        default: []
    },
    homeServicesBadge: {
        type: String,
        default: ''
    },
    homeServicesTitle: {
        type: String,
        default: ''
    },
    homeServicesDesc: {
        type: String,
        default: ''
    },
    homeProjectsBadge: {
        type: String,
        default: ''
    },
    homeProjectsTitle: {
        type: String,
        default: ''
    },
    homeAppTeaserBadge: {
        type: String,
        default: ''
    },
    homeAppTeaserTitle: {
        type: String,
        default: ''
    },
    homeAppTeaserDesc: {
        type: String,
        default: ''
    },
    homeAppTeaserFeatures: {
        type: [String],
        default: []
    },
    homeCTATitle: {
        type: String,
        default: ''
    },
    homeCTADesc: {
        type: String,
        default: ''
    },
    homeCTABtnText: {
        type: String,
        default: ''
    },
    homeCTAAltBtnText: {
        type: String,
        default: ''
    },

    // About Page Content
    aboutPageHeroTitle: {
        type: String,
        default: ''
    },
    aboutPageHeroSubtitle: {
        type: String,
        default: ''
    },
    aboutPageEstablishedText: {
        type: String,
        default: ''
    },
    aboutPageMissionTitle: {
        type: String,
        default: ''
    },
    aboutPageMissionDesc: {
        type: String,
        default: ''
    },
    aboutPageVisionTitle: {
        type: String,
        default: ''
    },
    aboutPageVisionDesc: {
        type: String,
        default: ''
    },
    aboutPageCoreValuesTitle: {
        type: String,
        default: ''
    },
    aboutPageCoreValuesSubtitle: {
        type: String,
        default: ''
    },
    aboutPageCoreValues: {
        type: [{
            title: String,
            desc: String,
            iconName: String
        }],
        default: []
    },
    aboutPageTeamTitle: {
        type: String,
        default: ''
    },
    aboutPageTeamSubtitle: {
        type: String,
        default: ''
    },
    aboutPageTeam: {
        type: [{
            name: String,
            role: String,
            img: String
        }],
        default: []
    },
    aboutPageCertificationsTitle: {
        type: String,
        default: ''
    },
    aboutPageCertifications: {
        type: [String],
        default: []
    },

    // Investments Page Content
    investmentsPageHeroTitle: {
        type: String,
        default: ''
    },
    investmentsPageHeroSubtitle: {
        type: String,
        default: ''
    },
    investmentsPageHeroBtnText: {
        type: String,
        default: ''
    },
    investmentsPageLandBankingBadge: {
        type: String,
        default: ''
    },
    investmentsPageLandBankingTitle: {
        type: String,
        default: ''
    },
    investmentsPageLandBankingDesc: {
        type: String,
        default: ''
    },
    investmentsPageLandBankingBenefits: {
        type: [String],
        default: []
    },
    investmentsPageLandBankingImage: {
        type: String,
        default: ''
    },
    investmentsPageLandBankingBtnText: {
        type: String,
        default: ''
    },
    investmentsPageDevBadge: {
        type: String,
        default: ''
    },
    investmentsPageDevTitle: {
        type: String,
        default: ''
    },
    investmentsPageDevDesc: {
        type: String,
        default: ''
    },
    investmentsPageDevBenefits: {
        type: [String],
        default: []
    },
    investmentsPageDevImage: {
        type: String,
        default: ''
    },
    investmentsPageDevBtnText: {
        type: String,
        default: ''
    },
    investmentsPageAppreciationTitle: {
        type: String,
        default: ''
    },
    investmentsPageAppreciationNote: {
        type: String,
        default: ''
    },
    investmentsPageAppreciationYears: {
        type: [{
            year: String,
            growth: String,
            percentage: Number
        }],
        default: []
    },
    investmentsPageProcessTitle: {
        type: String,
        default: ''
    },
    investmentsPageProcessBtnText: {
        type: String,
        default: ''
    },
    investmentsPageProcessSteps: {
        type: [{
            step: String,
            title: String
        }],
        default: []
    },

    // Contact Page Content
    contactPageHeroTitle: {
        type: String,
        default: ''
    },
    contactPageHeroSubtitle: {
        type: String,
        default: ''
    },
    contactPageOfficeHours: {
        type: String,
        default: ''
    },
    contactPageMapImage: {
        type: String,
        default: ''
    },
    contactPageMapLink: {
        type: String,
        default: ''
    },

    // Projects Page Content
    projectsPageHeroTitle: {
        type: String,
        default: ''
    },
    projectsPageHeroSubtitle: {
        type: String,
        default: ''
    },

    // Privacy Policy Page
    privacyPageTitle: {
        type: String,
        default: ''
    },
    privacyPageEffectiveDate: {
        type: String,
        default: ''
    },
    privacyPageContent: {
        type: String,
        default: ''
    },

    // Terms of Service Page
    termsPageTitle: {
        type: String,
        default: ''
    },
    termsPageEffectiveDate: {
        type: String,
        default: ''
    },
    termsPageContent: {
        type: String,
        default: ''
    },
    loginBackground: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSetting', websiteSettingSchema);
