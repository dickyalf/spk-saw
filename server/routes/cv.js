const router = require('express').Router();
const ctrl = require('../controllers/cvController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect, authorize('pelamar'));

router.get('/me', ctrl.getMyCV);
router.put('/manual', ctrl.upsertManual);
router.post('/upload', upload.single('cv'), ctrl.uploadDanParse);

module.exports = router;
