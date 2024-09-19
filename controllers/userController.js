const db = require('../db');

exports.register = (req, res) => {
    const { kknumber, nik, name } = req.body;
  
    if (!kknumber.startsWith('33740')) {
      return res.status(400).json({ error: 'KK Number must start with 33740' });
    }
  
    db.query('SELECT * FROM users WHERE nik = ?', [nik], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
  
      if (results.length > 0) {
        return res.status(400).json({ error: 'NIK already registered' });
      }
  
      db.query('INSERT INTO users (kknumber, nik, name) VALUES (?, ?, ?)', [kknumber, nik, name], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Registration successful' });
      });
    });
  };
  
// Login
exports.login = (req, res) => {
  const { nik, name } = req.body;

  const sql = 'SELECT * FROM users WHERE nik = ? AND name = ?';
  db.query(sql, [nik, name], (err, result) => {
    if (err) {
      console.error('Error logging in user:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length > 0) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(400).json({ error: 'Invalid NIK or name' });
    }
  });
};
