const express = require('express');
const router = express.Router();
const pollutionService = require('../services/pollutionService');

// GET /api/pollution/dashboard
// Returns latest pollution stats for all wards
router.get('/dashboard', async (req, res) => {
    try {
        const data = await pollutionService.getLatestPollution();
        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/pollution/refresh
// Force manual refresh of data
router.post('/refresh', async (req, res) => {
    try {
        const data = await pollutionService.updatePollutionData();
        res.json({ success: true, message: 'Data refreshed', count: data.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
