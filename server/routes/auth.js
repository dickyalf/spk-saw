const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register/perusahaan', ctrl.registerValidators, ctrl.registerPerusahaan);
router.post('/register/pelamar', ctrl.registerValidators, ctrl.registerPelamar);
router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.me);
router.put('/change-password', protect, ctrl.changePassword);

module.exports = router;
