const express = require('express');
const router = express.Router();

// In-memory storage (in production, use MongoDB)
const subscribers = new Map();

// Configure email transporter (optional - using Gmail as example)
let transporter = null;
try {
    const nodemailer = require('nodemailer');
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        // Verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.error('Email transporter error:', error);
            } else {
                console.log('Email service configured and ready to send');
            }
        });
    } else {
        console.warn('Email credentials missing in .env - email features will be disabled');
    }
} catch (error) {
    console.warn('Nodemailer not available - email features will be disabled:', error.message);
}

// Subscribe to alerts
router.post('/subscribe', async (req, res) => {
    try {
        const { email, wardNumber, wardName, aqiThreshold, frequency, alertTypes } = req.body;

        if (!email || !wardNumber) {
            return res.status(400).json({
                success: false,
                message: 'Email and ward number are required'
            });
        }

        // Store subscription
        const subscriptionKey = `${email}_${wardNumber}`;
        subscribers.set(subscriptionKey, {
            email,
            wardNumber,
            wardName,
            aqiThreshold: aqiThreshold || 200,
            frequency: frequency || 'immediate',
            alertTypes: alertTypes || ['aqi_high'],
            subscribedAt: new Date(),
            active: true
        });

        res.json({
            success: true,
            message: 'Successfully subscribed to alerts',
            subscription: subscribers.get(subscriptionKey)
        });

    } catch (error) {
        console.error('Error subscribing to alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe to alerts',
            error: error.message
        });
    }
});

// Unsubscribe from alerts
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email, wardNumber } = req.body;

        if (!email || !wardNumber) {
            return res.status(400).json({
                success: false,
                message: 'Email and ward number are required'
            });
        }

        const subscriptionKey = `${email}_${wardNumber}`;
        
        if (subscribers.has(subscriptionKey)) {
            subscribers.delete(subscriptionKey);
            res.json({
                success: true,
                message: 'Successfully unsubscribed from alerts'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

    } catch (error) {
        console.error('Error unsubscribing from alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe from alerts',
            error: error.message
        });
    }
});

// Send welcome email
router.post('/send-welcome', async (req, res) => {
    try {
        const { email, wardName } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Welcome to ${wardName} Air Quality Alerts`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Welcome to Air Quality Alerts!</h2>
                    <p>Thank you for subscribing to air quality alerts for <strong>${wardName}</strong>.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #1f2937; margin-top: 0;">What You'll Receive:</h3>
                        <ul style="color: #4b5563;">
                            <li>Real-time alerts when AQI exceeds your threshold</li>
                            <li>Health recommendations based on air quality</li>
                            <li>Pollution control measures by MCD</li>
                            <li>Weekly air quality summaries</li>
                        </ul>
                    </div>
                    
                    <p style="color: #6b7280;">Stay informed and breathe easier!</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #9ca3af; font-size: 12px;">
                        You're receiving this email because you subscribed to air quality alerts for ${wardName}.
                        <br>To unsubscribe, visit your dashboard settings.
                    </p>
                </div>
            `
        };

        if (!transporter) {
            return res.status(503).json({
                success: false,
                message: 'Email service not configured on server'
            });
        }

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Welcome email sent successfully'
        });

    } catch (error) {
        console.error('Error sending welcome email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send welcome email',
            error: error.message
        });
    }
});

// Send alert email
router.post('/send-alert', async (req, res) => {
    try {
        const { email, wardName, aqi, pollutants, recommendations } = req.body;

        const aqiColor = aqi > 300 ? '#991b1b' : aqi > 200 ? '#ef4444' : aqi > 100 ? '#f59e0b' : '#10b981';
        const aqiStatus = aqi > 300 ? 'Hazardous' : aqi > 200 ? 'Very Poor' : aqi > 100 ? 'Poor' : 'Moderate';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `🚨 Air Quality Alert: ${wardName} - AQI ${aqi}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: ${aqiColor}; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h2 style="margin: 0;">Air Quality Alert</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">${wardName}</p>
                    </div>
                    
                    <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="font-size: 48px; font-weight: bold; color: ${aqiColor};">${aqi}</div>
                            <div style="font-size: 18px; color: #6b7280; font-weight: 600;">${aqiStatus}</div>
                        </div>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                            <h3 style="color: #1f2937; margin-top: 0;">Current Pollutant Levels</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                ${pollutants ? pollutants.map(p => `
                                    <tr>
                                        <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">${p.name}</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right;">${p.value} ${p.unit}</td>
                                    </tr>
                                `).join('') : ''}
                            </table>
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b;">
                            <h3 style="color: #92400e; margin-top: 0;">⚠️ Health Recommendations</h3>
                            <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                                ${recommendations ? recommendations.map(r => `<li>${r}</li>`).join('') : ''}
                            </ul>
                        </div>
                    </div>
                    
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                        Alert sent at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                    </p>
                </div>
            `
        };

        if (!transporter) {
            return res.status(503).json({
                success: false,
                message: 'Email service not configured on server'
            });
        }

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Alert email sent successfully'
        });

    } catch (error) {
        console.error('Error sending alert email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send alert email',
            error: error.message
        });
    }
});

// Get all subscribers (for admin/testing)
router.get('/subscribers', (req, res) => {
    const allSubscribers = Array.from(subscribers.values());
    res.json({
        success: true,
        count: allSubscribers.length,
        subscribers: allSubscribers
    });
});

module.exports = router;
