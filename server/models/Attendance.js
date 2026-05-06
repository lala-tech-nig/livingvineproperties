const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: () => new Date().setHours(0, 0, 0, 0),
    },
    checkIn: {
        type: Date,
        default: Date.now,
    },
    checkOut: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'on-leave'],
        default: 'present',
    },
    location: {
        type: String, // Optional: for remote check-ins
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
