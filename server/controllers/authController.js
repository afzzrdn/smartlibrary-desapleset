const prisma = require('../lib/prisma'); // Klien Prisma baru kita
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// === Fungsi Registrasi Pengguna Baru (NEW) ===
const register = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // 1. Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    // 2. Enkripsi password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Simpan user baru ke DB (menggantikan INSERT)
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        // Role default adalah 'user'. Jika role dikirim, gunakan nilainya.
        // Hati-hati: Dalam produksi, Anda harus memvalidasi role yang diizinkan.
        role: role || 'user', 
      },
    });

    // 4. Buat Token untuk login instan
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token: token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// === Fungsi Login (Versi Prisma) ===
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Cari user (menggantikan SELECT)
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Email tidak ditemukan' });
    }

    // 2. Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // 3. Buat Token (JWT)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login berhasil',
      token: token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// === Fungsi Health Check (Versi Prisma) ===
const healthCheck = async (req, res) => {
  try {
    await prisma.$connect(); // Coba konek ke DB
    res.json({ message: 'Backend API hidup dan terhubung ke Postgres via Prisma!' });
  } catch (err) {
    res.status(500).json({ error: 'Koneksi database GAGAL', details: err.message });
  } finally {
    // PENTING: Koneksi dibuat dan diputuskan setiap kali fungsi ini dipanggil.
    // Biasanya, Prisma Client mengelola koneksi secara otomatis, jadi ini hanya untuk tes koneksi.
    await prisma.$disconnect(); 
  }
};

// === Fungsi Ambil Profil Pengguna (NEW) ===
// Memerlukan middleware autentikasi (misalnya: verifyToken) yang menyuntikkan data user ke req.user
const getProfile = async (req, res) => {
  const userId = req.user.id; 

  try {
    // Cari user di database berdasarkan ID
    // Hanya select field yang pasti ada (belum melakukan migration)
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        email: true,
        role: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'Profil pengguna tidak ditemukan' });
    }

    // Return profile dengan default values untuk field yang belum ada
    res.json({
      message: 'Data profil berhasil diambil',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        name: null,
        phone: null,
        bio: null,
        avatar_url: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

module.exports = {
  register,
  login,
  healthCheck,
  getProfile, // <<< Tambahkan fungsi baru
};