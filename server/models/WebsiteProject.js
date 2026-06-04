const mongoose = require('mongoose');

const websiteProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Selling Fast', 'Sold Out', 'Launching Soon', 'Coming Soon'],
        default: 'Selling Fast',
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Completed', 'Ongoing', 'Future'],
        default: 'Ongoing',
    },
    description: {
        type: String,
        default: '',
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteProject', websiteProjectSchema);
