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

module.exports = mongoose.model('Survey', surveySchema);
