const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const dashboardController = require('./controllers/dashboardController');
const wardController = require('./controllers/wardController');
const otpRoutes = require('./routes/otpRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const connectDB = require('./config/database');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// 1. Authority Dashboard Data (Aggregated)
app.get('/api/pollution/dashboard', dashboardController.getDashboardData);

// 2. Citizen/Ward Data
app.get('/api/wards', wardController.getWards);
app.get('/api/wards/:wardId', wardController.getWardDetails);

// 3. OTP Routes
app.use('/api/otp', otpRoutes);

// 4. User Routes
app.use('/api/users', userRoutes);

// 5. Auth Routes
app.use('/api/auth', authRoutes);

// 6. Complaint Routes
app.use('/api/complaints', complaintRoutes);

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
    });
}

module.exports = app;
