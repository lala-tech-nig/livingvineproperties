const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Lead = require('./models/Lead');
const Task = require('./models/Task');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for CRM Seeding...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Seed All Profile Roles
        const users = [
            { firstName: 'Super', surname: 'Admin', email: 'admin@livingvine.com', password: hashedPassword, phoneNumber: '08000000001', role: 'superadmin', isActive: true },
            { firstName: 'CEO', surname: 'User', email: 'ceo@livingvine.com', password: hashedPassword, phoneNumber: '08000000002', role: 'ceo', isActive: true },
            { firstName: 'Management', surname: 'One', email: 'manager@livingvine.com', password: hashedPassword, phoneNumber: '08000000003', role: 'management', isActive: true },
            { firstName: 'HR', surname: 'Manager', email: 'hr@livingvine.com', password: hashedPassword, phoneNumber: '08000000004', role: 'hr', isActive: true },
            { firstName: 'Sales', surname: 'Rep', email: 'sales@livingvine.com', password: hashedPassword, phoneNumber: '08000000005', role: 'sales', isActive: true },
            { firstName: 'Marketing', surname: 'Lead', email: 'marketing@livingvine.com', password: hashedPassword, phoneNumber: '08000000006', role: 'marketing', isActive: true },
            { firstName: 'Investor', surname: 'Demo', email: 'investor@livingvine.com', password: hashedPassword, phoneNumber: '08000000007', role: 'investor', isActive: true },
        ];

        await User.deleteMany({ email: { $in: users.map(u => u.email) } });
        const createdUsers = await User.insertMany(users);
        console.log('--- Seeded Profile Accounts (Password: password123) ---');
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));

        const salesUser = createdUsers.find(u => u.role === 'sales');

        // 2. Seed some dummy Customers
        const customers = [
            { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phoneNumber: '08123456789', dob: new Date('1990-05-15'), status: 'active', assignedTo: salesUser._id },
            { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phoneNumber: '08123456780', dob: new Date('1985-11-20'), status: 'active', assignedTo: salesUser._id },
        ];
        await Customer.deleteMany({});
        await Customer.insertMany(customers);
        console.log('Seeded Customers.');

        // 3. Seed some dummy Leads
        const leads = [
            { firstName: 'Mike', lastName: 'Johnson', email: 'mike@leads.com', source: 'Website', status: 'new', assignedTo: salesUser._id },
            { firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@leads.com', source: 'Instagram', status: 'contacted', assignedTo: salesUser._id },
        ];
        await Lead.deleteMany({});
        await Lead.insertMany(leads);
        console.log('Seeded Leads.');

        // 4. Seed some dummy Tasks
        const tasks = [
            { title: 'Call John Doe', description: 'Follow up on property inquiry', status: 'todo', priority: 'high', assignedTo: salesUser._id },
            { title: 'Email marketing reports', description: 'Weekly summary', status: 'in-progress', priority: 'medium', assignedTo: salesUser._id },
        ];
        await Task.deleteMany({});
        await Task.insertMany(tasks);
        console.log('Seeded Tasks.');

        console.log('\nSeeding Complete! You can now log in with any of the accounts above.');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
