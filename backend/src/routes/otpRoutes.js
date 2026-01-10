const express = require('express');
const otpController = require('../controllers/otpController');

const router = express.Router();

/**
 * Send OTP to email
 * POST /api/otp/send
 */
router.post('/send', otpController.sendOTP);

/**
 * Verify OTP
 * POST /api/otp/verify
 */
router.post('/verify', otpController.verifyOTP);

/**
 * Resend OTP
 * POST /api/otp/resend
 */
router.post('/resend', otpController.resendOTP);

module.exports = router;
