const express = require("express");
const router = express.Router();

const LegalController = require("../controllers/Legal");
const checkAuth = require("../middleware/check-auth");

router.post("/update", checkAuth, LegalController.UpdateLegal);
router.post("/get", checkAuth, LegalController.GetLegal);
router.post("/get-company", LegalController.GetLegalCompany);

module.exports = router;

