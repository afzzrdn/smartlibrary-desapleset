// verifyToken.js - Middleware untuk verifikasi JWT token
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Token tidak tersedia atau format salah' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verifikasi token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. Cek apakah user masih ada di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        role: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Pengguna tidak ditemukan. Token mungkin invalid.' });
    }

    // 3. Suntikkan data user (dari database) ke req.user
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' });
  }
};

module.exports = verifyToken;