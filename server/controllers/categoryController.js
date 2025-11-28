const prisma = require('../lib/prisma');

// Create
const createCategory = async (req, res) => {
  try {
    const category = await prisma.category.create({
      data: req.body, // { name: "..." }
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read (All)
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read (One)
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
const updateCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: req.body, // { name: "..." }
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};