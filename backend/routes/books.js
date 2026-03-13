const express = require('express');
const router = express.Router();
const { 
  createBook, addChapter, getBooks, getBook, reorderChapters, updateBook,
  addReview, getReviews, deleteReview 
} = require('../controllers/bookController');
const { uploadBook, uploadAudio } = require('../utils/cloudinary');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book (Admin Only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Book created
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books
 */
router.post('/', 
  [auth, admin, uploadBook.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'bookFile', maxCount: 1 }])], 
  createBook
);

/**
 * @swagger
 * /api/books/chapter:
 *   post:
 *     summary: Add chapter to audiobook (Admin Only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chapter added
 */
router.post('/chapter', 
  [auth, admin, uploadAudio.single('audioFile')], 
  addChapter
);

router.get('/', getBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book details
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Book details
 */
router.get('/:id', auth, getBook);
router.put('/:id', [auth, admin], updateBook);

router.post('/reorder', [auth, admin], reorderChapters);


// Reviews
router.post('/:id/reviews', auth, addReview);
router.get('/:id/reviews', getReviews);
router.delete('/reviews/:reviewId', [auth, admin], deleteReview);

module.exports = router;
