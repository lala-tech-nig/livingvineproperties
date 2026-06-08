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
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSetting', websiteSettingSchema);
