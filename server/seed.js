const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path if needed

dotenv.config();

const seedAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const admins = [
            {
                firstName: 'CEO',
                surname: 'Admin',
                email: 'ceo@livingvine.com',
                password: hashedPassword,
                phoneNumber: '08000000001',
                role: 'ceo',
                isActive: true,
            },
            {
                firstName: 'Manager',
                surname: 'One',
                email: 'management1@livingvine.com',
                password: hashedPassword,
                phoneNumber: '08000000002',
                role: 'management',
                isActive: true,
            },
            {
                firstName: 'Manager',
                surname: 'Two',
                email: 'management2@livingvine.com',
                password: hashedPassword,
                phoneNumber: '08000000003',
                role: 'management',
                isActive: true,
            }
        ];

        // Clear existing admins with these emails if they exist to prevent duplicates
        await User.deleteMany({ email: { $in: admins.map(a => a.email) } });

        await User.insertMany(admins);

        console.log('Seeded 3 Admin Accounts Successfully:');
        admins.forEach(a => console.log(`- ${a.email} (${a.role}) / pass: password123`));

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedAdmins();
