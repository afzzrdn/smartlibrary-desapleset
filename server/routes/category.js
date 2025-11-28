const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// /api/categories
router.post('/', protect, createCategory); // Admin only: Create category
router.get('/', getAllCategories); // Public: Read all categories
router.get('/:id', getCategoryById); // Public: Read single category
router.put('/:id', protect, updateCategory); // Admin only: Update category
router.delete('/:id', protect, deleteCategory); // Admin only: Delete category

module.exports = router;