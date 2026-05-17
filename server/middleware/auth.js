const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'Token tidak ada' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User tidak ditemukan' });
    if (!user.isActive) return res.status(403).json({ message: 'Akun nonaktif' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Belum login' });
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: `Role ${req.user.role} tidak diizinkan` });
  }
  next();
};
