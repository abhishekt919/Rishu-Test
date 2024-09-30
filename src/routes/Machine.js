const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const MachineCtrl = require("../controllers/Machine");

router.post("/create", checkAuth, MachineCtrl.AddMachine);
router.get("/list/:companyId/:status/:page/:perPage", checkAuth, MachineCtrl.GetMachineByCompany);
router.get("/count/:companyId", checkAuth, MachineCtrl.GetMachinesCountByCompany);
router.get("/get/:id", checkAuth, MachineCtrl.GetMachineById);
router.delete("/delete/:id", checkAuth, MachineCtrl.DeleteMachineById);
router.post("/download", checkAuth, MachineCtrl.DownloadMachineByCompany);
router.post("/get-statistics", checkAuth, MachineCtrl.GetMachineStatistics);
router.post("/get-events", checkAuth, MachineCtrl.GetMachineEvents);
router.patch("/update", checkAuth, MachineCtrl.UpdateMachine);

// Super Admin API's
router.get("/list-all/:status/:page/:perPage", checkAuth, MachineCtrl.GetAllMachine);
router.patch("/verify", checkAuth, MachineCtrl.VerifyMachine);
router.get("/all-count", checkAuth, MachineCtrl.GetAllMachinesCount);
router.post("/search", checkAuth, MachineCtrl.SearchMachines);
module.exports = router;