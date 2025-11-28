const express = require('express');
const router = express.Router();
const { login, healthCheck, register, getProfile, getMembers, updateMember, deleteMember } = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

// Definisikan rute-rute
router.post('/register', register);
router.post('/login', login);
router.get('/health', healthCheck);
router.get('/profile', verifyToken, getProfile);

// Member management routes (ADMIN)
router.get('/members', verifyToken, getMembers);
router.put('/members/:id', verifyToken, updateMember);
router.delete('/members/:id', verifyToken, deleteMember);

module.exports = router;