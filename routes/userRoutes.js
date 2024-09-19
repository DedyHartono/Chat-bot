const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Handle login
router.post('/login', userController.login);

// Handle registration
router.post('/register', userController.register);

module.exports = router;
