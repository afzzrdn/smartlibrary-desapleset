const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const path = require('path');

// Pastikan Anda mengimpor middleware otentikasi
// ASUMSI: Anda memiliki file authMiddleware yang berisi `protect` dan `optionalProtect`
const { protect, optionalProtect } = require('../middlewares/authMiddleware'); 

const {
  createBook,
  getAllBooks,
  getBookById,
  getBooksByIds,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');

// Konfigurasi Multer untuk penyimpanan
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Simpan file sementara di folder 'uploads'
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Nama file: book-timestamp-originalfilename.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// === Rute Buku ===

// 1. POST (Create) - MEMBUTUHKAN OTENTIKASI WAJIB (PROTECT)
router.post(
    '/', 
    protect, // <-- Middleware WAJIB: Hanya user terotentikasi yang boleh membuat buku
    upload.fields([
        { name: 'bookFile', maxCount: 1 },
        { name: 'coverFile', maxCount: 1 }
    ]), 
    createBook
);

// 2. GET (Read All) - MEMBUTUHKAN OTENTIKASI OPSIONAL (OPTIONALPROTECT)
router.get('/by-ids', optionalProtect, getBooksByIds);
router.get('/', optionalProtect, getAllBooks); 

// 3. GET (Read Single)
router.get('/:id', getBookById);

// 4. PUT (Update) - MEMBUTUHKAN OTENTIKASI WAJIB (PROTECT)
router.put('/:id', protect, updateBook); // <-- Middleware WAJIB

// 5. DELETE (Delete) - MEMBUTUHKAN OTENTIKASI WAJIB (PROTECT)
router.delete('/:id', protect, deleteBook); // <-- Middleware WAJIB

module.exports = router;