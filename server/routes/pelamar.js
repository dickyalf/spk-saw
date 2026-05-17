const router = require('express').Router();
const ctrl = require('../controllers/pelamarController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect, authorize('pelamar'));

router.get('/profil', ctrl.getProfil);
router.put('/profil', ctrl.updateProfil);
router.post('/foto', upload.single('foto'), ctrl.uploadFoto);

module.exports = router;
