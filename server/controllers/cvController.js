const CV = require('../models/CV');
const Pelamar = require('../models/Pelamar');
const { parseCVdariFile } = require('../services/geminiService');

exports.getMyCV = async (req, res, next) => {
  try {
    const pelamar = await Pelamar.findOne({ user: req.user._id });
    const cv = await CV.findOne({ pelamar: pelamar._id });
    res.json(cv);
  } catch (err) {
    next(err);
  }
};

exports.upsertManual = async (req, res, next) => {
  try {
    const pelamar = await Pelamar.findOne({ user: req.user._id });
    const data = {
      pelamar: pelamar._id,
      sumber: 'manual',
      ringkasan: req.body.ringkasan || '',
      pendidikan: req.body.pendidikan || [],
      pengalaman: req.body.pengalaman || [],
      skills: req.body.skills || [],
      sertifikat: req.body.sertifikat || [],
      bahasa: req.body.bahasa || [],
    };

    let cv = await CV.findOne({ pelamar: pelamar._id });
    if (cv) {
      Object.assign(cv, data);
      await cv.save();
    } else {
      cv = await CV.create(data);
      pelamar.cv = cv._id;
      await pelamar.save();
    }
    res.json(cv);
  } catch (err) {
    next(err);
  }
};

exports.uploadDanParse = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'File CV wajib diupload' });

    const pelamar = await Pelamar.findOne({ user: req.user._id });
    const filePath = req.file.path;

    const parsed = await parseCVdariFile(filePath);
    const data = {
      pelamar: pelamar._id,
      fileAsli: `/uploads/${req.file.filename}`,
      sumber: parsed.sumber || 'ai_parsed',
      ringkasan: parsed.ringkasan || '',
      pendidikan: parsed.pendidikan || [],
      pengalaman: parsed.pengalaman || [],
      skills: parsed.skills || [],
      sertifikat: parsed.sertifikat || [],
      bahasa: parsed.bahasa || [],
    };

    let cv = await CV.findOne({ pelamar: pelamar._id });
    if (cv) {
      Object.assign(cv, data);
      await cv.save();
    } else {
      cv = await CV.create(data);
      pelamar.cv = cv._id;
      await pelamar.save();
    }
    res.json({
      message: 'CV berhasil di-upload dan diparsing',
      cv,
    });
  } catch (err) {
    next(err);
  }
};
