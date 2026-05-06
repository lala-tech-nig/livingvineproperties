const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    month: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    baseSalary: {
        type: Number,
        required: true,
    },
    bonuses: {
        type: Number,
        default: 0,
    },
    deductions: {
        type: Number,
        default: 0,
    },
    netPay: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending',
    },
    paymentDate: {
        type: Date,
    },
    notes: String
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
