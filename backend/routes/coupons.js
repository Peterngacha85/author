const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  getCoupons,
  generateCoupons,
  redeemCoupon,
  deleteCoupon
} = require('../controllers/couponController');

router.post('/redeem', auth, redeemCoupon);
router.get('/', [auth, admin], getCoupons);
router.post('/generate', [auth, admin], generateCoupons);
router.delete('/:id', [auth, admin], deleteCoupon);

module.exports = router;
