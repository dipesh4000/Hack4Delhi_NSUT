const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const dashboardController = require('./controllers/dashboardController');
const wardController = require('./controllers/wardController');
const testController = require('./controllers/testController');
const otpRoutes = require('./routes/otpRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const pollutionRoutes = require('./routes/pollutionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const alertsRoutes = require('./routes/alerts');
const creditsRoutes = require('./routes/credits');
const waterloggingRoutes = require('./routes/waterlogging');
const connectDB = require('./config/database');
const DataSchedulerService = require('./services/dataSchedulerService');

// Connect to Database
connectDB();

// Initialize Data Scheduler
const dataScheduler = new DataSchedulerService();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
// Test endpoints
app.get('/api/test', testController.testConnection);
app.get('/api/wards', testController.getBasicWards);
app.get('/api/wards/:wardId', testController.getBasicWard);

// 1. Authority Dashboard Data (Aggregated)
app.get('/api/pollution/dashboard', dashboardController.getDashboardData);

// 3. OTP Routes
app.use('/api/otp', otpRoutes);

// 4. User Routes
app.use('/api/users', userRoutes);

// 5. Auth Routes
app.use('/api/auth', authRoutes);

// 6. Complaint Routes
app.use('/api/complaints', complaintRoutes);

// 7. Enhanced Pollution Routes
app.use('/api/pollution', pollutionRoutes);

// 8. AI Agent Routes
app.use('/api/ai', aiRoutes);

// 9. Email Alerts Routes
app.use('/api/alerts', alertsRoutes);

// 10. Pollution Credits Routes
app.use('/api/credits', creditsRoutes);

// 11. Waterlogging Routes
app.use('/api/waterlogging', waterloggingRoutes);

// Health Check
app.get('/health', (req, res) => res.send('OK'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something broke!' });
});

// Start Server
if (require.main === module) {
    app.listen(config.PORT, () => {
        console.log(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
        
        // Start the data scheduler in production
        if (config.NODE_ENV === 'production') {
            console.log('Starting data scheduler...');
            dataScheduler.start();
        } else {
            console.log('Data scheduler not started in development mode. Use /api/pollution/update to manually update data.');
        }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully...');
        dataScheduler.stop();
        process.exit(0);
    });
    
    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully...');
        dataScheduler.stop();
        process.exit(0);
    });
}

module.exports = app;
