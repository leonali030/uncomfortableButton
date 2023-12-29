const express = require('express');
const router = express.Router();
const { connection } = require('../../index');

// API endpoint to get hit history
router.get('/jades-history', (req, res) => {
    const userId = req.query.userId;

    const query = "SELECT j.type, COUNT(u.jadeId) AS jadeCount, SUM(j.value) AS totalValue FROM userJadeOwnership u JOIN jades j ON u.jadeId = j.jadeId WHERE u.userId = ? GROUP BY u.jadeId";

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching rock history:', err);
            return res.status(500).json({ success: false, message: 'Error fetching rock history' });
        }
        // Return an empty array if no results are found
        if (results.length === 0) {
            return res.json([]);
        }

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ success: false, message: 'Rock history not found' });
        }
    });
});

module.exports = router;


