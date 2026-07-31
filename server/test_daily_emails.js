require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const { sendDailyActivitiesReport } = require('./services/activityNotificationService');
const { sendDailyInvestorUpdates } = require('./services/investorDailyUpdateService');

async function testDailyEmails() {
    console.log('Connecting to MongoDB database...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/livingvine';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully!');

    console.log('\n--- 1. Testing Daily Activities Report Email ---');
    try {
        const actRes = await sendDailyActivitiesReport();
        console.log('Daily activities report result:', actRes);
    } catch (err) {
        console.error('Activities report error:', err.message);
    }

    console.log('\n--- 2. Testing Daily Investor Updates Emails ---');
    try {
        const invRes = await sendDailyInvestorUpdates();
        console.log('Daily investor updates result:', invRes);
    } catch (err) {
        console.error('Investor updates error:', err.message);
    }

    await mongoose.disconnect();
    console.log('\nTesting completed. Disconnected from database.');
}

testDailyEmails().catch(err => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
});
