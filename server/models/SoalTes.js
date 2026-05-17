const mongoose = require('mongoose');

const soalTesSchema = new mongoose.Schema(
  {
    perusahaan: { type: mongoose.Schema.Types.ObjectId, ref: 'Perusahaan', required: true },
    pertanyaan: { type: String, required: true },
    jenis: {
      type: String,
      enum: ['pilihan_ganda', 'esai'],
      default: 'pilihan_ganda',
    },
    pilihan: [
      {
        teks: String,
        kunci: { type: Boolean, default: false },
      },
    ],
    bobotNilai: { type: Number, default: 1 },
    kategori: { type: String, default: 'umum' }, // misal: logika, bahasa, teknis
    pembahasan: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('SoalTes', soalTesSchema);
