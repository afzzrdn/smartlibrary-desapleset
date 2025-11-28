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
  const genreId = parseInt(id);
  
  try {
    // Use transaction to ensure atomic delete operation
    await prisma.$transaction(async (tx) => {
      // Delete all books in this genre first (cascade delete)
      await tx.book.deleteMany({
        where: { genreId: genreId }
      });

      // Then delete the genre
      await tx.genre.delete({ 
        where: { id: genreId } 
      });
    });

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