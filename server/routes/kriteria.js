const router = require('express').Router();
const ctrl = require('../controllers/kriteriaController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('perusahaan'));

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/bobot-batch', ctrl.updateBobotBatch);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
