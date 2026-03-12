const express = require('express');
const router = express.Router();
const { submitPayment, verifyPayment, stkPush, getAllPayments, handleCallback, checkStatus } = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * @swagger
 * /api/payments/manual:
 *   post:
 *     summary: Submit manual M-Pesa code
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Payment submitted
 */
router.post('/manual', auth, submitPayment);

/**
 * @swagger
 * /api/payments/stk:
 *   post:
 *     summary: Initiate STK Push (Dynamic Price)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: STK Push initiated
 */
router.post('/stk', auth, stkPush);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify/Reject payment (Admin Only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post('/verify', [auth, admin], verifyPayment);

/**
 * @swagger
 * /api/payments/all:
 *   get:
 *     summary: Get all payments (Admin Only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All transactions
 */
router.get('/all', [auth, admin], getAllPayments);

router.post('/callback', handleCallback);
router.get('/status/:checkoutRequestId', auth, checkStatus);

module.exports = router;

