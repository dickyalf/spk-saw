const Notifikasi = require('../models/Notifikasi');

exports.list = async (req, res, next) => {
  try {
    const items = await Notifikasi.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(100);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const n = await Notifikasi.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { dibaca: true },
      { new: true }
    );
    res.json(n);
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notifikasi.updateMany({ user: req.user._id, dibaca: false }, { dibaca: true });
    res.json({ message: 'Semua notifikasi ditandai dibaca' });
  } catch (err) {
    next(err);
  }
};
