const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middlewares/authMiddleware');

// 1. GET /api/favorites (Mengambil daftar favorit)
router.get('/', protect, favoriteController.getFavoriteBooks); 

// 2. POST /api/favorites/toggle (Toggle favorit)
router.post('/toggle', protect, favoriteController.toggleFavorite);

module.exports = router;