const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

// General chatbot endpoint
router.post('/chat', aiController.chatWithAgent);

// Health advisory endpoint for citizens
router.post('/health-advisory', aiController.getHealthAdvisory);

// Government action endpoint for authorities
router.post('/govt-action', aiController.getGovtAction);

module.exports = router;