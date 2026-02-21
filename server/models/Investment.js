const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: String,
    email: String,
    contactAddress: String,
    phoneNumber: String,
    amountToInvest: Number,
    durationInMonths: Number,
    principalActionAfterMaturity: String,
    nin: String,
    bvn: String,
    accountDetails: {
        bankName: String,
        accountNumber: String,
        accountName: String,
    },
    nextOfKin: {
        fullName: String,
        address: String,
        phoneNumber: String,
        relationship: String,
    },
    status: {
        type: String,
        enum: ['reviewing', 'approved', 'declined', 'retreated', 'liquidated', 'active'],
        default: 'reviewing'
    },
    ceoPaymentAccount: {
        bankName: String,
        accountNumber: String,
        accountName: String,
    },
    startDate: Date,
    expectedROI: Number,
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
