const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/statistik', ctrl.statistik);
router.get('/perusahaan', ctrl.listPerusahaan);
router.put('/perusahaan/:id/verifikasi', ctrl.verifikasiPerusahaan);
router.get('/pelamar', ctrl.listPelamar);
router.put('/user/:id/toggle', ctrl.toggleUser);

module.exports = router;
