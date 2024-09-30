// routes/contact.js
const express = require('express');
const router = express.Router();
const ContactCtrl = require('../controllers/contact');

// Routes for contact operations
router.get('/get/getContact', ContactCtrl.GetContact);
router.get('/get/getContactById/:id', ContactCtrl.GetContactById);
router.post('/addContact', ContactCtrl.AddContact);

module.exports = router;
