const router = require('express').Router();
const ctrl = require('../controllers/rankingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:lowonganId', protect, authorize('perusahaan'), ctrl.hitung);

module.exports = router;
