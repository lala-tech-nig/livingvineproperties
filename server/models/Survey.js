const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    question: {
        type: String,
        default: 'To help us better serve you, tell us your experience using our app today.',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    responses: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        feedback: {
            type: String,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Targeting criteria — empty = show to all investors
const targetingSchema = {
    religions: [{ type: String }],   // e.g. ['muslim','christian']
    genders: [{ type: String }],     // e.g. ['male']
    states: [{ type: String }],      // e.g. ['Lagos','Abuja']
    ageMin: { type: Number, default: null },
    ageMax: { type: Number, default: null },
};

surveySchema.add({
    targeting: { type: Object, default: {} },
});

module.exports = mongoose.model('Survey', surveySchema);
