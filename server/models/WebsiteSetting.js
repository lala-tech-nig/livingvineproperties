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
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSetting', websiteSettingSchema);
