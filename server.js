const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs'); // Import fs module
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = 8000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/users', userRoutes);

// Serve responses.json
app.get('/response', (req, res) => {
  const query = req.query.message.toLowerCase();
  fs.readFile(path.join(__dirname, 'response.json'), 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading response file');
      return;
    }
    const responses = JSON.parse(data);
    const response = responses[query] || 'Maaf, saya tidak mengerti pertanyaan Anda.';
    res.send(response);
  });
});

// Handle requests for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
