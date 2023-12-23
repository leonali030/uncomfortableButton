const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { connection } = require('../../index');


// Registration endpoint
router.post('/register', (req, res) => {
    const { username, password} = req.body;
    
    // Check if the username and password are provided
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insert the new user into the database
    connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (error, results) => {
        if (error) {
            console.error('Error in registration:', error); // Log the error to the console
            res.status(500).send('Error in registration: ' + error.message); // Send a more detailed error message
            return;
        }

        // Assign the first rock to the user
        const userId = results.insertId;

        
        connection.query('INSERT INTO user_status (userid, current_rock_id, hits_required) VALUES (?, 1, 5)', [userId], (error, results) => {
            if (error) {
                res.status(500).send('Error in assigning rock');
                return;
            }

            res.json({ success: true, message: "User registered", userid: userId });

        });
    });
});


// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
        if (error || results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
            res.status(401).send('Authentication failed');
            return;
        }

        // Create a session
        req.session.userId = results[0].userid;
        req.session.username = username;
        res.json({ success: true, message: "Logged in successfully", userid: req.session.userId});
    });
});

// Logout endpoint
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logged out successfully');
});

module.exports = router;
