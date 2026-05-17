const mongoose = require('mongoose');

const perusahaanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    namaPerusahaan: { type: String, required: true, trim: true },
    industri: { type: String, default: '-' },
    alamat: { type: String, default: '' },
    kota: { type: String, default: '' },
    nomorTelepon: { type: String, default: '' },
    website: { type: String, default: '' },
    deskripsi: { type: String, default: '' },
    logo: String, // path file
    statusVerifikasi: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Perusahaan', perusahaanSchema);
