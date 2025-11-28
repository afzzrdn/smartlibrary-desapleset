// controllers/favoritesController.js
const prisma = require('../lib/prisma');

// ===========================================
// FUNGSI 1: GET FAVORITE BOOKS (untuk halaman favorit)
// ===========================================
/**
 * @desc Get all favorite books for the authenticated user
 * @route GET /api/favorites
 * @access Private
 */
const getFavoriteBooks = async (req, res) => {
    // userId disuntikkan oleh middleware otentikasi
    const userId = req.user.id; 
    
    try {
        // 1. Ambil semua entri Favorite untuk userId
        const favoriteEntries = await prisma.favorite.findMany({
            where: { 
                userId: userId
            },
            // 2. Gunakan 'include' untuk mengambil data buku terkait
            include: {
                book: {
                    include: { 
                        category: true,
                        genre: true,
                    }
                }
            },
            orderBy: {
                created_at: 'desc' 
            }
        });

        // 3. Ekstrak objek 'book' dan tambahkan properti is_favorite: true
        const books = favoriteEntries.map(entry => ({
            ...entry.book,
            is_favorite: true, // Karena ini adalah halaman Favorit, statusnya pasti true
        }));
        
        res.json(books);

    } catch (error) {
        console.error("Gagal mengambil buku favorit:", error);
        res.status(500).json({ error: "Kesalahan server saat mengambil daftar favorit." });
    }
};

// ===========================================
// FUNGSI 2: TOGGLE FAVORIT (POST)
// ===========================================
/**
 * @desc Toggle (Add or Remove) a book from the user's favorites
 * @route POST /api/favorites/toggle
 * @access Private
 */
const toggleFavorite = async (req, res) => {
    // userId disuntikkan oleh middleware otentikasi
    const userId = req.user.id; 
    
    const { bookId } = req.body; 

    if (!bookId) {
        return res.status(400).json({ error: "BookID diperlukan." });
    }
    
    const parsedBookId = parseInt(bookId);

    try {
        // 1. Cek apakah buku sudah ada di daftar favorit pengguna
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                // Menggunakan Primary Key gabungan
                userId_bookId: { 
                    userId: userId,
                    bookId: parsedBookId,
                },
            },
        });

        if (existingFavorite) {
            // 2. Jika sudah ada, HAPUS (TOGGLE OFF)
            await prisma.favorite.delete({
                where: {
                    userId_bookId: {
                        userId: userId,
                        bookId: parsedBookId,
                    },
                },
            });
            
            return res.json({ 
                message: "Buku berhasil dihapus dari favorit.", 
                isFavorite: false 
            });

        } else {
            // 3. Jika belum ada, TAMBAHKAN (TOGGLE ON)
            const newFavorite = await prisma.favorite.create({
                data: {
                    userId: userId,
                    bookId: parsedBookId,
                },
            });

            return res.status(201).json({ 
                message: "Buku berhasil ditambahkan ke favorit.", 
                isFavorite: true,
                favorite: newFavorite
            });
        }

    } catch (error) {
        console.error("Gagal melakukan toggle favorite:", error);
        res.status(500).json({ error: "Kesalahan server saat mengubah status favorit." });
    }
};

module.exports = {
    toggleFavorite,
    getFavoriteBooks,
};