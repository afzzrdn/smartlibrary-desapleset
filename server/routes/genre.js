const express = require('express');
const router = express.Router();
const {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
} = require('../controllers/genreController');

// /api/genres
router.post('/', createGenre);
router.get('/', getAllGenres);
router.get('/:id', getGenreById);
router.put('/:id', updateGenre);
router.delete('/:id', deleteGenre);

module.exports = router;