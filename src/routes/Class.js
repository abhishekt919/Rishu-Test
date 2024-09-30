const express = require('express');
const router = express.Router();
const classController = require('../controllers/Class');

router.post('/class/add', classController.addClass);
router.get('/class', classController.getClassList);
module.exports = router;