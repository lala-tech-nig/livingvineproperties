const cron = require('node-cron');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { sendEmail, templates } = require('./emailService');

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
    console.log('Running daily CRM automated tasks...');
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    try {
        // 1. Customer Birthdays
        const birthdayCustomers = await Customer.find({
            $expr: {
                $and: [
                    { $eq: [{ $dayOfMonth: '$dob' }, day] },
                    { $eq: [{ $month: '$dob' }, month] }
                ]
            }
        });

        for (const customer of birthdayCustomers) {
            await sendEmail(
                customer.email,
                `Happy Birthday ${customer.firstName}!`,
                templates.birthday(customer.firstName)
            );
        }

        // 2. Customer Anniversaries (Years with company)
        const anniversaryCustomers = await Customer.find({
            $expr: {
                $and: [
                    { $eq: [{ $dayOfMonth: '$joiningDate' }, day] },
                    { $eq: [{ $month: '$joiningDate' }, month] },
                    { $ne: [{ $year: '$joiningDate' }, today.getFullYear()] } // Not joining today
                ]
            }
        });

        for (const customer of anniversaryCustomers) {
            const years = today.getFullYear() - customer.joiningDate.getFullYear();
            await sendEmail(
                customer.email,
                `Happy ${years} Year Anniversary!`,
                templates.anniversary(customer.firstName, years)
            );
        }

        // 3. Staff Birthdays
        const birthdayStaff = await User.find({
            $expr: {
                $and: [
                    { $eq: [{ $dayOfMonth: '$dob' }, day] },
                    { $eq: [{ $month: '$dob' }, month] }
                ]
            }
        });

        for (const staff of birthdayStaff) {
            // Internal notification or email
            await sendEmail(
                staff.email,
                `Happy Birthday ${staff.firstName}!`,
                templates.birthday(staff.firstName)
            );
        }

    } catch (error) {
        console.error('Error in cron jobs:', error);
    }
});

console.log('CRM Cron jobs initialized.');
