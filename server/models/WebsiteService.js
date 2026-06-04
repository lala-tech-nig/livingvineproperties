const mongoose = require('mongoose');

const websiteServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true, // Stores Lucide icon name (e.g., 'LandPlot')
    },
    href: {
        type: String,
        default: '',
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteService', websiteServiceSchema);
