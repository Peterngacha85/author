const express = require('express');
const router = express.Router();
const { logVisit, getAnalytics } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   POST api/analytics/log
// @desc    Log a page visit
// @access  Public
router.post('/log', logVisit);

// @route   GET api/analytics/stats
// @desc    Get analytics statistics
// @access  Private (Admin only)
router.get('/stats', auth, admin, getAnalytics);

module.exports = router;
