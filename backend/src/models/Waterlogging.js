const mongoose = require('mongoose');

const WaterloggingSchema = new mongoose.Schema({
    wardId: {
        type: String,
        required: true
    },
    wardName: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['Ankle Deep', 'Knee Deep', 'Waist Deep', 'Hazardous'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Resolved', 'In Progress'],
        default: 'Active'
    },
    reportedBy: {
        type: String,
        default: 'Citizen'
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    verification: {
        verified: { type: Boolean, default: false },
        confidence: Number,
        source: String,
        sensorLevel: Number
    },
    estimatedDepth: {
        cm: Number,
        confidence: Number
    },
    jalNetra: {
        aiVerified: { type: Boolean, default: false },
        isWaterDetected: { type: Boolean, default: false },
        photoUrl: String,
        tags: [String],
        confidence: Number,
        reason: String
    },
    photoUrl: String
});


module.exports = mongoose.model('Waterlogging', WaterloggingSchema);
