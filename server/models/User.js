const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['investor', 'sales', 'marketing', 'hr', 'management', 'ceo', 'superadmin'],
        default: 'investor',
    },
    profileImage: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    dob: {
        type: Date,
    },
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    basicSalary: {
        type: Number,
        default: 0,
    },
    age: {
        type: Number,
    },
    idNumber: {
        type: String,
    },
    bonuses: {
        type: Number,
        default: 0,
    },
    referredByEmail: {
        type: String,
        default: null,
    },
    accountOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: null,
    },
    religion: {
        type: String,
        enum: ['muslim', 'christian', 'other'],
        default: null,
    },
    state: {
        type: String,
        default: null,
    },
    nin: {
        type: String,
        default: null,
    },
    // Named celebration dates the company uses for anniversary reminders
    celebrationDates: [{
        label: { type: String, required: true },   // e.g. 'Birthday', 'Wedding Anniversary'
        date:  { type: Date,   required: true },
    }],
    address: {
        type: String,
        default: null,
    },
    occupation: {
        type: String,
        default: null,
    },
    bankName: {
        type: String,
        default: null,
    },
    bankCode: {
        type: String,
        default: null,
    },
    accountNumber: {
        type: String,
        default: null,
    },
    debitAccountNo: {
        type: String,
        default: '2045896422',
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
