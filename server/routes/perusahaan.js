const router = require('express').Router();
const ctrl = require('../controllers/perusahaanController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect, authorize('perusahaan'));

router.get('/profil', ctrl.getProfil);
router.put('/profil', ctrl.updateProfil);
router.post('/logo', upload.single('logo'), ctrl.uploadLogo);

module.exports = router;
