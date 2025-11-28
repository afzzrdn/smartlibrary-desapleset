const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3100;

// ===============================
// CORS untuk semua jaringan
// ===============================
app.use(cors({
  origin: "*",  // Izinkan semua jaringan
  credentials: false,
}));

app.use(bodyParser.json());

// File statis
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/genres', require('./routes/genre'));
app.use('/api/books', require('./routes/book'));
app.use('/api/favorites', require('./routes/favorite'));

// Jalankan Server di LAN
app.listen(port, "0.0.0.0", () => {
  console.log(`Server berjalan di http://0.0.0.0:${port}`);

  console.log(`Akses LAN via: http://${getLocalIP()}:${port}`);
});

// Fungsi untuk mendapatkan IP LAN
function getLocalIP() {
  const os = require("os");
  const interfaces = os.networkInterfaces();

  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}
