const SoalTes = require('../models/SoalTes');
const Perusahaan = require('../models/Perusahaan');

exports.list = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const items = await SoalTes.find({ perusahaan: perusahaan._id }).sort('-createdAt');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const soal = await SoalTes.create({ ...req.body, perusahaan: perusahaan._id });
    res.status(201).json(soal);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const soal = await SoalTes.findOneAndUpdate(
      { _id: req.params.id, perusahaan: perusahaan._id },
      req.body,
      { new: true }
    );
    if (!soal) return res.status(404).json({ message: 'Soal tidak ditemukan' });
    res.json(soal);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const soal = await SoalTes.findOneAndDelete({
      _id: req.params.id,
      perusahaan: perusahaan._id,
    });
    if (!soal) return res.status(404).json({ message: 'Soal tidak ditemukan' });
    res.json({ message: 'Soal dihapus' });
  } catch (err) {
    next(err);
  }
};
