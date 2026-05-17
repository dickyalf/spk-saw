const Lowongan = require('../models/Lowongan');
const Perusahaan = require('../models/Perusahaan');
const Kriteria = require('../models/Kriteria');

// Public — list lowongan published
exports.listPublik = async (req, res, next) => {
  try {
    const { q, lokasi, tipeKerja } = req.query;
    const filter = { status: 'published' };
    if (q) filter.$or = [{ judul: new RegExp(q, 'i') }, { posisi: new RegExp(q, 'i') }];
    if (lokasi) filter.lokasi = new RegExp(lokasi, 'i');
    if (tipeKerja) filter.tipeKerja = tipeKerja;

    const lowongan = await Lowongan.find(filter)
      .populate('perusahaan', 'namaPerusahaan logo industri kota')
      .sort('-createdAt');
    res.json(lowongan);
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const lowongan = await Lowongan.findById(req.params.id).populate(
      'perusahaan',
      'namaPerusahaan logo industri kota deskripsi website'
    );
    if (!lowongan) return res.status(404).json({ message: 'Lowongan tidak ditemukan' });
    res.json(lowongan);
  } catch (err) {
    next(err);
  }
};

// Perusahaan — CRUD
exports.listMilikSaya = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const list = await Lowongan.find({ perusahaan: perusahaan._id }).sort('-createdAt');
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const data = { ...req.body, perusahaan: perusahaan._id };
    const lowongan = await Lowongan.create(data);

    // Auto-buat 4 kriteria default sesuai proposal Bab 1.5
    const defaults = [
      { kode: 'C1', nama: 'Pendidikan',  bobot: 0.20, tipe: 'benefit', kategori: 'pendidikan' },
      { kode: 'C2', nama: 'Pengalaman Kerja', bobot: 0.30, tipe: 'benefit', kategori: 'pengalaman' },
      { kode: 'C3', nama: 'Hasil Tes',  bobot: 0.25, tipe: 'benefit', kategori: 'tes' },
      { kode: 'C4', nama: 'Wawancara',  bobot: 0.25, tipe: 'benefit', kategori: 'wawancara' },
    ];
    await Kriteria.insertMany(
      defaults.map((d) => ({ ...d, perusahaan: perusahaan._id, lowongan: lowongan._id }))
    );

    res.status(201).json(lowongan);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const lowongan = await Lowongan.findOneAndUpdate(
      { _id: req.params.id, perusahaan: perusahaan._id },
      req.body,
      { new: true }
    );
    if (!lowongan) return res.status(404).json({ message: 'Lowongan tidak ditemukan' });
    res.json(lowongan);
  } catch (err) {
    next(err);
  }
};

exports.publish = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const lowongan = await Lowongan.findOneAndUpdate(
      { _id: req.params.id, perusahaan: perusahaan._id },
      { status: 'published' },
      { new: true }
    );
    if (!lowongan) return res.status(404).json({ message: 'Lowongan tidak ditemukan' });
    res.json(lowongan);
  } catch (err) {
    next(err);
  }
};

exports.close = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const lowongan = await Lowongan.findOneAndUpdate(
      { _id: req.params.id, perusahaan: perusahaan._id },
      { status: 'closed' },
      { new: true }
    );
    res.json(lowongan);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const lowongan = await Lowongan.findOneAndDelete({
      _id: req.params.id,
      perusahaan: perusahaan._id,
    });
    if (!lowongan) return res.status(404).json({ message: 'Lowongan tidak ditemukan' });
    await Kriteria.deleteMany({ lowongan: req.params.id });
    res.json({ message: 'Lowongan dihapus' });
  } catch (err) {
    next(err);
  }
};

exports.assignSoal = async (req, res, next) => {
  try {
    const { soalIds } = req.body; // array of SoalTes ids
    const perusahaan = await Perusahaan.findOne({ user: req.user._id });
    const lowongan = await Lowongan.findOneAndUpdate(
      { _id: req.params.id, perusahaan: perusahaan._id },
      { soalTes: soalIds },
      { new: true }
    ).populate('soalTes');
    res.json(lowongan);
  } catch (err) {
    next(err);
  }
};
