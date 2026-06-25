const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Lead = require('./models/Lead');
const Task = require('./models/Task');
const WebsiteHero = require('./models/WebsiteHero');
const WebsiteService = require('./models/WebsiteService');
const WebsiteProject = require('./models/WebsiteProject');
const WebsiteSetting = require('./models/WebsiteSetting');
const WebsiteInquiry = require('./models/WebsiteInquiry');

dotenv.config();

const initDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Clean Database Setup...');

        // 1. Wipe all existing collections to start completely blank
        console.log('Wiping all existing database collections...');
        await Promise.all([
            User.deleteMany({}),
            Customer.deleteMany({}),
            Lead.deleteMany({}),
            Task.deleteMany({}),
            WebsiteHero.deleteMany({}),
            WebsiteService.deleteMany({}),
            WebsiteProject.deleteMany({}),
            WebsiteSetting.deleteMany({}),
            WebsiteInquiry.deleteMany({})
        ]);
        console.log('All mock / seed collections successfully wiped!');

        // 2. Hash default operational passwords
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 3. Register primary operational user accounts (no mock/dummy stats)
        const baseUsers = [
            { firstName: 'Super', surname: 'Admin', email: 'admin@livingvine.com', password: hashedPassword, phoneNumber: '08000000001', role: 'superadmin', isActive: true },
            { firstName: 'CEO', surname: 'User', email: 'ceo@livingvine.com', password: hashedPassword, phoneNumber: '08000000002', role: 'ceo', isActive: true },
            { firstName: 'Management', surname: 'One', email: 'manager@livingvine.com', password: hashedPassword, phoneNumber: '08000000003', role: 'management', isActive: true },
            { firstName: 'HR', surname: 'Manager', email: 'hr@livingvine.com', password: hashedPassword, phoneNumber: '08000000004', role: 'hr', isActive: true },
            { firstName: 'Sales', surname: 'Rep', email: 'sales@livingvine.com', password: hashedPassword, phoneNumber: '08000000005', role: 'sales', isActive: true },
            { firstName: 'Marketing', surname: 'Lead', email: 'marketing@livingvine.com', password: hashedPassword, phoneNumber: '08000000006', role: 'marketing', isActive: true },
            { firstName: 'Investor', surname: 'Demo', email: 'investor@livingvine.com', password: hashedPassword, phoneNumber: '08000000007', role: 'investor', isActive: true },
        ];

        await User.insertMany(baseUsers);
        console.log('--- Initialized System Operational Accounts (Password: password123) ---');
        baseUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));

        console.log('\nDatabase setup complete. System is completely blank and ready for production configuration.');
        process.exit(0);
    } catch (error) {
        console.error('Error during database initialization:', error);
        process.exit(1);
    }
};

initDatabase();
