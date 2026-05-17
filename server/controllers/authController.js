const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Perusahaan = require('../models/Perusahaan');
const Pelamar = require('../models/Pelamar');
const { sign } = require('../utils/jwt');

const sendToken = (user, res, extra = {}) => {
  const token = sign({ id: user._id, role: user.role });
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      perusahaan: user.perusahaan,
      pelamar: user.pelamar,
    },
    ...extra,
  });
};

exports.registerValidators = [
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
];

exports.registerPerusahaan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, namaPerusahaan, industri, alamat, kota, nomorTelepon, website } =
      req.body;

    if (!namaPerusahaan)
      return res.status(400).json({ message: 'namaPerusahaan wajib diisi' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const user = await User.create({ email, password, role: 'perusahaan' });
    const perusahaan = await Perusahaan.create({
      user: user._id,
      namaPerusahaan,
      industri,
      alamat,
      kota,
      nomorTelepon,
      website,
    });
    user.perusahaan = perusahaan._id;
    await user.save();

    sendToken(user, res, { perusahaan });
  } catch (err) {
    next(err);
  }
};

exports.registerPelamar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      email,
      password,
      namaLengkap,
      nik,
      tanggalLahir,
      jenisKelamin,
      nomorTelepon,
      alamat,
      kota,
    } = req.body;

    if (!namaLengkap) return res.status(400).json({ message: 'namaLengkap wajib diisi' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const user = await User.create({ email, password, role: 'pelamar' });
    const pelamar = await Pelamar.create({
      user: user._id,
      namaLengkap,
      nik,
      tanggalLahir,
      jenisKelamin,
      nomorTelepon,
      alamat,
      kota,
    });
    user.pelamar = pelamar._id;
    await user.save();

    sendToken(user, res, { pelamar });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email & password wajib diisi' });

    const user = await User.findOne({ email })
      .select('+password')
      .populate('perusahaan')
      .populate('pelamar');
    if (!user) return res.status(401).json({ message: 'Akun tidak ditemukan' });
    if (!user.isActive) return res.status(403).json({ message: 'Akun nonaktif' });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Password salah' });

    user.lastLogin = new Date();
    await user.save();

    sendToken(user, res);
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('perusahaan')
      .populate({ path: 'pelamar', populate: { path: 'cv' } });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: 'oldPassword dan newPassword wajib' });
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'Password baru minimal 8 karakter' });

    const user = await User.findById(req.user._id).select('+password');
    const ok = await user.matchPassword(oldPassword);
    if (!ok) return res.status(400).json({ message: 'Password lama salah' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password berhasil diganti' });
  } catch (err) {
    next(err);
  }
};
