const express = require('express');
const { createCustomer,getAllCustomers, getCustomerByID, updateCustomer } = require("../controllers/CreateCustomer")
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

router.post('/create-customer', checkAuth, createCustomer);
router.get('/get-customer', checkAuth, getAllCustomers);
router.get('/get-customer/:customerId', checkAuth, getCustomerByID);
router.put('/update-customer/:customerId', checkAuth, updateCustomer);

module.exports = router;
