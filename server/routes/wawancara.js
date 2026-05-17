const router = require('express').Router();
const ctrl = require('../controllers/wawancaraController');
const { protect, authorize } = require('../middleware/auth');

router.post(
  '/:lamaranId/jadwal',
  protect,
  authorize('perusahaan'),
  ctrl.jadwalkan
);
router.put('/:lamaranId/nilai', protect, authorize('perusahaan'), ctrl.nilai);
router.get('/:lamaranId', protect, ctrl.detail);

module.exports = router;
