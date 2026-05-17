const mongoose = require('mongoose');

const wawancaraSchema = new mongoose.Schema(
  {
    lamaran: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lamaran',
      required: true,
      unique: true,
    },
    mode: { type: String, enum: ['online', 'offline'], default: 'offline' },
    tanggal: Date,
    lokasi: String, // untuk offline (alamat)
    linkMeeting: String, // untuk online (zoom/meet)
    pewawancara: String,

    // Penilaian wawancara (skor 0-100 per aspek)
    skorTeknis: { type: Number, default: null },
    skorKomunikasi: { type: Number, default: null },
    skorAttitude: { type: Number, default: null },
    skorMotivasi: { type: Number, default: null },
    skorAkhir: { type: Number, default: null }, // rata-rata atau di-input manual
    catatan: String,

    status: {
      type: String,
      enum: ['terjadwal', 'selesai', 'batal'],
      default: 'terjadwal',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wawancara', wawancaraSchema);
