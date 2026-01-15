const express = require('express');
const router = express.Router();
const SleepEntry = require('../models/SleepEntry');

router.post('/', async (req, res) => {
    const { startTime, endTime, quality } = req.body;

    // Step 2: Validation (Passed!)
    if (!startTime || !endTime || !quality) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const totalHours = (end - start) / (1000 * 60 * 60);
        const qualityMap = { 'good': 5, 'poor': 2, 'missed': 1 };
        
        // Step 3: Store data (The 500 error happens here)
        const newEntry = new SleepEntry({
            // FIX: Ensure a valid ObjectId format for testing
            userId: req.user?._id || "65a5f1e2b3c4d5e6f7a8b9c0", 
            entryDate: start,
            hours: totalHours.toFixed(2),
            startTime: start,
            endTime: end,
            rating: qualityMap[quality] || 3
        });

        await newEntry.save();
        
        // This is what you want to see in Postman!
        res.status(201).json({ 
            message: "Sleep record saved successfully!", 
            data: newEntry 
        });
    } catch (error) {
        // Step 4: Error Handling
        console.error("Database Save Error:", error);
        res.status(500).json({ error: "Database save failed. Check server console for details." });
    }
});

module.exports = router;