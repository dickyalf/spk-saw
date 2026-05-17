const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Format email tidak valid'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['admin', 'perusahaan', 'pelamar'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    // Relasi ke profil lengkap (Perusahaan / Pelamar) — diisi sesuai role
    perusahaan: { type: mongoose.Schema.Types.ObjectId, ref: 'Perusahaan' },
    pelamar: { type: mongoose.Schema.Types.ObjectId, ref: 'Pelamar' },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Hash password sebelum save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
