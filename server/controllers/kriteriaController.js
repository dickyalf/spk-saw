const Kriteria = require('../models/Kriteria');
const Perusahaan = require('../models/Perusahaan');

exports.list = async (req, res, next) => {
  try {
    const { lowonganId } = req.query;
    const filter = {};
    if (lowonganId) filter.lowongan = lowonganId;
    const items = await Kriteria.find(filter).sort('kode');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const data = { ...req.body, perusahaan: perusahaan._id };
    const k = await Kriteria.create(data);
    res.status(201).json(k);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const k = await Kriteria.findOneAndUpdate(
      { _id: req.params.id, perusahaan: perusahaan._id },
      req.body,
      { new: true }
    );
    if (!k) return res.status(404).json({ message: 'Kriteria tidak ditemukan' });
    res.json(k);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const k = await Kriteria.findOneAndDelete({
      _id: req.params.id,
      perusahaan: perusahaan._id,
    });
    if (!k) return res.status(404).json({ message: 'Kriteria tidak ditemukan' });
    res.json({ message: 'Dihapus' });
  } catch (err) {
    next(err);
  }
};

// Batch update bobot — perusahaan ngedrag slider untuk semua kriteria sekaligus
exports.updateBobotBatch = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ id, bobot }]
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const ops = items.map((i) =>
      Kriteria.findOneAndUpdate(
        { _id: i.id, perusahaan: perusahaan._id },
        { bobot: i.bobot },
        { new: true }
      )
    );
    const result = await Promise.all(ops);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
