const express = require('express');
const { bookTickets, getUserBookings } = require('../controllers/Booking');
const router = express.Router();

router.post('/', bookTickets); // Users
router.get('/:userId', getUserBookings); // Users

module.exports = router;
