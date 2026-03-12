const express = require('express');
const router = express.Router();
const { createBook, addChapter, getBooks, getBook, reorderChapters, updateBook } = require('../controllers/bookController');
// ... skips
router.get('/:id', auth, getBook);
router.put('/:id', [auth, admin], updateBook);

router.post('/reorder', [auth, admin], reorderChapters);

module.exports = router;
