const express = require('express');
const router = express.Router();
const wardService = require('../services/wardService');

// Get all wards (basic info)
router.get('/', async (req, res) => {
    try {
        const wards = await wardService.getAllWards();
        res.json({ success: true, data: wards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get specific ward details
router.get('/:wardId', async (req, res) => {
    try {
        const ward = await wardService.getWardDetails(req.params.wardId);
        if (!ward) {
            return res.status(404).json({ success: false, message: 'Ward not found' });
        }
        res.json({ success: true, data: ward });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
