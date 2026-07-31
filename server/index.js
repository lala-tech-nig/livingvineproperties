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

// Strictly Allowed Origins Configuration
const allowedOrigins = [
    'https://livingvinepropertiesinvestment.com',
    'https://www.livingvinepropertiesinvestment.com',
    'http://livingvinepropertiesinvestment.com',
    'http://www.livingvinepropertiesinvestment.com',
    'https://livingvineproperties.com.ng',
    'https://www.livingvineproperties.com.ng',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
];

const isAllowedOrigin = (origin) => {
    if (!origin) return true; // Allow non-browser requests (mobile apps, server-to-server, curl)
    if (allowedOrigins.includes(origin)) return true;
    // Match any subdomains of livingvinepropertiesinvestment.com or livingvineproperties.com.ng
    if (/^https?:\/\/([a-z0-9-]+\.)*livingvinepropertiesinvestment\.com$/i.test(origin)) return true;
    if (/^https?:\/\/([a-z0-9-]+\.)*livingvineproperties\.com\.ng$/i.test(origin)) return true;
    return false;
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Explicit header middleware for CORS enforcement and preflight handling
app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    if (isAllowedOrigin(requestOrigin)) {
        if (requestOrigin) {
            res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        }
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    }

    if (req.method === 'OPTIONS') {
        if (isAllowedOrigin(requestOrigin)) {
            return res.status(200).end();
        } else {
            return res.status(403).json({ message: 'CORS origin not allowed' });
        }
    }
    next();
});

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

