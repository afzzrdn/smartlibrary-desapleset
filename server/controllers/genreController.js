const prisma = require('../lib/prisma');

// Create
const createGenre = async (req, res) => {
  try {
    const genre = await prisma.genre.create({ data: req.body });
    res.status(201).json(genre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read (All)
const getAllGenres = async (req, res) => {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read (One)
const getGenreById = async (req, res) => {
  const { id } = req.params;
  try {
    const genre = await prisma.genre.findUnique({ where: { id: parseInt(id) } });
    res.json(genre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
const updateGenre = async (req, res) => {
  const { id } = req.params;
  try {
    const genre = await prisma.genre.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(genre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
const deleteGenre = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.genre.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
};