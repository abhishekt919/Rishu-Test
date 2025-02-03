const express = require('express');
const { bookTickets, getUserBookings } = require('../controllers/Booking');
const router = express.Router();

router.post('/', bookTickets); 
router.get('/:userId', getUserBookings); 

module.exports = router;
