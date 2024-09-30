const express = require("express");
const router = express.Router();

const MachineCtrl = require('../controllers/MachineType');
const checkAuth = require("../middleware/check-auth");

router.post("/create", checkAuth, MachineCtrl.CreateMachineType);
router.get("/get/:id", checkAuth, MachineCtrl.GetMachineType);
router.get("/list", checkAuth, MachineCtrl.GetMachineTypeList);
router.delete("/delete/:id", checkAuth, MachineCtrl.DeleteMachineTypeById);
router.get("/active", checkAuth, MachineCtrl.GetActiveMachineType);
router.get("/affiliate/:companyId", checkAuth, MachineCtrl.GetAffiliatesMachineType);

module.exports = router;
