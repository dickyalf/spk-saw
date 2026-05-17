require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

const app = express();

// --- Database ---
connectDB();

// --- Security & utility middleware ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limit untuk auth (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Terlalu banyak percobaan. Coba lagi 15 menit ke depan.' },
});

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.get('/api/health', (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/perusahaan', require('./routes/perusahaan'));
app.use('/api/pelamar', require('./routes/pelamar'));
app.use('/api/lowongan', require('./routes/lowongan'));
app.use('/api/kriteria', require('./routes/kriteria'));
app.use('/api/soal-tes', require('./routes/soalTes'));
app.use('/api/lamaran', require('./routes/lamaran'));
app.use('/api/cv', require('./routes/cv'));
app.use('/api/tes', require('./routes/tes'));
app.use('/api/wawancara', require('./routes/wawancara'));
app.use('/api/ranking', require('./routes/ranking'));
app.use('/api/notifikasi', require('./routes/notifikasi'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/laporan', require('./routes/laporan'));

// 404
app.use((req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 SPK SAW server listening on http://localhost:${PORT}`)
);

module.exports = app;
