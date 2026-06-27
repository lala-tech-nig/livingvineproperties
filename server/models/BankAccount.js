const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type:        { type: String, enum: ['credit', 'debit'], required: true },
    amount:      { type: Number, required: true },
    description: { type: String, required: true },
    reference:   { type: String }, // investment ID or manual ref
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date:        { type: Date, default: Date.now }
}, { _id: true });

const bankAccountSchema = new mongoose.Schema({
    bankName:      { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName:   { type: String, required: true },
    balance:       { type: Number, default: 0 },
    isActive:      { type: Boolean, default: true },
    transactions:  [transactionSchema],
    addedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
