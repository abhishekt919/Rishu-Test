const express = require('express');
const router = express.Router();
const { calculateDays } = require('../controllers/dayController');

// Define a route for calculating days
router.post('/calculate-days', calculateDays);

module.exports = router;