const WebsiteHero = require('../models/WebsiteHero');
const WebsiteService = require('../models/WebsiteService');
const WebsiteProject = require('../models/WebsiteProject');
const WebsiteSetting = require('../models/WebsiteSetting');
const WebsiteInquiry = require('../models/WebsiteInquiry');

// --- Public Endpoints ---

// Get all Hero Slides
exports.getHeroSlides = async (req, res, next) => {
    try {
        const slides = await WebsiteHero.find().sort({ createdAt: 1 });
        res.json(slides);
    } catch (error) {
        next(error);
    }
};

// Get all Services
exports.getServices = async (req, res, next) => {
    try {
        const services = await WebsiteService.find().sort({ createdAt: 1 });
        res.json(services);
    } catch (error) {
        next(error);
    }
};

// Get all Projects
exports.getProjects = async (req, res, next) => {
    try {
        const projects = await WebsiteProject.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        next(error);
    }
};

// Get global Website Settings
exports.getSettings = async (req, res, next) => {
    try {
        let setting = await WebsiteSetting.findOne();
        if (!setting) {
            // Create default settings if not exists
            setting = await WebsiteSetting.create({});
        }
        res.json(setting);
    } catch (error) {
        next(error);
    }
};

// Submit a new contact inquiry
exports.submitInquiry = async (req, res, next) => {
    try {
        const { name, email, phone, interest, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }

        const inquiry = await WebsiteInquiry.create({
            name,
            email,
            phone,
            interest,
            message
        });

        res.status(201).json({ message: 'Inquiry submitted successfully!', inquiry });
    } catch (error) {
        next(error);
    }
};

// --- Protected Manager Endpoints ---

// Add a Hero slide
exports.addHeroSlide = async (req, res, next) => {
    try {
        const { title, subtitle, image } = req.body;
        if (!title || !subtitle || !image) {
            return res.status(400).json({ message: 'Title, subtitle, and image are required' });
        }
        const slide = await WebsiteHero.create({ title, subtitle, image });
        res.status(201).json(slide);
    } catch (error) {
        next(error);
    }
};

// Update a Hero slide
exports.updateHeroSlide = async (req, res, next) => {
    try {
        const { title, subtitle, image } = req.body;
        const slide = await WebsiteHero.findByIdAndUpdate(
            req.params.id,
            { title, subtitle, image },
            { new: true, runValidators: true }
        );
        if (!slide) return res.status(404).json({ message: 'Slide not found' });
        res.json(slide);
    } catch (error) {
        next(error);
    }
};

// Delete a Hero slide
exports.deleteHeroSlide = async (req, res, next) => {
    try {
        const slide = await WebsiteHero.findByIdAndDelete(req.params.id);
        if (!slide) return res.status(404).json({ message: 'Slide not found' });
        res.json({ message: 'Slide deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Add a new service listing
exports.addService = async (req, res, next) => {
    try {
        const { title, description, icon, href } = req.body;
        if (!title || !description || !icon) {
            return res.status(400).json({ message: 'Title, description, and icon name are required' });
        }
        const service = await WebsiteService.create({ title, description, icon, href });
        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
};

// Update a service listing
exports.updateService = async (req, res, next) => {
    try {
        const { title, description, icon, href } = req.body;
        const service = await WebsiteService.findByIdAndUpdate(
            req.params.id,
            { title, description, icon, href },
            { new: true, runValidators: true }
        );
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (error) {
        next(error);
    }
};

// Delete a service listing
exports.deleteService = async (req, res, next) => {
    try {
        const service = await WebsiteService.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Add a new project
exports.addProject = async (req, res, next) => {
    try {
        const { title, location, status, image, category, description } = req.body;
        if (!title || !location || !image) {
            return res.status(400).json({ message: 'Title, location, and image URL are required' });
        }
        const project = await WebsiteProject.create({ title, location, status, image, category, description });
        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
};

// Update a project
exports.updateProject = async (req, res, next) => {
    try {
        const { title, location, status, image, category, description } = req.body;
        const project = await WebsiteProject.findByIdAndUpdate(
            req.params.id,
            { title, location, status, image, category, description },
            { new: true, runValidators: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        next(error);
    }
};

// Delete a project
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await WebsiteProject.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Update website settings
exports.updateSettings = async (req, res, next) => {
    try {
        const { address, phone, email, whatsapp, facebook, twitter, instagram, linkedin, marqueeTitle, marqueeTagline, marqueeEmail, marqueePhone } = req.body;
        let setting = await WebsiteSetting.findOne();
        
        if (setting) {
            setting = await WebsiteSetting.findByIdAndUpdate(
                setting._id,
                { address, phone, email, whatsapp, facebook, twitter, instagram, linkedin, marqueeTitle, marqueeTagline, marqueeEmail, marqueePhone },
                { new: true, runValidators: true }
            );
        } else {
            setting = await WebsiteSetting.create({
                address, phone, email, whatsapp, facebook, twitter, instagram, linkedin, marqueeTitle, marqueeTagline, marqueeEmail, marqueePhone
            });
        }
        res.json(setting);
    } catch (error) {
        next(error);
    }
};

// Get all contact inquiries
exports.getInquiries = async (req, res, next) => {
    try {
        const inquiries = await WebsiteInquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        next(error);
    }
};

// Update an inquiry status (e.g., mark as read/archived)
exports.updateInquiryStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['new', 'read', 'archived'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const inquiry = await WebsiteInquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
        res.json(inquiry);
    } catch (error) {
        next(error);
    }
};
