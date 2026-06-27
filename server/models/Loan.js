const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    totalPayable: {
        type: Number,
        required: true,
    },
    monthlyInstallment: {
        type: Number,
        required: true,
    },
    repaymentPlan: {
        type: String,
        required: true,
    },
    totalPaid: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'paid'],
        default: 'active',
    }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
