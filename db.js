const mysql = require('mysql2/promise'); 

const connection = mysql.createPool({ // Use createPool for connection pooling
  host: 'localhost',      // Replace with your DB host
  user: 'root',           // Replace with your DB username
  password: '',           // Replace with your DB password
  database: 'sibantu'     // Your DB name
});

// Optionally, you can create an async function to test the connection
async function connectDB() {
  try {
    await connection.getConnection(); // Test the connection
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
}

connectDB();

module.exports = connection;
