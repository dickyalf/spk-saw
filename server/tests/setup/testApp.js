/**
 * Test app factory — bikin Express app TANPA listen() & TANPA connectDB().
 * Mongoose connection di-handle di test/setup/db.js.
 *
 * Strukturnya sengaja mirror server.js agar perilaku route konsisten.
 */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

let connectedOnce = false;

async function ensureMongoConnected() {
  if (mongoose.connection.readyState === 1) return;
  if (connectedOnce) return;
  connectedOnce = true;
  await mongoose.connect(process.env.MONGO_URI);
}

function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  app.use('/api/auth', require('../../routes/auth'));
  app.use('/api/perusahaan', require('../../routes/perusahaan'));
  app.use('/api/pelamar', require('../../routes/pelamar'));
  app.use('/api/lowongan', require('../../routes/lowongan'));
  app.use('/api/kriteria', require('../../routes/kriteria'));
  app.use('/api/soal-tes', require('../../routes/soalTes'));
  app.use('/api/lamaran', require('../../routes/lamaran'));
  app.use('/api/cv', require('../../routes/cv'));
  app.use('/api/tes', require('../../routes/tes'));
  app.use('/api/wawancara', require('../../routes/wawancara'));
  app.use('/api/ranking', require('../../routes/ranking'));
  app.use('/api/notifikasi', require('../../routes/notifikasi'));
  app.use('/api/admin', require('../../routes/admin'));
  app.use('/api/laporan', require('../../routes/laporan'));

  app.use(require('../../middleware/error'));
  return app;
}

module.exports = { buildApp, ensureMongoConnected };
