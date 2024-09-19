const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',      // Replace with your DB host
  user: 'root',           // Replace with your DB username
  password: '',           // Replace with your DB password
  database: 'sibantu'      // Your DB name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = connection;
