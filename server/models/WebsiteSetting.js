const mongoose = require('mongoose');

const websiteSettingSchema = new mongoose.Schema({
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
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSetting', websiteSettingSchema);
