const express = require('express');
const router = express.Router();
const { connection } = require('../../index');

// API endpoint to get hit history
router.get('/rock-hitting-progress', (req, res) => {
    const userId = req.query.userId;

    // Replace the query below with your actual query to fetch hit history data
    const query = "SELECT currentRockId, currentRockHits, hitsRequired FROM userStatus WHERE userId = ?"
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching hit progress:', err);
            return res.status(500).json({ success: false, message: 'Error fetching hit progress' });
        }

        if (results.length > 0) {
            const data = results[0];
            res.json({
                currentHits: data.currentRockHits,
                hitsRequired: data.hitsRequired
            });
        } else {
            res.status(404).json({ success: false, message: 'Hit progress not found' });
        }
    });
});

module.exports = router;


