const Perusahaan = require('../models/Perusahaan');

exports.getProfil = async (req, res, next) => {
  try {
    const p = await Perusahaan.findOne({ user: req.user._id });
    res.json(p);
  } catch (err) {
    next(err);
  }
};

exports.updateProfil = async (req, res, next) => {
  try {
    const allowed = [
      'namaPerusahaan',
      'industri',
      'alamat',
      'kota',
      'nomorTelepon',
      'website',
      'deskripsi',
    ];
    const patch = {};
    for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];

    const p = await Perusahaan.findOneAndUpdate({ user: req.user._id }, patch, {
      new: true,
    });
    res.json(p);
  } catch (err) {
    next(err);
  }
};

exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File logo wajib' });
    const p = await Perusahaan.findOneAndUpdate(
      { user: req.user._id },
      { logo: `/uploads/${req.file.filename}` },
      { new: true }
    );
    res.json(p);
  } catch (err) {
    next(err);
  }
};
