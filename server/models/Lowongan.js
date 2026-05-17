const mongoose = require('mongoose');

const lowonganSchema = new mongoose.Schema(
  {
    perusahaan: { type: mongoose.Schema.Types.ObjectId, ref: 'Perusahaan', required: true },
    judul: { type: String, required: true, trim: true },
    posisi: { type: String, required: true },
    deskripsi: String,
    kualifikasi: String,
    tanggungJawab: String,
    lokasi: String,
    tipeKerja: {
      type: String,
      enum: ['fulltime', 'parttime', 'kontrak', 'magang', 'remote'],
      default: 'fulltime',
    },
    gajiMin: Number,
    gajiMax: Number,
    batasPendaftaran: Date,
    kuota: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    // Tahapan seleksi yang aktif untuk lowongan ini
    tahapanSeleksi: {
      administrasi: { type: Boolean, default: true },
      tesTulis: { type: Boolean, default: true },
      wawancara: { type: Boolean, default: true },
    },
    soalTes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SoalTes' }],
    durasiTesMenit: { type: Number, default: 60 },
    nilaiMinimumTes: { type: Number, default: 60 }, // pelamar lolos tes bila >= ini
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lowongan', lowonganSchema);
