const mongoose = require('mongoose');

const visitorLogSchema = new mongoose.Schema({
    ip: {
        type: String,
        default: 'Unknown'
    },
    city: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: 'Unknown Location'
    },
    userAgent: {
        type: String,
        default: 'Unknown'
    },
    page: {
        type: String,
        default: '/'
    }
}, { timestamps: true });

module.exports = mongoose.model('VisitorLog', visitorLogSchema);
