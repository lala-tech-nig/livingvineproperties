const fs = require('fs');
const path = require('path');
const LedgerRecord = require('../models/LedgerRecord');

const seedLedger = async () => {
    try {
        const count = await LedgerRecord.countDocuments();
        if (count > 0) {
            console.log('Ledger collection already contains data.');
            return;
        }

        console.log('Seeding ledger records from migrated Excel data...');

        // 1. Insert opening brought forward balances from April 2026
        const openingBalances = [
            {
                date: new Date('2026-05-01T00:00:00'),
                voucherNo: 'OP/05/2026',
                particulars: 'Balance brought forward from April 2026 (FBN)',
                type: 'income',
                account: 'FBN',
                category: 'SALES',
                amount: 50000.00
            },
            {
                date: new Date('2026-05-01T00:00:00'),
                voucherNo: 'OP/05/2026',
                particulars: 'Balance brought forward from April 2026 (UBA)',
                type: 'income',
                account: 'UBA',
                category: 'SALES',
                amount: 5666.00
            },
            {
                date: new Date('2026-05-01T00:00:00'),
                voucherNo: 'OP/05/2026',
                particulars: 'Balance brought forward from April 2026 (GTBANK)',
                type: 'income',
                account: 'GTBANK',
                category: 'SALES',
                amount: 1477.75
            },
            {
                date: new Date('2026-05-01T00:00:00'),
                voucherNo: 'OP/05/2026',
                particulars: 'Balance brought forward from April 2026 (CASH deficit)',
                type: 'expenditure',
                account: 'CASH',
                category: 'OFFICE MAINT.',
                amount: 2200.00 // represent -2200 as an expenditure/debit
            }
        ];

        await LedgerRecord.insertMany(openingBalances);
        console.log('Opening balances seeded.');

        // 2. Load migrated excel transactions
        const importPath = path.join(__dirname, '../data/ledger_import.json');
        if (fs.existsSync(importPath)) {
            const fileData = fs.readFileSync(importPath, 'utf8');
            const transactions = JSON.parse(fileData);

            const dbTransactions = transactions.map(tx => ({
                date: new Date(tx.date),
                voucherNo: tx.voucherNo,
                particulars: tx.particulars,
                type: tx.type,
                account: tx.account,
                category: tx.category,
                amount: tx.amount
            }));

            await LedgerRecord.insertMany(dbTransactions);
            console.log(`Successfully migrated ${dbTransactions.length} transaction entries from Excel sheet.`);
        } else {
            console.log('No ledger_import.json file found to import transactions.');
        }

    } catch (err) {
        console.error('Error seeding ledger:', err);
    }
};

module.exports = seedLedger;
