const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const PaymentMethodsCtrl = require("../controllers/PaymentMethods");

router.post("/list-credit-cards", checkAuth, PaymentMethodsCtrl.GetCreditCards);
router.post("/add-credit-card", checkAuth, PaymentMethodsCtrl.AddCreditCard);
router.post("/delete-credit-card", checkAuth, PaymentMethodsCtrl.DeleteCreditCard);

module.exports = router;