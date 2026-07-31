const mongoose = require('mongoose');

const investorLoginLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: 'Unknown Location'
    },
    ip: {
        type: String,
        default: 'Unknown'
    },
    userAgent: {
        type: String,
        default: 'Unknown'
    }
}, { timestamps: true });

module.exports = mongoose.model('InvestorLoginLog', investorLoginLogSchema);
