const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const wardRoutes = require('./routes/wardRoutes');
const aqiRoutes = require('./routes/aqiRoutes');
const sourceRoutes = require('./routes/sourceRoutes');
const alertRoutes = require('./routes/alertRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Health Check
app.get('/', (req, res) => {
    res.send('Ward Pollution Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
