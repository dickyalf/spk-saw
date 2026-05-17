const Perusahaan = require('../models/Perusahaan');
const Lowongan = require('../models/Lowongan');
const { rankingLowongan } = require('../services/rankingService');

exports.hitung = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const lowongan = await Lowongan.findOne({
      _id: req.params.lowonganId,
      perusahaan: perusahaan._id,
    });
    if (!lowongan) return res.status(404).json({ message: 'Lowongan tidak ditemukan' });

    const result = await rankingLowongan(lowongan._id);
    res.json({
      lowongan: { id: lowongan._id, judul: lowongan.judul, posisi: lowongan.posisi },
      kriteria: result.kriteria,
      hasil: result.hasil,
    });
  } catch (err) {
    next(err);
  } 
};
