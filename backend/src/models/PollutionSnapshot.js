const mongoose = require('mongoose');

const pollutionSnapshotSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    wardId: { type: String, required: true },
    wardName: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    aqi: { type: Number, required: true },
    pollutants: {
        pm25: Number,
        pm10: Number,
        no2: Number
    },
    status: { type: String, enum: ['Good', 'Moderate', 'Poor', 'Severe'], required: true },
    sourceStation: String,
    isReliable: { type: Boolean, default: true }
});

module.exports = mongoose.model('PollutionSnapshot', pollutionSnapshotSchema);
