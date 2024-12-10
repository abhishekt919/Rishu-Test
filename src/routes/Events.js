const express = require('express');
const { createEvent, getEvents } = require('../controllers/Events');
const router = express.Router();

router.post('/', createEvent); // Admin only
router.get('/events', getEvents);   // Public

module.exports = router;
