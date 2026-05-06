const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
    },
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['lead', 'active', 'inactive'],
        default: 'lead',
    },
    address: {
        type: String,
    },
    lastEmailSent: {
        type: Date,
    },
    notes: [{
        text: String,
        date: { type: Date, default: Date.now },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
