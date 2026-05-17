const mongoose = require('mongoose');

/**
 * Kriteria seleksi per lowongan (atau per perusahaan).
 * - bobot: angka 0..1 (akan dinormalisasi di service SAW)
 * - tipe: benefit (semakin besar semakin baik) / cost (semakin kecil semakin baik)
 * - kategori: dari mana sumber nilainya
 *   - 'pendidikan'  -> diambil dari CV (skor pendidikan)
 *   - 'pengalaman'  -> diambil dari CV (total tahun)
 *   - 'tes'         -> diambil dari nilai tes tulis
 *   - 'wawancara'   -> diambil dari penilaian wawancara
 *   - 'custom'      -> input manual oleh perusahaan
 */
const kriteriaSchema = new mongoose.Schema(
  {
    perusahaan: { type: mongoose.Schema.Types.ObjectId, ref: 'Perusahaan', required: true },
    lowongan: { type: mongoose.Schema.Types.ObjectId, ref: 'Lowongan' }, // null = template default perusahaan
    nama: { type: String, required: true },
    kode: { type: String, required: true }, // mis. C1, C2
    tipe: { type: String, enum: ['benefit', 'cost'], default: 'benefit' },
    kategori: {
      type: String,
      enum: ['pendidikan', 'pengalaman', 'tes', 'wawancara', 'custom'],
      required: true,
    },
    bobot: { type: Number, required: true, min: 0, max: 1 },
    deskripsi: String,
  },
  { timestamps: true }
);

kriteriaSchema.index({ lowongan: 1, kode: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Kriteria', kriteriaSchema);
