const express = require('express');
const { createEvent, getEvents } = require('../controllers/Events');
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

router.post('/',checkAuth, createEvent); // Admin only
router.get('/events', checkAuth, getEvents);   // Public

module.exports = router;
