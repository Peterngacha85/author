const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserAccess, deleteBook } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', [auth, admin], getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/toggle:
 *   put:
 *     summary: Toggle user access
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated access status
 */
router.put('/users/:id/toggle', [auth, admin], toggleUserAccess);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Book deleted
 */
router.delete('/books/:id', [auth, admin], deleteBook);

module.exports = router;
