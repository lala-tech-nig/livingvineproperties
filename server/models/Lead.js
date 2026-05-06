const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true, // e.g., Website, Referral, Social Media
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'lost', 'converted'],
        default: 'new',
    },
    notes: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
