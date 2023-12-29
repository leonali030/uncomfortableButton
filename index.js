// Import modules
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

// Create an express application
const app = express();

// Define a port number
const port = 3000;

// Set up your MySQL connection
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

module.exports.connection = connection;

// Session setup
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Import the routes
const rockRoutes = require('./public/routes/hitRockRoutes');
const userRoutes = require('./public/routes/userRoutes');
const historyRoutes = require('./public/routes/hitHistoryRoutes'); 
const jadesRoutes = require('./public/routes/jadesHistoryRoutes'); 
const progressRoutes = require('./public/routes/hitProgressRoutes'); 
// Use the imported routes
app.use('/api', rockRoutes); 
app.use('/api', historyRoutes); 
app.use('/api', progressRoutes); 
app.use('/api', jadesRoutes);
app.use('/user', userRoutes); 

// Define a route for the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
