const User = require('../models/User');
const Perusahaan = require('../models/Perusahaan');
const Pelamar = require('../models/Pelamar');
const Lowongan = require('../models/Lowongan');
const Lamaran = require('../models/Lamaran');

exports.statistik = async (req, res, next) => {
  try {
    const [totalUser, totalPerusahaan, totalPelamar, totalLowongan, totalLamaran] =
      await Promise.all([
        User.countDocuments(),
        Perusahaan.countDocuments(),
        Pelamar.countDocuments(),
        Lowongan.countDocuments(),
        Lamaran.countDocuments(),
      ]);
    res.json({ totalUser, totalPerusahaan, totalPelamar, totalLowongan, totalLamaran });
  } catch (err) {
    next(err);
  }
};

exports.listPerusahaan = async (req, res, next) => {
  try {
    const items = await Perusahaan.find()
      .populate('user', 'email isActive lastLogin')
      .sort('-createdAt');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.verifikasiPerusahaan = async (req, res, next) => {
  try {
    const { statusVerifikasi } = req.body;
    const p = await Perusahaan.findByIdAndUpdate(
      req.params.id,
      { statusVerifikasi },
      { new: true }
    );
    res.json(p);
  } catch (err) {
    next(err);
  }
};

exports.listPelamar = async (req, res, next) => {
  try {
    const items = await Pelamar.find()
      .populate('user', 'email isActive lastLogin')
      .sort('-createdAt');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
};
