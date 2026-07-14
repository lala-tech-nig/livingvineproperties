require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB().then(() => {
    const seedLedger = require('./config/seedLedger');
    seedLedger();
});

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));


// Routes
const authRoutes = require('./routes/auth');
const investmentRoutes = require('./routes/investments');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const crmRoutes = require('./routes/crm');
const taskRoutes = require('./routes/tasks');
const hrRoutes = require('./routes/hr');
const websiteRoutes = require('./routes/website');
const investmentProductRoutes = require('./routes/investmentProducts');
const surveyRoutes = require('./routes/surveys');
const whatsappRoutes = require('./routes/whatsapp');
const notificationRoutes = require('./routes/notifications');
const financeRoutes = require('./routes/finance');
const supportRoutes = require('./routes/support');
const ledgerRoutes = require('./routes/ledger');

// Initialize Cron Jobs
require('./services/cronJobs');

app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/website', websiteRoutes);
app.use('/api/investment-products', investmentProductRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/ledger', ledgerRoutes);

// Health check / root response
app.get("/", (req, res) => {
    res.send("LIVING VINE PROPERTIES INVESTMENT LIMITED server is running successfully.");
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});


// Error Handler Middleware
const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

