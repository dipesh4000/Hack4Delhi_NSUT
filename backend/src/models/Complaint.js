const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['air_quality', 'industrial', 'vehicular', 'construction', 'burning', 'other'],
    required: true,
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  imageUrl: {
    type: String,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  citizen: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    }
  },
  wardId: {
    type: String,
    required: false
  },
  wardName: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  assignedOfficer: {
    type: String,
    required: false
  },
  estimatedResolution: {
    type: Date,
    required: false
  },
  resolutionNotes: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);