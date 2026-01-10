const express = require('express');
const router = express.Router();
const pollutionController = require('../controllers/pollutionController');

// Ward-specific routes
router.get('/ward/:wardNumber/analysis', pollutionController.getWardAnalysis);
router.get('/ward/:wardNumber/trends', pollutionController.getWardTrends);
router.get('/ward/:wardNumber/health', pollutionController.getHealthRecommendations);
router.get('/ward/:wardNumber/sources', pollutionController.getPollutionSources);

// General pollution data routes
router.get('/wards', pollutionController.getAllWards);
router.get('/hotspots', pollutionController.getHotspots);
router.get('/zones/summary', pollutionController.getZoneSummary);
router.get('/report/daily', pollutionController.getDailyReport);

// Comparative analysis
router.post('/compare', pollutionController.getComparativeAnalysis);

// System management routes
router.post('/update', pollutionController.triggerDataUpdate);
router.get('/health', pollutionController.getSystemHealth);

module.exports = router;