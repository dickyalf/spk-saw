const Lamaran = require('../models/Lamaran');
const Pelamar = require('../models/Pelamar');
const Perusahaan = require('../models/Perusahaan');
const Lowongan = require('../models/Lowongan');
const CV = require('../models/CV');
const { buatNotifikasi } = require('../services/notifikasiService');

/** Pelamar: kirim lamaran */
exports.lamar = async (req, res, next) => {
  try {
    const pelamar = await Pelamar.findOne({ user: req.user._id });
    const cv = await CV.findOne({ pelamar: pelamar._id });
    if (!cv)
      return res
        .status(400)
        .json({ message: 'Lengkapi CV Anda terlebih dahulu sebelum melamar' });

    const lowongan = await Lowongan.findById(req.params.lowonganId);
    if (!lowongan || lowongan.status !== 'published')
      return res.status(400).json({ message: 'Lowongan tidak tersedia' });

    const existing = await Lamaran.findOne({
      pelamar: pelamar._id,
      lowongan: lowongan._id,
    });
    if (existing) return res.status(400).json({ message: 'Anda sudah melamar lowongan ini' });

    const lamaran = await Lamaran.create({
      pelamar: pelamar._id,
      lowongan: lowongan._id,
      cvSnapshot: cv._id,
      suratLamaran: req.body.suratLamaran,
      statusKeseluruhan: 'menunggu',
      administrasi: { status: 'belum' },
      tes: { status: 'belum' },
      wawancara: { status: 'belum' },
    });

    await buatNotifikasi({
      userId: req.user._id,
      email: req.user.email,
      judul: 'Lamaran berhasil dikirim',
      pesan: `Lamaran Anda untuk posisi ${lowongan.posisi} di ${lowongan.judul} telah dikirim.`,
      tipe: 'sukses',
      link: `/pelamar/lamaran/${lamaran._id}`,
    });

    res.status(201).json(lamaran);
  } catch (err) {
    next(err);
  }
};

/** Pelamar: list lamaran saya */
exports.lamaranSaya = async (req, res, next) => {
  try {
    const pelamar = await Pelamar.findOne({ user: req.user._id });
    const items = await Lamaran.find({ pelamar: pelamar._id })
      .populate('lowongan')
      .sort('-createdAt');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.detailLamaranSaya = async (req, res, next) => {
  try {
    const pelamar = await Pelamar.findOne({ user: req.user._id });
    const lamaran = await Lamaran.findOne({ _id: req.params.id, pelamar: pelamar._id })
      .populate({ path: 'lowongan', populate: { path: 'perusahaan' } })
      .populate('cvSnapshot');
    if (!lamaran) return res.status(404).json({ message: 'Lamaran tidak ditemukan' });
    res.json(lamaran);
  } catch (err) {
    next(err);
  }
};

/** Perusahaan: list pelamar masuk per lowongan */
exports.pelamarMasuk = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const lowongan = await Lowongan.findOne({
      _id: req.params.lowonganId,
      perusahaan: perusahaan._id,
    });
    if (!lowongan) return res.status(404).json({ message: 'Lowongan tidak ditemukan' });

    const items = await Lamaran.find({ lowongan: lowongan._id })
      .populate({ path: 'pelamar', populate: { path: 'user', select: 'email' } })
      .populate('cvSnapshot')
      .sort('-createdAt');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/** Perusahaan: ubah status tahap (administrasi/tes/wawancara) */
exports.updateStatusTahap = async (req, res, next) => {
  try {
    const { tahap } = req.params; // 'administrasi' | 'tes' | 'wawancara'
    const { status, nilai, catatan } = req.body;
    if (!['administrasi', 'tes', 'wawancara'].includes(tahap))
      return res.status(400).json({ message: 'Tahap tidak valid' });

    const lamaran = await Lamaran.findById(req.params.id).populate({
      path: 'pelamar',
      populate: { path: 'user' },
    });
    if (!lamaran) return res.status(404).json({ message: 'Lamaran tidak ditemukan' });

    lamaran[tahap] = {
      status,
      nilai: nilai ?? lamaran[tahap]?.nilai,
      catatan: catatan ?? lamaran[tahap]?.catatan,
      diperbaruiPada: new Date(),
    };

    // Sync statusKeseluruhan otomatis
    if (status === 'tidak_lolos') lamaran.statusKeseluruhan = 'ditolak';
    else if (tahap === 'administrasi' && status === 'lolos') lamaran.statusKeseluruhan = 'tes';
    else if (tahap === 'tes' && status === 'lolos') lamaran.statusKeseluruhan = 'wawancara';
    else if (tahap === 'wawancara' && status === 'lolos') lamaran.statusKeseluruhan = 'ranking';

    await lamaran.save();

    await buatNotifikasi({
      userId: lamaran.pelamar.user._id,
      email: lamaran.pelamar.user.email,
      judul: `Update tahap ${tahap}`,
      pesan: `Status tahap ${tahap} Anda diperbarui menjadi ${status}.`,
      tipe: status === 'lolos' ? 'sukses' : status === 'tidak_lolos' ? 'gagal' : 'info',
      link: `/pelamar/lamaran/${lamaran._id}`,
    });

    res.json(lamaran);
  } catch (err) {
    next(err);
  }
};

/** Perusahaan: finalisasi keputusan (diterima/ditolak) berdasar ranking SAW */
exports.finalisasi = async (req, res, next) => {
  try {
    const { keputusan } = req.body; // 'diterima' | 'ditolak'
    if (!['diterima', 'ditolak'].includes(keputusan))
      return res.status(400).json({ message: 'Keputusan tidak valid' });

    const lamaran = await Lamaran.findById(req.params.id).populate({
      path: 'pelamar',
      populate: { path: 'user' },
    });
    if (!lamaran) return res.status(404).json({ message: 'Lamaran tidak ditemukan' });

    lamaran.statusKeseluruhan = keputusan;
    await lamaran.save();

    await buatNotifikasi({
      userId: lamaran.pelamar.user._id,
      email: lamaran.pelamar.user.email,
      judul: keputusan === 'diterima' ? 'Selamat! Anda diterima' : 'Hasil seleksi',
      pesan:
        keputusan === 'diterima'
          ? 'Selamat, Anda dinyatakan LOLOS seleksi. Tim HRD akan menghubungi Anda untuk tahap berikutnya.'
          : 'Mohon maaf, Anda belum lolos seleksi pada lowongan ini. Tetap semangat!',
      tipe: keputusan === 'diterima' ? 'sukses' : 'gagal',
      link: `/pelamar/lamaran/${lamaran._id}`,
    });

    res.json(lamaran);
  } catch (err) {
    next(err);
  }
};
