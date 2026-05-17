const mongoose = require('mongoose');

const pendidikanSchema = new mongoose.Schema(
  {
    jenjang: {
      type: String,
      enum: ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3'],
      required: true,
    },
    institusi: String,
    jurusan: String,
    tahunMasuk: Number,
    tahunLulus: Number,
    ipk: Number,
  },
  { _id: false }
);

const pengalamanSchema = new mongoose.Schema(
  {
    perusahaan: String,
    posisi: String,
    tahunMulai: Number,
    tahunSelesai: Number, // null/0 = masih bekerja
    deskripsi: String,
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    nama: String,
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  },
  { _id: false }
);

const cvSchema = new mongoose.Schema(
  {
    pelamar: { type: mongoose.Schema.Types.ObjectId, ref: 'Pelamar', required: true },
    sumber: { type: String, enum: ['manual', 'ai_parsed'], default: 'manual' },
    fileAsli: String, // path file CV yang diupload
    ringkasan: { type: String, default: '' },
    pendidikan: [pendidikanSchema],
    pengalaman: [pengalamanSchema],
    skills: [skillSchema],
    sertifikat: [
      {
        nama: String,
        penerbit: String,
        tahun: Number,
      },
    ],
    bahasa: [String],
  },
  { timestamps: true }
);

// Helper: total tahun pengalaman kerja
cvSchema.methods.totalPengalamanTahun = function () {
  if (!this.pengalaman?.length) return 0;
  const nowYear = new Date().getFullYear();
  return this.pengalaman.reduce((acc, p) => {
    const mulai = p.tahunMulai || nowYear;
    const selesai = p.tahunSelesai && p.tahunSelesai > 0 ? p.tahunSelesai : nowYear;
    return acc + Math.max(0, selesai - mulai);
  }, 0);
};

// Helper: skor pendidikan tertinggi
cvSchema.methods.skorPendidikan = function () {
  const map = { SD: 1, SMP: 2, 'SMA/SMK': 3, D3: 4, S1: 5, S2: 6, S3: 7 };
  if (!this.pendidikan?.length) return 0;
  return Math.max(...this.pendidikan.map((p) => map[p.jenjang] || 0));
};

module.exports = mongoose.model('CV', cvSchema);
