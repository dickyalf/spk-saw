const mongoose = require('mongoose');

const notifikasiSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    judul: { type: String, required: true },
    pesan: { type: String, required: true },
    tipe: {
      type: String,
      enum: ['info', 'sukses', 'peringatan', 'gagal'],
      default: 'info',
    },
    link: String,
    dibaca: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notifikasi', notifikasiSchema);
