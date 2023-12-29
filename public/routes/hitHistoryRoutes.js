const express = require('express');
const router = express.Router();
const { connection } = require('../../index');

// API endpoint to get hit history
router.get('/hit-history', (req, res) => {
    const userId = req.query.userId;

    // Replace the query below with your actual query to fetch hit history data
    const query = "SELECT (SELECT COUNT(*) FROM userUncomfortableHits WHERE userId = ?) as totalHits,(SELECT COUNT(*) FROM userUncomfortableHits WHERE userId = ? AND DATE(hitTimestamp) = CURDATE()) as dailyHits,(SELECT COUNT(*) FROM userUncomfortableHits WHERE userId = ? AND hitTimestamp >= NOW() - INTERVAL 30 DAY) as monthlyHits;";

    connection.query(query, [userId, userId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching hit history:', err);
            return res.status(500).json({ success: false, message: 'Error fetching hit history' });
        }

        if (results.length > 0) {
            const data = results[0];
            res.json({
                daily: data.dailyHits,
                monthly: data.monthlyHits,
                total: data.totalHits
            });
        } else {
            res.status(404).json({ success: false, message: 'Hit history not found' });
        }
    });
});

module.exports = router;


