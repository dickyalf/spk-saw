const router = require('express').Router();
const ctrl = require('../controllers/lamaranController');
const { protect, authorize } = require('../middleware/auth');

// Pelamar
router.post('/:lowonganId', protect, authorize('pelamar'), ctrl.lamar);
router.get('/saya', protect, authorize('pelamar'), ctrl.lamaranSaya);
router.get('/saya/:id', protect, authorize('pelamar'), ctrl.detailLamaranSaya);

// Perusahaan
router.get(
  '/lowongan/:lowonganId',
  protect,
  authorize('perusahaan'),
  ctrl.pelamarMasuk
);
router.put(
  '/:id/tahap/:tahap',
  protect,
  authorize('perusahaan'),
  ctrl.updateStatusTahap
);
router.put('/:id/finalisasi', protect, authorize('perusahaan'), ctrl.finalisasi);

module.exports = router;
