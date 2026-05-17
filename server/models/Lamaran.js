const mongoose = require('mongoose');

/**
 * Lamaran = relasi pelamar <-> lowongan, sekaligus tracker tahapan seleksi.
 *
 * statusKeseluruhan:
 *   - menunggu        -> baru daftar, belum diverifikasi
 *   - administrasi    -> sedang seleksi admin
 *   - tes             -> lolos admin, sedang/akan tes
 *   - wawancara       -> lolos tes, sedang/akan wawancara
 *   - ranking         -> semua tahap selesai, masuk perhitungan SAW
 *   - diterima        -> final: lolos
 *   - ditolak         -> final: tidak lolos
 */
const tahapanSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['belum', 'sedang', 'lolos', 'tidak_lolos'],
      default: 'belum',
    },
    nilai: { type: Number, default: null }, // 0-100
    catatan: String,
    diperbaruiPada: Date,
  },
  { _id: false }
);

const lamaranSchema = new mongoose.Schema(
  {
    pelamar: { type: mongoose.Schema.Types.ObjectId, ref: 'Pelamar', required: true },
    lowongan: { type: mongoose.Schema.Types.ObjectId, ref: 'Lowongan', required: true },
    cvSnapshot: { type: mongoose.Schema.Types.ObjectId, ref: 'CV' }, // snapshot CV saat lamar
    suratLamaran: String,

    statusKeseluruhan: {
      type: String,
      enum: [
        'menunggu',
        'administrasi',
        'tes',
        'wawancara',
        'ranking',
        'diterima',
        'ditolak',
      ],
      default: 'menunggu',
    },

    administrasi: tahapanSchema,
    tes: tahapanSchema,
    wawancara: tahapanSchema,

    // Hasil perhitungan SAW (di-cache di sini agar cepat ditampilkan)
    skorSAW: { type: Number, default: null },
    rankingSAW: { type: Number, default: null },
  },
  { timestamps: true }
);

lamaranSchema.index({ pelamar: 1, lowongan: 1 }, { unique: true });

module.exports = mongoose.model('Lamaran', lamaranSchema);
