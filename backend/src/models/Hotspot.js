const mongoose = require('mongoose');

const HotspotSchema = new mongoose.Schema({
    roadName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: String,
    frequency: String,
    source: {
        type: String,
        default: 'Delhi Police Traffic'
    },
    lastScraped: {
        type: Date,
        default: Date.now
    }
});

// Index for faster searching
HotspotSchema.index({ roadName: 'text', location: 'text' });

module.exports = mongoose.model('Hotspot', HotspotSchema);
