const router = require('express').Router();
const ctrl = require('../controllers/lowonganController');
const { protect, authorize } = require('../middleware/auth');

// Publik (untuk pelamar browsing)
router.get('/', ctrl.listPublik);
router.get('/saya/list', protect, authorize('perusahaan'), ctrl.listMilikSaya);
router.get('/:id', ctrl.detail);

// Perusahaan
router.post('/', protect, authorize('perusahaan'), ctrl.create);
router.put('/:id', protect, authorize('perusahaan'), ctrl.update);
router.post('/:id/publish', protect, authorize('perusahaan'), ctrl.publish);
router.post('/:id/close', protect, authorize('perusahaan'), ctrl.close);
router.delete('/:id', protect, authorize('perusahaan'), ctrl.remove);
router.put('/:id/soal', protect, authorize('perusahaan'), ctrl.assignSoal);

module.exports = router;
