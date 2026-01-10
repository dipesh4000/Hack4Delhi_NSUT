const nodemailer = require('nodemailer');
const config = require('../config/env');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service not configured properly:', error.message);
  } else {
    console.log('Email service configured and ready to send');
  }
});

/**
 * Send OTP via email
 * @param {string} email - recipient email
 * @param {string} otp - one-time password
 * @param {string} type - type of OTP (signup, signin, reset-password)
 */
const sendOTP = async (email, otp, type = 'signin') => {
  try {
    const subject =
      type === 'signup'
        ? 'WardAir - Verify Your Email (OTP)'
        : type === 'reset-password'
        ? 'WardAir - Reset Password (OTP)'
        : 'WardAir - Login Verification (OTP)';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 30px; border-radius: 12px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">WardAir</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Ward-Level Air Quality Monitoring</p>
        </div>
        
        <div style="padding: 40px 20px; background-color: white; margin-top: 20px; border-radius: 8px;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">
            ${type === 'signup' ? 'Welcome to WardAir!' : type === 'reset-password' ? 'Reset Your Password' : 'Verify Your Login'}
          </h2>
          
          <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 20px 0;">
            ${
              type === 'signup'
                ? 'Thank you for signing up! To complete your registration, please verify your email using the OTP below.'
                : type === 'reset-password'
                ? 'We received a request to reset your password. Use the OTP below to proceed.'
                : 'To verify your login, please use the OTP below.'
            }
          </p>
          
          <div style="background-color: #f1f5f9; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0; border: 2px dashed #cbd5e1;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
            <p style="font-size: 48px; font-weight: bold; color: #0ea5e9; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0;">Valid for 10 minutes</p>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
            <strong style="color: #1e293b;">Do not share this OTP with anyone.</strong> Our team will never ask you for your OTP.
          </p>
          
          <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              If you didn't request this OTP, you can safely ignore this email.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0 0;">
              Need help? <a href="mailto:support@wardair.com" style="color: #0ea5e9; text-decoration: none;">Contact our support team</a>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">© 2026 WardAir. All rights reserved.</p>
          <p style="margin: 10px 0 0 0;">This is an automated email. Please do not reply to this address.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send welcome email
 * @param {string} email - recipient email
 * @param {string} name - user name
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 30px; border-radius: 12px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">WardAir</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Ward-Level Air Quality Monitoring</p>
        </div>
        
        <div style="padding: 40px 20px; background-color: white; margin-top: 20px; border-radius: 8px;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">
            Welcome to WardAir, ${name}! 🎉
          </h2>
          
          <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 20px 0;">
            Your account has been successfully created. You can now access WardAir to monitor air quality in your ward and make informed decisions about your health and the environment.
          </p>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="color: #047857; font-weight: 600; margin: 0;">What you can do now:</p>
            <ul style="color: #065f46; margin: 10px 0 0 0; padding-left: 20px;">
              <li>Check real-time air quality data for your ward</li>
              <li>View pollution trends and historical data</li>
              <li>Receive alerts for poor air quality days</li>
              <li>Access health recommendations</li>
            </ul>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center; margin: 30px 0;">
            <a href="https://wardair.com/citizen/wards" style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Start Monitoring Now
            </a>
          </p>
          
          <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Questions? Check out our <a href="https://wardair.com/help" style="color: #0ea5e9; text-decoration: none;">FAQ</a> or <a href="https://wardair.com/contact" style="color: #0ea5e9; text-decoration: none;">contact support</a>.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">© 2026 WardAir. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to WardAir!',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

module.exports = {
  sendOTP,
  sendWelcomeEmail,
  transporter,
};
