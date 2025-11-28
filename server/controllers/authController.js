const prisma = require('../lib/prisma'); // Klien Prisma baru kita
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Allowed roles for security
const ALLOWED_ROLES = ['user', 'admin'];

// === Fungsi Registrasi Pengguna Baru (NEW) ===
const register = async (req, res) => {
  const { email, password, role, name } = req.body;

  try {
    // 1. Validasi input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    // 2. Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    // 3. Validasi dan sanitasi role
    const validatedRole = (role && ALLOWED_ROLES.includes(role)) ? role : 'user';
    if (role && !ALLOWED_ROLES.includes(role)) {
      console.warn(`Invalid role attempted in registration: ${role}. Defaulting to 'user'.`);
    }

    // 4. Enkripsi password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Simpan user baru ke DB
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: validatedRole,
        name: name || null, // Simpan nama jika ada
      },
    });

    // 6. Buat Token untuk login instan
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token valid 7 hari
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token: token,
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role,
        name: newUser.name,
      },
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
      { expiresIn: '7d' } // Token valid 7 hari (konsisten dengan register)
    );

    res.json({
      message: 'Login berhasil',
      token: token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
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
    // Ambil semua field yang ada di User model
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        bio: true,
        avatar_url: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'Profil pengguna tidak ditemukan' });
    }

    // Return profile dengan data lengkap dari database
    res.json({
      message: 'Data profil berhasil diambil',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        name: userProfile.name,
        phone: userProfile.phone,
        bio: userProfile.bio,
        avatar_url: userProfile.avatar_url,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
      },
    });
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// === Fungsi Get All Members (ADMIN ONLY) ===
const getMembers = async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === Fungsi Update Member ===
const updateMember = async (req, res) => {
  const { id } = req.params;
  const { name, phone, role } = req.body;

  try {
    const updatedMember = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(role !== undefined && { role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        avatar_url: true,
      },
    });

    res.json(updatedMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === Fungsi Delete Member ===
const deleteMember = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete all favorites for this user
    await prisma.favorite.deleteMany({
      where: { userId: parseInt(id) },
    });

    // Delete all reading history for this user
    await prisma.readingHistory.deleteMany({
      where: { userId: parseInt(id) },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === Fungsi Dashboard Stats (ADMIN ONLY) ===
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Books
    const totalBooks = await prisma.book.count();

    // 2. Total Members (non-admin users only)
    const totalMembers = await prisma.user.count({
      where: { role: 'user' },
    });

    res.json({
      totalBooks,
      totalMembers,
    });
  } catch (err) {
    console.error('Error in getDashboardStats:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

module.exports = {
  register,
  login,
  healthCheck,
  getProfile,
  getMembers,
  updateMember,
  deleteMember,
  getDashboardStats,
};