const mongoose = require('mongoose');

const whatsappContactSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    countryCode: {
        type: String,
        trim: true
    },
    groupName: {
        type: String,
        required: true,
        trim: true
    },
    collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Ensure indices for faster search/dedup
whatsappContactSchema.index({ phoneNumber: 1 });
whatsappContactSchema.index({ collectedBy: 1 });

module.exports = mongoose.model('WhatsAppContact', whatsappContactSchema);
