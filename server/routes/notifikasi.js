const router = require('express').Router();
const ctrl = require('../controllers/notifikasiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.list);
router.put('/baca-semua', ctrl.markAllRead);
router.put('/:id/baca', ctrl.markRead);

module.exports = router;
