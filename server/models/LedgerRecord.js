const mongoose = require('mongoose');

const ledgerRecordSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    voucherNo: { type: String, required: true },
    particulars: { type: String, required: true },
    type: { type: String, enum: ['income', 'expenditure'], required: true },
    account: { type: String, enum: ['FBN', 'UBA', 'GTBANK', 'CASH'], required: true },
    category: {
        type: String,
        enum: [
            'OFFICE MAINT.',
            'FUEL V&GEN',
            'PURCHASE',
            'PROPERTY EXP',
            'SALES',
            'AGENT COMM',
            'LEGAL FEES',
            'VEHICLE MAINT',
            'ADVERT',
            'INVESTMENT/LOAN',
            'INVESTMENT &ROI',
            'REFERRAL C&B',
            'ELECTRICITY',
            'PENCOM',
            'SALARY & ALL',
            'VAT',
            'WHT',
            'PAYEE',
            'INTERNET &CUG',
            'ASSET',
            'GEN. REPAIR',
            'RENT'
        ],
        required: true
    },
    amount: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('LedgerRecord', ledgerRecordSchema);
