const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

/**
 * @desc Middleware untuk memverifikasi token JWT dan melindungi rute
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - Next function
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Cek Header Authorization
    // Periksa apakah header Authorization ada dan berformat 'Bearer <token>'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari string header ("Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifikasi Token
            // Memastikan token valid dan belum kadaluarsa
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Cari User dan Suntikkan ke Request
            // Cari user di database berdasarkan ID dari payload token
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                // Ambil data penting saja (ID, email, role). Jangan ambil password.
                select: { id: true, email: true, role: true }, 
            });

            if (!user) {
                return res.status(401).json({ message: 'Pengguna tidak ditemukan.' });
            }
            
            // Suntikkan data user ke request object (req.user)
            // Ini yang akan diakses di controller (misalnya, req.user.id)
            req.user = user; 

            // Lanjutkan ke fungsi controller berikutnya
            next(); 

        } catch (error) {
            console.error('Token tidak valid atau kedaluwarsa:', error.message);
            // Jika verifikasi gagal (token invalid/expired)
            return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa.' });
        }
    }

    // 4. Jika Tidak Ada Token
    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Tidak ada token otentikasi.' });
    }
};


const optionalProtect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Dapatkan token dari header
            token = req.headers.authorization.split(' ')[1];

            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Cari user di database dan lampirkan ke req.user
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true }, // Hanya ambil data penting
            });
            
            // PENTING: Jika user tidak ditemukan, set req.user = null
            if (!req.user) {
                req.user = null;
            }

        } catch (error) {
            // Jika token ada tetapi GAGAL diverifikasi (kedaluwarsa, dll.), 
            // kita abaikan error dan set req.user = null
            console.error('Token invalid atau kedaluwarsa:', error.message);
            req.user = null;
        }
    } else {
        // Jika tidak ada token sama sekali, set req.user = null
        req.user = null;
    }
    
    // Lanjutkan ke handler berikutnya (getAllBooks)
    next();
};

module.exports = {
    protect, optionalProtect
};