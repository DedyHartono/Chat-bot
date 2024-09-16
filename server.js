const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (like index.html)
app.use(express.static('public'));

// Endpoint to get response from file.txt
app.get('/response', (req, res) => {
    console.log('Request received with message:', req.query.message); // Debug line
    fs.readFile(path.join(__dirname, 'public', 'respons.txt'), 'utf8', (err, data) => {
      if (err) {
        res.status(500).send('Error reading file');
        console.error('Error reading file:', err); // Debug line
        return;
      }
  
      const responses = data.split('\n').reduce((acc, line) => {
        const [key, value] = line.split(':');
        if (key && value) {
          acc[key.trim().toLowerCase()] = value.trim();
        }
        return acc;
      }, {});
  
      const message = req.query.message ? req.query.message.toLowerCase() : '';
      const response = responses[message] || 'Maaf, saya tidak mengerti pertanyaan Anda.';
      console.log('Response sent:', response); // Debug line
      res.send(response);
    });
  });

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
