const mysql = require('mysql2');

const cors = require("cors");
require('dotenv').config();
const axios = require('axios');
const express=require("express")

const app = express();
app.use(cors()); // Allow frontend requests
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create a connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Your MySQL user
  database: 'travelapp',  // Replace with your database name
  password: ''  // Empty password field
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as ID', connection.threadId);
});

// Example query
connection.query('SELECT * FROM users', (error, results) => {
  if (error) throw error;
  console.log(results);
});


module.exports = connection; // ✅ Export only `db`



const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


const API_KEY = process.env.GOOGLE_API_KEY;


// Close the connection
connection.end();