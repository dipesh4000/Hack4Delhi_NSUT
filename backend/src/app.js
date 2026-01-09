const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const wardRoutes = require('./routes/wardRoutes');
const aqiRoutes = require('./routes/aqiRoutes');
const sourceRoutes = require('./routes/sourceRoutes');
const alertRoutes = require('./routes/alertRoutes');

const pollutionRoutes = require('./routes/pollutionRoutes');
const cron = require('node-cron');
const pollutionService = require('./services/pollutionService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/wards', wardRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/pollution', pollutionRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Ward Pollution Backend is running');
});

// Scheduler: Fetch pollution data every hour
cron.schedule('0 * * * *', () => {
    console.log('Running hourly pollution update...');
    pollutionService.updatePollutionData();
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Initial fetch on startup
    pollutionService.getLatestPollution();
});

module.exports = app;
