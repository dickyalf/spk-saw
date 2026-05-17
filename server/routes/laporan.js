const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const Perusahaan = require('../models/Perusahaan');
const Lowongan = require('../models/Lowongan');
const { rankingLowongan } = require('../services/rankingService');
const { streamLaporanSAW } = require('../services/pdfReportService');

router.get(
  '/lowongan/:id/pdf',
  protect,
  authorize('perusahaan'),
  async (req, res, next) => {
    try {
      const perusahaan = await Perusahaan.findOne({ user: req.user._id });
      const lowongan = await Lowongan.findOne({
        _id: req.params.id,
        perusahaan: perusahaan._id,
      });
      if (!lowongan)
        return res.status(404).json({ message: 'Lowongan tidak ditemukan' });

      const { kriteria, hasil } = await rankingLowongan(lowongan._id);
      streamLaporanSAW({ lowongan, perusahaan, kriteria, hasil }, res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
