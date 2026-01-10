const OTP = require('../models/OTP');
const { sendOTP } = require('../services/emailService');
const crypto = require('crypto');

/**
 * Generate a random OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email
 */
exports.sendOTP = async (req, res) => {
  try {
    const { email, type = 'signin' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Delete previous OTPs for this email
    await OTP.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    const otpRecord = new OTP({
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await otpRecord.save();

    // Send OTP via email
    await sendOTP(email, otp, type);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      data: {
        email,
        expiryTime: '10 minutes',
      },
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

/**
 * Verify OTP
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, type = 'signin' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type,
      isVerified: false,
    });

    if (!otpRecord) {
      // Increment attempts
      const failedOTP = await OTP.findOne({ email, type });
      if (failedOTP) {
        failedOTP.attempts += 1;
        if (failedOTP.attempts >= 5) {
          await OTP.deleteOne({ _id: failedOTP._id });
          return res.status(429).json({
            success: false,
            message: 'Too many failed attempts. Please request a new OTP',
          });
        }
        await failedOTP.save();
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one',
      });
    }

    // Mark OTP as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    // Generate a verification token (can be used in subsequent requests)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        email,
        verified: true,
        verificationToken,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

/**
 * Resend OTP
 */
exports.resendOTP = async (req, res) => {
  try {
    const { email, type = 'signin' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Delete previous OTPs for this email
    await OTP.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    const otpRecord = new OTP({
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await otpRecord.save();

    // Send OTP via email
    await sendOTP(email, otp, type);

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully to your email',
      data: {
        email,
        expiryTime: '10 minutes',
      },
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend OTP',
    });
  }
};
