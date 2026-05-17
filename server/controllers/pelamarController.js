const Pelamar = require('../models/Pelamar');

exports.getProfil = async (req, res, next) => {
  try {
    const p = await Pelamar.findOne({ user: req.user._id }).populate('cv');
    res.json(p);
  } catch (err) {
    next(err);
  }
};

exports.updateProfil = async (req, res, next) => {
  try {
    const allowed = [
      'namaLengkap',
      'nik',
      'tanggalLahir',
      'jenisKelamin',
      'nomorTelepon',
      'alamat',
      'kota',
    ];
    const patch = {};
    for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];

    const p = await Pelamar.findOneAndUpdate({ user: req.user._id }, patch, { new: true });
    res.json(p);
  } catch (err) {
    next(err);
  }
};

exports.uploadFoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File foto wajib' });
    const p = await Pelamar.findOneAndUpdate(
      { user: req.user._id },
      { foto: `/uploads/${req.file.filename}` },
      { new: true }
    );
    res.json(p);
  } catch (err) {
    next(err);
  }
};
