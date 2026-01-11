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

// Helper function to auto-categorize complaint based on description
function autoCategorize(description) {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('burn') || lowerDesc.includes('fire') || lowerDesc.includes('smoke from garbage')) {
    return 'burning';
  } else if (lowerDesc.includes('factory') || lowerDesc.includes('industrial') || lowerDesc.includes('chemical')) {
    return 'industrial';
  } else if (lowerDesc.includes('vehicle') || lowerDesc.includes('traffic') || lowerDesc.includes('diesel') || lowerDesc.includes('car') || lowerDesc.includes('truck')) {
    return 'vehicular';
  } else if (lowerDesc.includes('construction') || lowerDesc.includes('dust') || lowerDesc.includes('building') || lowerDesc.includes('demolition')) {
    return 'construction';
  } else if (lowerDesc.includes('aqi') || lowerDesc.includes('air quality') || lowerDesc.includes('pollution level') || lowerDesc.includes('smog')) {
    return 'air_quality';
  }
  
  return 'other';
}

// Helper function to determine priority based on category and description
function determinePriority(category, description) {
  const lowerDesc = description.toLowerCase();
  const urgentKeywords = ['emergency', 'urgent', 'severe', 'critical', 'health', 'hospital', 'breathing'];
  
  // Check for urgent keywords
  const hasUrgentKeyword = urgentKeywords.some(keyword => lowerDesc.includes(keyword));
  
  if (hasUrgentKeyword) {
    return 'critical';
  }
  
  // Category-based priority
  if (category === 'burning' || category === 'industrial') {
    return 'high';
  } else if (category === 'vehicular' || category === 'construction') {
    return 'medium';
  }
  
  return 'low';
}

// Helper function to find ward from coordinates (simplified - can be enhanced with actual ward boundaries)
async function findWardFromCoordinates(lat, lng) {
  // This is a simplified implementation
  // In a real system, you would query a GIS database with ward boundaries
  // For now, we'll use a simple grid-based approach for Delhi
  
  // Delhi approximate bounds: 28.4°N to 28.9°N, 76.8°E to 77.4°E
  // 250 wards roughly distributed
  
  const latIndex = Math.floor((lat - 28.4) / 0.002);
  const lngIndex = Math.floor((lng - 76.8) / 0.0024);
  const wardNumber = ((latIndex * 25) + lngIndex) % 250 + 1;
  
  return {
    wardId: wardNumber.toString(),
    wardName: `Ward ${wardNumber}`
  };
}

// Submit complaint
router.post('/submit', upload.single('image'), async (req, res) => {
  try {
    const { userId, userName, description, latitude, longitude, address, category, phone, email } = req.body;

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

    // Auto-categorize if not provided
    const finalCategory = category || autoCategorize(description);
    
    // Determine priority
    const priority = determinePriority(finalCategory, description);
    
    // Find ward from coordinates
    const ward = await findWardFromCoordinates(parseFloat(latitude), parseFloat(longitude));

    // Create complaint
    const complaint = new Complaint({
      userId,
      userName,
      description,
      category: finalCategory,
      priority,
      imageUrl: uploadResult.secure_url,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address
      },
      citizen: {
        name: userName,
        phone: phone || '',
        email: email || ''
      },
      wardId: ward.wardId,
      wardName: ward.wardName
    });

    await complaint.save();

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaintId: complaint._id,
      complaint: {
        id: complaint._id,
        category: complaint.category,
        priority: complaint.priority,
        wardName: complaint.wardName,
        status: complaint.status
      }
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

// Get all complaints with filtering
router.get('/', async (req, res) => {
  try {
    const { status, priority, category, ward, search, limit = 100, skip = 0 } = req.query;
    
    let query = {};
    
    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (ward && ward !== 'all') {
      query.wardId = ward;
    }
    
    // Apply search
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { wardName: { $regex: search, $options: 'i' } },
        { 'citizen.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Complaint.countDocuments(query);
    
    res.json({
      complaints,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
});

// Get single complaint by ID
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.json(complaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ message: 'Failed to fetch complaint' });
  }
});

// Update complaint status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    
    const updateData = { status, updatedAt: Date.now() };
    
    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }
    
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Failed to update complaint status' });
  }
});

// Assign complaint to officer
router.patch('/:id/assign', async (req, res) => {
  try {
    const { assignedOfficer, estimatedResolution } = req.body;
    
    const updateData = { 
      assignedOfficer,
      updatedAt: Date.now()
    };
    
    if (estimatedResolution) {
      updateData.estimatedResolution = new Date(estimatedResolution);
    }
    
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.json({
      message: 'Complaint assigned successfully',
      complaint
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({ message: 'Failed to assign complaint' });
  }
});

module.exports = router;