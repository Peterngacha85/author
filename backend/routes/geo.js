const express = require('express');
const router = express.Router();
const { getCountry } = require('../controllers/geoController');

router.get('/country', getCountry);

module.exports = router;
