require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// Error Handler Middleware
const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

