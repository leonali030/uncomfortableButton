const express = require('express');
const router = express.Router();


// Endpoint to handle the "Felt Uncomfortable" button click
router.post('/hit-rock', (req, res) => {
    // Assuming user ID is available (perhaps from a session or sent in request body)
    const userId = req.body.userId; // Replace with actual logic to get userId

    // Begin transaction
    connection.beginTransaction((err) => {
        if (err) { throw err; }

        // Step 1: Get the current rock status for the user
        connection.query('SELECT current_rock_id, current_rock_status FROM user_status WHERE userid = ?', [userId], (error, userStatusResults) => {
            if (error) {
                return connection.rollback(() => { throw error; });
            }

            const currentRockId = userStatusResults[0].current_rock_id;
            const currentRockStatus = userStatusResults[0].current_rock_status;

            // Step 2: Update the rock status (decrement the hits)
            connection.query('UPDATE rocks SET hitsLeft = hitsLeft - 1 WHERE rock_id = ?', [currentRockId], (error, updateResults) => {
                if (error) {
                    return connection.rollback(() => { throw error; });
                }

                const newRockStatus = currentRockStatus - 1;

                // Step 3: Check if the rock is completed
                if (newRockStatus <= 0) {
                    // Handle rock completion logic here
                    // e.g., assign a new rock, update user status, assign jade, etc.
                }

                // Step 4: Commit transaction
                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => { throw err; });
                    }
                    console.log('Transaction Complete.');
                    res.json({ success: true, message: "Rock hit successfully", newStatus: newRockStatus });
                });
            });
        });
    });
});

module.exports = router;
