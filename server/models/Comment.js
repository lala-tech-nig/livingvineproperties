const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    investmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Investment',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    role: {
        // to easily distinguish if comment is from investor, management, or ceo without populating 
        type: String,
        enum: ['investor', 'management', 'ceo']
    },
    isPrivate: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
