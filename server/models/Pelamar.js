const mongoose = require('mongoose');

const pelamarSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    namaLengkap: { type: String, required: true, trim: true },
    nik: { type: String, default: '' },
    tanggalLahir: Date,
    jenisKelamin: { type: String, enum: ['L', 'P', ''], default: '' },
    nomorTelepon: { type: String, default: '' },
    alamat: { type: String, default: '' },
    kota: { type: String, default: '' },
    foto: String,
    cv: { type: mongoose.Schema.Types.ObjectId, ref: 'CV' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pelamar', pelamarSchema);
