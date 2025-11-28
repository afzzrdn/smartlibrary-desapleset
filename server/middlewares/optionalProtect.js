// middleware/optionalProtect.js (BUAT FILE BARU atau UBAH MIDDLEWARE LAMA)

const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
// const asyncHandler = require('express-async-handler'); // Jika Anda menggunakannya

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

module.exports = optionalProtect;