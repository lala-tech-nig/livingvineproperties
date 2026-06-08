const mongoose = require('mongoose');

const investmentProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    durationInMonths: {
        type: Number,
        required: true
    },
    roiPercent: {
        type: Number, // e.g. 24 for 24%
        required: true
    },
    description: {
        type: String,
        required: true
    },
    principalOptions: {
        type: [String], // e.g. ['rollover_all', 'withdraw_roi', 'liquidate_all']
        default: ['rollover_all', 'withdraw_roi', 'liquidate_all']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('InvestmentProduct', investmentProductSchema);
