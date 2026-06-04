const mongoose = require('mongoose');

const websiteInquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    interest: {
        type: String,
        default: 'General Inquiry',
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['new', 'read', 'archived'],
        default: 'new',
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteInquiry', websiteInquirySchema);
