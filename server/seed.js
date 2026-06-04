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

        // 5. Seed Website Hero Carousel
        const websiteHeroes = [
            {
                title: "Build Wealth With Living Vine",
                subtitle: "Your trusted partner for secure land ownership and high-yield property development in Nigeria.",
                image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"
            },
            {
                title: "Luxury Defined by Nature",
                subtitle: "Experience serenity in our eco-friendly estates located in prime Lagos neighborhoods.",
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop"
            },
            {
                title: "Invest in Solid Foundations",
                subtitle: "From land banking to commercial structures, we build assets that stand the test of time.",
                image: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?q=80&w=2669&auto=format&fit=crop"
            }
        ];
        await WebsiteHero.deleteMany({});
        await WebsiteHero.insertMany(websiteHeroes);
        console.log('Seeded Website Heroes.');

        // 6. Seed Website Services
        const websiteServices = [
            {
                title: "Land Banking",
                description: "Secure high-value land assets in rapidly developing areas for maximum capital appreciation.",
                icon: "LandPlot",
                href: "/investments#land-banking"
            },
            {
                title: "Property Development",
                description: "Partner with us in developing premium residential and commercial structures.",
                icon: "Building2",
                href: "/investments#development"
            },
            {
                title: "Real Estate Advisory",
                description: "Expert guidance for navigating the Nigerian real estate market with confidence.",
                icon: "Briefcase",
                href: "/investments#advisory"
            },
            {
                title: "Digital Investment",
                description: "Invest in fractional real estate ownership through our upcoming digital platform.",
                icon: "Smartphone",
                href: "/investments#digital"
            }
        ];
        await WebsiteService.deleteMany({});
        await WebsiteService.insertMany(websiteServices);
        console.log('Seeded Website Services.');

        // 7. Seed Website Projects
        const websiteProjects = [
            {
                title: "The Ambiance",
                location: "Lekki Phase 1, Lagos",
                status: "Sold Out",
                image: "https://images.unsplash.com/photo-1600596542815-e32870033baf?q=80&w=2674&auto=format&fit=crop",
                category: "Completed",
                description: "A masterpiece of modern architecture featuring 4-bedroom terrace duplexes with smart home integration."
            },
            {
                title: "Greenfield Estate",
                location: "Epe, Lagos",
                status: "Selling Fast",
                image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=2670&auto=format&fit=crop",
                category: "Ongoing",
                description: "Affordable land banking plots located in the heart of the new Lagos manufacturing hub."
            },
            {
                title: "Empire Heights",
                location: "Ikoyi, Lagos",
                status: "Coming Soon",
                image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2670&auto=format&fit=crop",
                category: "Future",
                description: "Ultra-luxury high-rise apartments overlooking the Lagos lagoon."
            },
            {
                title: "Vine Courts",
                location: "Sangotedo, Lagos",
                status: "Selling Fast",
                image: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?q=80&w=2670&auto=format&fit=crop",
                category: "Ongoing",
                description: "A serene residential community with paved roads, electricity, and recreational parks."
            }
        ];
        await WebsiteProject.deleteMany({});
        await WebsiteProject.insertMany(websiteProjects);
        console.log('Seeded Website Projects.');

        // 8. Seed Website Setting (Global)
        await WebsiteSetting.deleteMany({});
        await WebsiteSetting.create({
            address: "15, Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
            phone: "+234 800 123 4567",
            email: "invest@livingvineproperties.com",
            whatsapp: "https://wa.me/2348001234567",
            facebook: "#",
            twitter: "#",
            instagram: "#",
            linkedin: "#"
        });
        console.log('Seeded Website Settings.');

        // 9. Seed a dummy website contact inquiry
        await WebsiteInquiry.deleteMany({});
        await WebsiteInquiry.create({
            name: "Emeka Obi",
            email: "emeka@example.com",
            phone: "08033334444",
            interest: "Land Banking",
            message: "I am interested in land banking in Lekki. Can I get a callback?",
            status: "new"
        });
        console.log('Seeded Website Inquiry.');

        console.log('\nSeeding Complete! You can now log in with any of the accounts above.');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
