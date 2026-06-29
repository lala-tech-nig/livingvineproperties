const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
    investorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isAdminReply: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
