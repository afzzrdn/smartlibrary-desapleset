const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
} = require('../controllers/genreController');

// /api/genres
router.post('/', protect, createGenre); // Admin only: Create genre
router.get('/', getAllGenres); // Public: Read all genres
router.get('/:id', getGenreById); // Public: Read single genre
router.put('/:id', protect, updateGenre); // Admin only: Update genre
router.delete('/:id', protect, deleteGenre); // Admin only: Delete genre

module.exports = router;