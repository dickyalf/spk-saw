const mongoose = require('mongoose');

const jawabanTesSchema = new mongoose.Schema(
  {
    lamaran: { type: mongoose.Schema.Types.ObjectId, ref: 'Lamaran', required: true },
    soal: { type: mongoose.Schema.Types.ObjectId, ref: 'SoalTes', required: true },
    pilihanIndex: { type: Number, default: null }, // untuk pilihan ganda
    teksJawaban: String, // untuk esai
    benar: { type: Boolean, default: null },
    nilai: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jawabanTesSchema.index({ lamaran: 1, soal: 1 }, { unique: true });

module.exports = mongoose.model('JawabanTes', jawabanTesSchema);
