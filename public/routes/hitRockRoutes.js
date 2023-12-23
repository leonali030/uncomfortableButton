const express = require('express');
const router = express.Router();
const { connection } = require('../../index');

// Endpoint to handle the "Felt Uncomfortable" button click
router.post('/hit-rock', (req, res) => {
    const userId = req.body.userid;

    // Begin transaction
    connection.beginTransaction(err => {
        if (err) {
            console.error('Transaction Error:', err);
            res.status(500).json({ success: false, message: 'Error starting transaction' });
            return;
        }

        // Step 1: Get the current rock status for the user
        connection.query('SELECT current_rock_id, current_rock_status, hits_required FROM user_status WHERE userid = ?', [userId], (error, userStatusResults) => {
            if (error) {
                connection.rollback(() => {
                    console.error('Error querying user status:', error);
                    res.status(500).json({ success: false, message: 'Error querying user status' });
                });
                return;
            }

            if (userStatusResults.length === 0) {
                connection.rollback(() => {
                    res.status(404).json({ success: false, message: 'User status not found' });
                });
                return;
            }

            const { current_rock_id, current_rock_status, hits_required } = userStatusResults[0];
            let newRockStatus = current_rock_status + 1;

            if (newRockStatus < hits_required) {
                // Update current rock status
                connection.query('UPDATE user_status SET current_rock_status = ? WHERE userid = ?', [newRockStatus, userId], error => {
                    if (error) {
                        connection.rollback(() => {
                            console.error('Error updating rock status:', error);
                            res.status(500).json({ success: false, message: 'Error updating rock status' });
                        });
                        return;
                    }
                    commitTransaction(res, 'Rock hit successfully', newRockStatus, hits_required);
                });
            } else {
                // Rock completion logic
                // Retrieve the next rock's hits_required and increment current_rock_id
                connection.query('SELECT hits_required FROM rocks WHERE rock_id = ?', [current_rock_id + 1], (error, nextRockResults) => {
                    if (error || nextRockResults.length === 0) {
                        connection.rollback(() => {
                            console.error('Error getting next rock:', error);
                            res.status(500).json({ success: false, message: 'Error getting next rock' });
                        });
                        return;
                    }

                    const nextHitsRequired = nextRockResults[0].hits_required;

                    // Update user status with new rock
                    connection.query('UPDATE user_status SET current_rock_id = ?, current_rock_status = 0, hits_required = ? WHERE userid = ?', [current_rock_id + 1, nextHitsRequired, userId], error => {
                        if (error) {
                            connection.rollback(() => {
                                console.error('Error updating user status for new rock:', error);
                                res.status(500).json({ success: false, message: 'Error updating user status for new rock' });
                            });
                            return;
                        }
                        commitTransaction(res, 'Rock completed and new rock assigned', 0, nextHitsRequired);
                    });
                });
            }
        });
    });
});

function commitTransaction(res, message, currentRockStatus, hitsRequired) {
    const progressPercentage = (currentRockStatus / hitsRequired) * 100;

    connection.commit(error => {
        if (error) {
            connection.rollback(() => {
                console.error('Error committing transaction:', error);
                res.status(500).json({ success: false, message: 'Error committing transaction' });
            });
            return;
        }
        res.json({ success: true, message: message, newStatus: progressPercentage });
    });
}

module.exports = router;
