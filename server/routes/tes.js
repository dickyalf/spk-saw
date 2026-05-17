const router = require('express').Router();
const ctrl = require('../controllers/tesController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:lamaranId/soal', protect, authorize('pelamar'), ctrl.ambilSoal);
router.post('/:lamaranId/submit', protect, authorize('pelamar'), ctrl.submit);
router.get('/:lamaranId/jawaban', protect, authorize('perusahaan'), ctrl.jawabanPelamar);

module.exports = router;
