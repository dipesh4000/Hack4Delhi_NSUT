require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/wardair',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    OPENAQ_API_URL: process.env.OPENAQ_API_URL || 'https://api.openaq.org/v3/locations',
    DATA_REFRESH_RATE: 10 * 60 * 1000, // 10 minutes
    
    // WAQI Configuration
    WAQI_TOKEN: process.env.WAQI_TOKEN,
    
    // Email Configuration
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'gmail',
    
    // OTP Configuration
    OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '10'),
    
    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};
