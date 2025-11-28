const prisma = require('../lib/prisma');

const processBookData = (req) => {
    const { title, author, description, categoryId, genreId } = req.body;
    
    const bookFile = req.files && req.files.bookFile ? req.files.bookFile[0] : null;
    const coverFile = req.files && req.files.coverFile ? req.files.coverFile[0] : null;
    
    const bookFileUrl = bookFile ? bookFile.path : null; 
    const coverFileUrl = coverFile ? coverFile.path : null;
    
    if (!bookFileUrl && req.method === 'POST') {
        throw new Error("File buku wajib diunggah.");
    }
    
    return {
        data: {
            title,
            author,
            description,
            categoryId: categoryId ? parseInt(categoryId) : null,
            genreId: genreId ? parseInt(genreId) : null,
            file_url: bookFileUrl, // Path lokal
            cover_image_url: coverFileUrl, // Path lokal
        },
        bookFileUrl // Untuk debugging
    };
};


// === CRUD Functions ===
// 1. Create Book
const createBook = async (req, res) => {
  try {
    const { data } = processBookData(req);

    const book = await prisma.book.create({ data });
    
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Read All
const getAllBooks = async (req, res) => {
    const userId = req.user ? req.user.id : null; 
    console.log("User ID diterima di /api/books:", req.user ? req.user.id : "TIDAK ADA");
    
    try {
        // Ambil semua buku dari database
        const books = await prisma.book.findMany({
            include: {
                category: true,
                genre: true,
            },
            orderBy: {
                title: 'asc'
            }
        });

        // 2. Inisialisasi Set untuk menyimpan ID buku favorit pengguna
        let favoriteBookIds = new Set();
        if (userId) {
            // Hanya query jika pengguna login
            const favorites = await prisma.favorite.findMany({
                where: { userId: userId },
                select: { bookId: true }, // Efisien: Hanya ambil kolom bookId
            });
            
            // Isi Set dengan ID buku favorit untuk pencarian cepat
            favoriteBookIds = new Set(favorites.map(f => f.bookId));
        }

        // 3. Inject status is_favorite ke setiap buku sebelum dikirim ke frontend
        const booksWithFavoriteStatus = books.map(book => ({
            ...book,
            // Cek apakah buku ini ada di daftar favorit pengguna yang login
            is_favorite: userId ? favoriteBookIds.has(book.id) : false, 
        }));
        
        res.json(booksWithFavoriteStatus);

    } catch (error) {
        console.error("Gagal mengambil daftar buku:", error);
        res.status(500).json({ error: "Kesalahan server saat memuat buku." });
    }
};

// 3. Read One
const getBookById = async (req, res) => {
  const { id } = req.params;
  console.log("ID yang diterima =>", id);
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        genre: true,
      },
    });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Update
const updateBook = async (req, res) => {
  const { id } = req.params;
  
  const dataUpdate = {
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
    categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : null,
    genreId: req.body.genreId ? parseInt(req.body.genreId) : null,
  };
  
  try {
    const book = await prisma.book.update({
      where: { id: parseInt(id) },
      data: dataUpdate, // Hanya data teks untuk penyederhanaan
    });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Delete
const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    // TODO: Hapus file dari folder /uploads sebelum menghapus entry dari DB
    
    await prisma.book.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBooksByIds = async (req, res) => {
    // Ambil daftar ID dari query parameter, misalnya: /api/books/by-ids?ids=1,5,10
    const idsString = req.query.ids;
    const userId = req.user ? req.user.id : null; 
    
    if (!idsString) {
        return res.status(400).json({ error: "Query parameter 'ids' wajib diisi." });
    }

    try {
        // 1. Konversi string ID ('1,5,10') menjadi array of integers ([1, 5, 10])
        const bookIds = idsString.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

        if (bookIds.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Ambil buku dari database menggunakan findMany dan `in` filter
        const books = await prisma.book.findMany({
            where: {
                id: {
                    in: bookIds,
                },
            },
            include: {
                category: true,
                genre: true,
            },
            // Tidak perlu orderBy di sini, pengurutan dilakukan di frontend berdasarkan waktu baca.
        });

        // 3. Tambahkan status is_favorite (opsional, tapi konsisten dengan getAllBooks)
        let favoriteBookIds = new Set();
        if (userId) {
            const favorites = await prisma.favorite.findMany({
                where: { userId: userId, bookId: { in: bookIds } },
                select: { bookId: true },
            });
            favoriteBookIds = new Set(favorites.map(f => f.bookId));
        }

        const booksWithFavoriteStatus = books.map(book => ({
            ...book,
            is_favorite: userId ? favoriteBookIds.has(book.id) : false, 
        }));

        res.json(booksWithFavoriteStatus);

    } catch (error) {
        console.error("Gagal mengambil buku berdasarkan ID:", error);
        res.status(500).json({ error: "Kesalahan server saat memuat buku." });
    }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  getBooksByIds,
  updateBook,
  deleteBook,
};