const express = require('express');
const router = express.Router();
const { connection } = require('../../index');

function generateNewRockId(currentRockId) {
    let newRockId;

    if (currentRockId >= 5) {
        // Generate a random number between 1 and 5
        newRockId = Math.floor(Math.random() * 5) + 1;
    } else {
        // Generate a random number between 1 and 10
        newRockId = Math.floor(Math.random() * 10) + 1;
    }

    return newRockId;
}


function mapRockToJade(rockHitsRequired) {
    // Define the maximum Jade ID
    const maxJadeId = 10;

    // Calculate a base value for Jade ID based on the rock ID
    // Adjust the factor to control how much the rock ID influences the Jade ID
    let baseJadeId = Math.min(Math.floor(rockHitsRequired / 2), maxJadeId);

    // Add some randomness, adjust the range as needed
    let randomAddition = Math.floor(Math.random() * 3) - 1;

    // Calculate the final Jade ID
    let jadeId = Math.min(maxJadeId, Math.max(1, baseJadeId + randomAddition));

    return jadeId;
}
//mapRockToJade(15)

// Endpoint to handle the "Felt Uncomfortable" button click
router.post('/hit-rock', (req, res) => {
    const userId = req.body.userId;

    // Begin transaction
    connection.beginTransaction(err => {
        if (err) {
            console.error('Transaction Error:', err);
            res.status(500).json({ success: false, message: 'Error starting transaction' });
            return;
        }

        // Step 1: Get the current rock status for the user
        connection.query('SELECT currentRockId, currentRockHits, hitsRequired FROM userStatus WHERE userId = ?', [userId], (error, userStatusResults) => {
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

            const { currentRockId, currentRockHits, hitsRequired } = userStatusResults[0];
            let newRockStatus = currentRockHits + 1; 

            // Insert a row into userUncomfortableHits
            connection.query('INSERT INTO userUncomfortableHits (userId, rockId) VALUES (?, ?)', [userId, currentRockId], error => {
                if (error) {
                    connection.rollback(() => {
                        console.error('Error inserting into userUncomfortableHits:', error);
                        res.status(500).json({ success: false, message: 'Error inserting into userUncomfortableHits' });
                    });
                    return;
                }
            });

            if (newRockStatus < hitsRequired) {
                // Update current rock status
                connection.query('UPDATE userStatus SET currentRockHits = ? WHERE userId = ?', [newRockStatus, userId], error => {
                    if (error) {
                        connection.rollback(() => {
                            console.error('Error updating rock status:', error);
                            res.status(500).json({ success: false, message: 'Error updating rock status' });
                        });
                        return;
                    }
                    commitTransaction(res, 'Rock hit successfully', newRockStatus, hitsRequired);
                });
            } else {
                // Get the jade for the finished rock
                const jadeId = mapRockToJade(hitsRequired);

                // Update user status with new rock
                const query = `
                INSERT INTO userJadeOwnership (userId, jadeId, acquiredTimestamp, hitsRequired)
                SELECT ?, ?, NOW(), ?
                FROM dual
                WHERE NOT EXISTS (
                    SELECT 1 FROM userJadeOwnership 
                    WHERE userId = ? AND jadeId = ? AND acquiredTimestamp = NOW()
                );
                `;

                connection.query(query, [userId, jadeId, hitsRequired, userId, jadeId], error => {
                    if (error) {
                        connection.rollback(() => {
                            console.error('Error updating userJadeOwnership:', error);
                            res.status(500).json({ success: false, message: 'Error updating userJadeOwnership' });
                        });
                        return;
                    }
                });
                // Rock completion logic
                const newRockId = generateNewRockId(currentRockId);
                // Retrieve the next rock's hits_required and increment current_rock_id
                connection.query('SELECT hitsRequired FROM rocks WHERE rockId = ?', [newRockId], (error, nextRockResults) => {
                    if (error || nextRockResults.length === 0) {
                        connection.rollback(() => {
                            console.error('Error getting next rock:', error);
                            res.status(500).json({ success: false, message: 'Error getting next rock' });
                        });
                        return;
                    }

                    const nextHitsRequired = nextRockResults[0].hitsRequired;

                    // Update user status with new rock
                    connection.query('UPDATE userStatus SET currentRockId = ?, currentRockHits = 0, hitsRequired = ? WHERE userId = ?', [newRockId, nextHitsRequired, userId], error => {
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
    const progressPercentage = parseFloat(((currentRockStatus / hitsRequired) * 100).toFixed(2));


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
