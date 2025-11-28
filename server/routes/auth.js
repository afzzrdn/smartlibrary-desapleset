const express = require('express');
const router = express.Router();
const { login, healthCheck, register, getProfile } = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

// Definisikan rute-rute
router.post('/register', register);
router.post('/login', login);
router.get('/health', healthCheck);
router.get('/profile', verifyToken, getProfile);

module.exports = router;