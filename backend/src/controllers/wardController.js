const ingestionService = require('../services/dataIngestionService');
const pollutionService = require('../services/pollutionService');

exports.getWards = async (req, res) => {
    try {
        const wards = await ingestionService.loadWardData();
        res.json({ success: true, data: wards }); // Basic list
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWardDetails = async (req, res) => {
    try {
        const wardId = req.params.wardId;
        const ward = await ingestionService.getWardById(wardId);

        if (!ward) {
            return res.status(404).json({ success: false, message: 'Ward not found' });
        }

        const pollution = await pollutionService.getPollutionForWard(wardId);

        res.json({
            success: true,
            data: {
                ...ward,
                pollution: pollution || { aqi: 0, pm25: 0, status: 'Unknown', updatedAt: new Date() }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
