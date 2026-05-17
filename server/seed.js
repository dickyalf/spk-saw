/**
 * Seed database dengan data contoh: 1 admin, 2 perusahaan, 5 pelamar,
 * beberapa lowongan, kriteria, soal tes, dan lamaran.
 *
 * Jalankan dengan: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Perusahaan = require('./models/Perusahaan');
const Pelamar = require('./models/Pelamar');
const CV = require('./models/CV');
const Lowongan = require('./models/Lowongan');
const Kriteria = require('./models/Kriteria');
const SoalTes = require('./models/SoalTes');
const Lamaran = require('./models/Lamaran');

async function run() {
  await connectDB();
  console.log('🧹 Menghapus data lama...');
  await Promise.all([
    User.deleteMany({}),
    Perusahaan.deleteMany({}),
    Pelamar.deleteMany({}),
    CV.deleteMany({}),
    Lowongan.deleteMany({}),
    Kriteria.deleteMany({}),
    SoalTes.deleteMany({}),
    Lamaran.deleteMany({}),
  ]);

  console.log('👤 Membuat admin...');
  const admin = await User.create({
    email: 'admin@spk-saw.com',
    password: 'admin12345',
    role: 'admin',
  });

  console.log('🏢 Membuat perusahaan...');
  const userP1 = await User.create({
    email: 'hr@techcorp.com',
    password: 'pass12345',
    role: 'perusahaan',
  });
  const techcorp = await Perusahaan.create({
    user: userP1._id,
    namaPerusahaan: 'TechCorp Indonesia',
    industri: 'Teknologi Informasi',
    alamat: 'Jl. Sudirman No. 1',
    kota: 'Surabaya',
    nomorTelepon: '081234567890',
    website: 'https://techcorp.example.com',
    deskripsi: 'Perusahaan IT yang bergerak di bidang software development',
    statusVerifikasi: 'verified',
  });
  userP1.perusahaan = techcorp._id;
  await userP1.save();

  const userP2 = await User.create({
    email: 'hrd@finansa.com',
    password: 'pass12345',
    role: 'perusahaan',
  });
  const finansa = await Perusahaan.create({
    user: userP2._id,
    namaPerusahaan: 'Finansa Group',
    industri: 'Keuangan',
    alamat: 'Jl. Diponegoro No. 99',
    kota: 'Surabaya',
    nomorTelepon: '081298765432',
    statusVerifikasi: 'verified',
  });
  userP2.perusahaan = finansa._id;
  await userP2.save();

  console.log('🧑 Membuat pelamar...');
  const pelamarData = [
    {
      email: 'andi@mail.com',
      nama: 'Andi Wijaya',
      pendidikan: [{ jenjang: 'S1', institusi: 'Universitas Ciputra', jurusan: 'Informatika', tahunMasuk: 2018, tahunLulus: 2022, ipk: 3.65 }],
      pengalaman: [{ perusahaan: 'PT Alpha', posisi: 'Junior Dev', tahunMulai: 2022, tahunSelesai: 2025, deskripsi: 'Web dev' }],
      skills: [{ nama: 'JavaScript', level: 'advanced' }, { nama: 'React', level: 'intermediate' }],
    },
    {
      email: 'budi@mail.com',
      nama: 'Budi Santoso',
      pendidikan: [{ jenjang: 'S2', institusi: 'ITS', jurusan: 'Teknik Informatika', tahunMasuk: 2020, tahunLulus: 2022, ipk: 3.80 }],
      pengalaman: [{ perusahaan: 'PT Beta', posisi: 'Software Engineer', tahunMulai: 2022, tahunSelesai: 2023, deskripsi: 'Backend' }],
      skills: [{ nama: 'Node.js', level: 'expert' }, { nama: 'MongoDB', level: 'advanced' }],
    },
    {
      email: 'citra@mail.com',
      nama: 'Citra Lestari',
      pendidikan: [{ jenjang: 'S1', institusi: 'Universitas Airlangga', jurusan: 'Sistem Informasi', tahunMasuk: 2017, tahunLulus: 2021, ipk: 3.50 }],
      pengalaman: [
        { perusahaan: 'PT Gamma', posisi: 'Frontend Dev', tahunMulai: 2021, tahunSelesai: 2023 },
        { perusahaan: 'PT Delta', posisi: 'Senior Frontend', tahunMulai: 2023, tahunSelesai: 2026 },
      ],
      skills: [{ nama: 'React', level: 'expert' }, { nama: 'TypeScript', level: 'advanced' }],
    },
    {
      email: 'dewi@mail.com',
      nama: 'Dewi Pratiwi',
      pendidikan: [{ jenjang: 'D3', institusi: 'Politeknik Negeri', jurusan: 'Komputer', tahunMasuk: 2019, tahunLulus: 2022, ipk: 3.40 }],
      pengalaman: [{ perusahaan: 'PT Epsilon', posisi: 'QA', tahunMulai: 2022, tahunSelesai: 2024 }],
      skills: [{ nama: 'Testing', level: 'intermediate' }],
    },
    {
      email: 'eko@mail.com',
      nama: 'Eko Prasetyo',
      pendidikan: [{ jenjang: 'S1', institusi: 'UGM', jurusan: 'Ilmu Komputer', tahunMasuk: 2016, tahunLulus: 2020, ipk: 3.75 }],
      pengalaman: [
        { perusahaan: 'PT Zeta', posisi: 'Junior Dev', tahunMulai: 2020, tahunSelesai: 2022 },
        { perusahaan: 'PT Eta', posisi: 'Tech Lead', tahunMulai: 2022, tahunSelesai: 2026 },
      ],
      skills: [{ nama: 'JavaScript', level: 'expert' }, { nama: 'AWS', level: 'advanced' }],
    },
  ];

  const pelamarList = [];
  for (const p of pelamarData) {
    const user = await User.create({ email: p.email, password: 'pass12345', role: 'pelamar' });
    const pelamar = await Pelamar.create({
      user: user._id,
      namaLengkap: p.nama,
      nomorTelepon: '0812' + Math.floor(Math.random() * 100000000),
      kota: 'Surabaya',
    });
    const cv = await CV.create({
      pelamar: pelamar._id,
      sumber: 'manual',
      ringkasan: `${p.nama} adalah profesional berpengalaman.`,
      pendidikan: p.pendidikan,
      pengalaman: p.pengalaman,
      skills: p.skills,
    });
    pelamar.cv = cv._id;
    await pelamar.save();
    user.pelamar = pelamar._id;
    await user.save();
    pelamarList.push({ user, pelamar, cv });
  }

  console.log('📝 Membuat soal tes...');
  const soalList = await SoalTes.insertMany([
    {
      perusahaan: techcorp._id,
      pertanyaan: 'Apa output dari: console.log(typeof null)?',
      pilihan: [
        { teks: '"null"', kunci: false },
        { teks: '"object"', kunci: true },
        { teks: '"undefined"', kunci: false },
        { teks: 'Error', kunci: false },
      ],
      bobotNilai: 1,
      kategori: 'teknis',
    },
    {
      perusahaan: techcorp._id,
      pertanyaan: 'HTTP status code untuk Not Found adalah?',
      pilihan: [
        { teks: '200', kunci: false },
        { teks: '301', kunci: false },
        { teks: '404', kunci: true },
        { teks: '500', kunci: false },
      ],
      bobotNilai: 1,
      kategori: 'teknis',
    },
    {
      perusahaan: techcorp._id,
      pertanyaan: 'Database NoSQL yang paling populer adalah?',
      pilihan: [
        { teks: 'MySQL', kunci: false },
        { teks: 'PostgreSQL', kunci: false },
        { teks: 'MongoDB', kunci: true },
        { teks: 'Oracle', kunci: false },
      ],
      bobotNilai: 1,
      kategori: 'teknis',
    },
  ]);

  console.log('💼 Membuat lowongan + kriteria...');
  const lowongan1 = await Lowongan.create({
    perusahaan: techcorp._id,
    judul: 'Junior Full Stack Developer',
    posisi: 'Full Stack Developer',
    deskripsi: 'Mengembangkan aplikasi web menggunakan MERN stack.',
    kualifikasi: 'S1 Informatika/sejenis, paham JavaScript, React, Node.js, MongoDB',
    tanggungJawab: 'Mendevelop fitur baru, maintain codebase, kolaborasi dengan tim.',
    lokasi: 'Surabaya',
    tipeKerja: 'fulltime',
    gajiMin: 7000000,
    gajiMax: 12000000,
    batasPendaftaran: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    kuota: 2,
    status: 'published',
    soalTes: soalList.map((s) => s._id),
    durasiTesMenit: 30,
    nilaiMinimumTes: 50,
  });

  await Kriteria.insertMany([
    { perusahaan: techcorp._id, lowongan: lowongan1._id, kode: 'C1', nama: 'Pendidikan', bobot: 0.20, tipe: 'benefit', kategori: 'pendidikan' },
    { perusahaan: techcorp._id, lowongan: lowongan1._id, kode: 'C2', nama: 'Pengalaman Kerja', bobot: 0.30, tipe: 'benefit', kategori: 'pengalaman' },
    { perusahaan: techcorp._id, lowongan: lowongan1._id, kode: 'C3', nama: 'Hasil Tes', bobot: 0.25, tipe: 'benefit', kategori: 'tes' },
    { perusahaan: techcorp._id, lowongan: lowongan1._id, kode: 'C4', nama: 'Wawancara', bobot: 0.25, tipe: 'benefit', kategori: 'wawancara' },
  ]);

  const lowongan2 = await Lowongan.create({
    perusahaan: finansa._id,
    judul: 'Staff Accounting',
    posisi: 'Accounting Staff',
    deskripsi: 'Membantu proses pencatatan keuangan.',
    kualifikasi: 'D3/S1 Akuntansi, paham PSAK, jujur dan teliti',
    lokasi: 'Surabaya',
    tipeKerja: 'fulltime',
    gajiMin: 5000000,
    gajiMax: 8000000,
    status: 'published',
  });

  console.log('📨 Membuat lamaran contoh...');
  for (let i = 0; i < pelamarList.length; i++) {
    const { pelamar, cv } = pelamarList[i];
    await Lamaran.create({
      pelamar: pelamar._id,
      lowongan: lowongan1._id,
      cvSnapshot: cv._id,
      suratLamaran: `Saya, ${pelamar.namaLengkap}, tertarik melamar posisi ini.`,
      statusKeseluruhan: i < 3 ? 'ranking' : 'administrasi',
      administrasi: { status: 'lolos', nilai: 80, diperbaruiPada: new Date() },
      tes: i < 3 ? { status: 'lolos', nilai: 75 + i * 5, diperbaruiPada: new Date() } : { status: 'belum' },
      wawancara: i < 3 ? { status: 'lolos', nilai: 80 + i * 3, diperbaruiPada: new Date() } : { status: 'belum' },
    });
  }

  console.log('✅ Seed selesai!');
  console.log('   Admin:      admin@spk-saw.com / admin12345');
  console.log('   Perusahaan: hr@techcorp.com / pass12345');
  console.log('   Perusahaan: hrd@finansa.com / pass12345');
  console.log('   Pelamar:    andi@mail.com / pass12345 (dan 4 lain)');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
