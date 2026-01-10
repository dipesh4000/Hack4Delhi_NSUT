const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Complaint = require('../models/Complaint');
const config = require('../config/env');

const router = express.Router();

// Configure Cloudinary with env variables
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Submit complaint
router.post('/submit', upload.single('image'), async (req, res) => {
  try {
    const { userId, userName, description, latitude, longitude, address } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'complaints' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Create complaint
    const complaint = new Complaint({
      userId,
      userName,
      description,
      imageUrl: uploadResult.secure_url,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address
      }
    });

    await complaint.save();

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaintId: complaint._id
    });
  } catch (error) {
    console.error('Complaint submission error:', error);
    
    // Better error message
    let errorMessage = 'Failed to submit complaint';
    if (error.message && error.message.includes('api_key')) {
      errorMessage = 'Cloudinary API configuration error. Please check server setup.';
    }
    
    res.status(500).json({ message: errorMessage });
  }
});

module.exports = router;