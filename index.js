// Import modules
const express = require('express');
const mysql = require('mysql2');

// Create an express application
const app = express();

// Define a port number
const port = 3000;

// Define a route for the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',  
  password: 'passw0rd',
  database: 'uncomfortableButton'
});

// connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to database with ID ' + connection.threadId);
});

// text the sql connect
connection.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

// routes
//the Login Route
app.post('/login', (req, res) => {
  // Placeholder for authentication logic
  res.sendFile(__dirname + '/public/login.html');

  res.send('Login successful');
});

//the Logout Route
app.get('/logout', (req, res) => {
  // Placeholder for logout logic
  // ...

  res.send('Logout successful');
});

//Route for the Button Action
app.post('/uncomfortable', (req, res) => {
  // Logic to handle the uncomfortable button press
  // E.g., incrementing a counter in the database
  // ...

  res.send('Uncomfortable point recorded');
});

// Route for the history page
app.get('/history', (req, res) => {
  res.sendFile(__dirname + '/public/history.html');
});

