const express = require('express');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();
const {
	getTokens,
	updateTokenById,
	updateNotCurrent,
	updateToken,
	updateAll,
} = require('../controllers/token');

router.use(protect);
// router.use(authorize('admin', 'candidate'));

router.route('/').get(getTokens);
router.route('/all').get(updateAll);
router.route('/notCurrent').get(updateNotCurrent);
router.route('/:id').get(updateTokenById);
router.route('/:userId/:id').patch(updateToken);

module.exports = router;
