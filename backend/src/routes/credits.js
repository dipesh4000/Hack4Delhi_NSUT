const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { CitizenUser } = require('../models/User');
const CreditRequest = require('../models/CreditRequest');
const WardCredits = require('../models/WardCredits');

// Ensure uploads directory exists
const uploadDir = 'uploads/proofs/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Get user credits
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find user or return defaults
        const user = await CitizenUser.findOne({ clerkId: userId });
        
        // Get requests for this user
        const requests = await CreditRequest.find({ userId }).sort({ createdAt: -1 });
        
        const pendingRequests = requests.filter(r => r.status === 'pending');
        const approvedRequests = requests.filter(r => r.status === 'approved');

        res.json({
            success: true,
            credits: {
                totalCredits: user ? user.totalCredits : 0,
                rank: 0, // Rank calculation can be added later if needed
                pendingRequests,
                approvedRequests
            }
        });
    } catch (error) {
        console.error('Error fetching user credits:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch credits' });
    }
});

// Submit credit request (with proof)
router.post('/request', upload.single('proof'), async (req, res) => {
    try {
        const { userId, activity, wardNumber } = req.body;
        const proofFile = req.file;

        if (!userId || !activity || !proofFile) {
            return res.status(400).json({
                success: false,
                message: 'userId, activity, and proof image are required'
            });
        }

        const creditsMap = {
            public_transport: 5,
            carpool: 3,
            report: 10,
            tree: 50
        };

        const request = new CreditRequest({
            userId,
            activity,
            wardNumber,
            credits: creditsMap[activity] || 0,
            proofImage: `/uploads/proofs/${proofFile.filename}`,
            status: 'pending'
        });

        await request.save();

        res.json({
            success: true,
            message: 'Credit request submitted for approval',
            request
        });

    } catch (error) {
        console.error('Error submitting credit request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit request',
            error: error.message
        });
    }
});

// Get all pending requests (for authority)
router.get('/pending', async (req, res) => {
    try {
        const pending = await CreditRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json({
            success: true,
            requests: pending
        });
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending requests' });
    }
});

// Approve credit request
router.post('/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedBy } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid request ID format' });
        }

        const request = await CreditRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Request already processed' });
        }

        // Update request status
        request.status = 'approved';
        request.processedAt = new Date();
        request.approvedBy = approvedBy || 'Authority';
        await request.save();

        // Update user credits
        await CitizenUser.findOneAndUpdate(
            { clerkId: request.userId },
            { $inc: { totalCredits: request.credits } },
            { upsert: true, new: true }
        );

        // Update ward credits
        if (request.wardNumber) {
            await WardCredits.findOneAndUpdate(
                { wardNumber: request.wardNumber },
                { 
                    $inc: { totalCredits: request.credits },
                    $setOnInsert: { wardName: `Ward ${request.wardNumber}` } // Default name if not exists
                },
                { upsert: true }
            );
        }

        res.json({
            success: true,
            message: 'Request approved successfully',
            request
        });

    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ success: false, message: 'Failed to approve request' });
    }
});

// Reject credit request
router.post('/reject/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid request ID format' });
        }

        const request = await CreditRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        request.status = 'rejected';
        request.rejectionReason = reason;
        request.processedAt = new Date();
        await request.save();

        res.json({
            success: true,
            message: 'Request rejected',
            request
        });

    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ success: false, message: 'Failed to reject request' });
    }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        // Get all ward credits from DB
        const leaderboard = await WardCredits.find({})
            .sort({ totalCredits: -1 })
            .limit(10);

        // If DB is empty, return some defaults (optional, but good for UX)
        if (leaderboard.length === 0) {
            // Return some mock data if DB is empty to avoid blank screen
            const mockLeaderboard = [
                { rank: 1, wardName: 'Rohini Sector 7', wardNumber: '45', totalCredits: 15420, improvement: 12 },
                { rank: 2, wardName: 'Dwarka Sector 10', wardNumber: '101', totalCredits: 14850, improvement: 8 },
                { rank: 3, wardName: 'Vasant Kunj', wardNumber: '78', totalCredits: 13920, improvement: 15 },
                { rank: 4, wardName: 'Saket', wardNumber: '92', totalCredits: 12100, improvement: -3 },
                { rank: 5, wardName: 'KAKROLA', wardNumber: '123', totalCredits: 11500, improvement: 5 },
            ];
            return res.json({ success: true, leaderboard: mockLeaderboard });
        }

        const formattedLeaderboard = leaderboard.map((w, idx) => ({
            rank: idx + 1,
            wardName: w.wardName,
            wardNumber: w.wardNumber,
            totalCredits: w.totalCredits,
            improvement: Math.floor(Math.random() * 20) - 5 // Random for demo
        }));

        res.json({
            success: true,
            leaderboard: formattedLeaderboard
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
    }
});

// Spend credits
router.post('/spend', async (req, res) => {
    try {
        const { userId, purpose, amount } = req.body;

        if (!userId || !purpose || !amount) {
            return res.status(400).json({ success: false, message: 'userId, purpose, and amount are required' });
        }

        const user = await CitizenUser.findOne({ clerkId: userId });
        if (!user || user.totalCredits < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient credits' });
        }

        // Deduct credits
        user.totalCredits -= amount;
        await user.save();
        
        // Create a "spend" record in CreditRequest (optional, or create a separate Transaction model)
        const spendRecord = new CreditRequest({
            userId,
            activity: `Redeemed: ${purpose}`,
            credits: -amount,
            status: 'approved',
            proofImage: '/static/redeem.png', // Placeholder
            wardNumber: '0', // Not ward specific
            processedAt: new Date()
        });
        await spendRecord.save();

        res.json({
            success: true,
            message: `Redeemed ${purpose}`,
            credits: {
                totalCredits: user.totalCredits
            }
        });

    } catch (error) {
        console.error('Error spending credits:', error);
        res.status(500).json({ success: false, message: 'Failed to spend credits' });
    }
});

module.exports = router;
