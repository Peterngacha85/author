const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, uploadPhoto } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { uploadProfile } = require('../utils/cloudinary');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post('/register', uploadProfile.single('photo'), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/me', auth, getMe);

/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.put('/update', auth, updateProfile);

/**
 * @swagger
 * /api/auth/upload-photo:
 *   post:
 *     summary: Upload profile photo
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/upload-photo', auth, uploadProfile.single('photo'), uploadPhoto);

module.exports = router;
