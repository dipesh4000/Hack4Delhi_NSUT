const express = require('express');
const router = express.Router();
const Waterlogging = require('../models/Waterlogging');
const { CitizenUser } = require('../models/User');
const CreditRequest = require('../models/CreditRequest');
const WardCredits = require('../models/WardCredits');
const pipeline = require('../services/waterloggingPipeline');


const upload = require('../middleware/upload');


// GET current waterlogging status
router.get('/status', async (req, res) => {
    try {
        const reports = await Waterlogging.find().sort({ timestamp: -1 }).limit(50);
        const activeCount = await Waterlogging.countDocuments({ status: 'Active' });
        const resolvedCount = await Waterlogging.countDocuments({ status: 'Resolved' });
        const sensors = await pipeline.getSensorData();
        const alerts = await pipeline.getEmergencyAlerts();

        res.json({
            success: true,
            reports,
            sensors,
            alerts,
            summary: {
                active: activeCount,
                resolved: resolvedCount,
                criticalHotspots: sensors.filter(s => s.level > 80).length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET Climate Intelligence (Weather + AQI)
router.get('/climate', async (req, res) => {
    try {
        const climate = await pipeline.getClimateIntelligence();
        res.json({ success: true, climate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// POST a new waterlogging report
router.post('/report', async (req, res) => {
    const { clerkId, wardId, wardName, severity, location, coordinates, photoUrl } = req.body;

    
    if (!wardId || !severity || !location) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const verification = await pipeline.verifyReport({ location, wardName: wardName || `Ward ${wardId}` });
        const estimatedDepth = pipeline.estimateDepth(severity, verification.sensorLevel || 50);
        
        // Jal-Netra AI Analysis (Simulated if photoUrl exists)
        let jalNetra = null;
        if (photoUrl) {
            jalNetra = await pipeline.analyzePhoto(photoUrl, location);
            // Ensure photoUrl is preserved even if analyzePhoto didn't return it for some reason
            if (jalNetra && !jalNetra.photoUrl) {
                jalNetra.photoUrl = photoUrl;
            }
        }



        console.log("Saving new report with jalNetra:", JSON.stringify(jalNetra, null, 2));

        const newReport = new Waterlogging({
            wardId,
            wardName: wardName || `Ward ${wardId}`,
            severity: (jalNetra && jalNetra.severity) ? jalNetra.severity : severity, // AI can override severity if detected
            location,
            coordinates,
            timestamp: new Date(),
            status: "Active",
            verification,
            estimatedDepth,
            jalNetra,
            photoUrl: photoUrl // Save at top level as well for robustness
        });


        await newReport.save();
        console.log("Report saved successfully:", newReport._id);


        // Award Jal-Mitra Credits if verified (AI verified gives more)
        let creditsAwarded = 0;
        const isAIVerified = jalNetra && jalNetra.aiVerified && jalNetra.isWaterDetected;
        
        if (verification.verified || isAIVerified) {
            creditsAwarded = isAIVerified ? 100 : 50; 
            
            // Persistent Credits Update in MongoDB
            if (clerkId) {
                try {
                    // 1. Update User Total
                    await CitizenUser.findOneAndUpdate(
                        { clerkId },
                        { $inc: { totalCredits: creditsAwarded } },
                        { upsert: true }
                    );

                    // 2. Log as CreditRequest (for Recent Activity)
                    const logEntry = new CreditRequest({
                        userId: clerkId,
                        activity: isAIVerified ? 'Jal-Netra AI Verification' : 'Waterlogging Report Verified',
                        credits: creditsAwarded,
                        status: 'approved',
                        proofImage: photoUrl || '/static/waterlogging.png',
                        wardNumber: wardId,
                        processedAt: new Date(),
                        approvedBy: 'AI Agent'
                    });
                    await logEntry.save();

                    // 3. Update Ward Credits (Leaderboard)
                    await WardCredits.findOneAndUpdate(
                        { wardNumber: wardId },
                        { 
                            $inc: { totalCredits: creditsAwarded },
                            $setOnInsert: { wardName: wardName || `Ward ${wardId}` }
                        },
                        { upsert: true }
                    );

                } catch (creditError) {
                    console.error("Error updating persistent credits:", creditError);
                }
            }

        }



        res.status(201).json({ 
            success: true, 
            report: newReport,
            creditsAwarded,
            message: jalNetra ? `Jal-Netra AI analyzed your photo! You earned ${creditsAwarded} credits.` : 
                     verification.verified ? `Report verified! You earned ${creditsAwarded} Jal-Mitra credits.` : 
                     "Report submitted for verification."
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET smart navigation routes (Green-Route)
router.get('/navigation', async (req, res) => {
    const { start, end } = req.query;
    try {
        const routes = await pipeline.getSmartRoute(start, end);
        res.json({ success: true, routes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});



// GET drainage health data and predictive risk
router.get('/drainage', async (req, res) => {
    try {
        const externalData = await pipeline.getExternalData();
        const weatherRisk = await pipeline.getRainfallRisk();

        res.json({
            success: true,
            data: externalData,
            prediction: weatherRisk
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE a waterlogging report
router.delete('/:id', async (req, res) => {
    try {
        const report = await Waterlogging.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        res.json({ success: true, message: "Report deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload endpoint
router.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Delhi Police Data endpoint
router.get('/delhi-police', async (req, res) => {
  try {
    const data = await pipeline.fetchDelhiPoliceData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;


