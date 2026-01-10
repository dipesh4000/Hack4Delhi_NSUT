require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    OPENAQ_API_URL: process.env.OPENAQ_API_URL || 'https://api.openaq.org/v3/locations',
    DATA_REFRESH_RATE: 10 * 60 * 1000, // 10 minutes
};
