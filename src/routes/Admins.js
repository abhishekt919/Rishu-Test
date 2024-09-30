const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const AdminsCtrl = require("../controllers/Admins");

router.post("/create", checkAuth, AdminsCtrl.CreateAdmin);
router.get("/get/:id", checkAuth, AdminsCtrl.GetAdminById);
router.delete("/delete/:id", checkAuth, AdminsCtrl.DeleteAdminById);
router.patch("/update", checkAuth, AdminsCtrl.UpdateAdminById);
router.get("/list-all/:id/:status/:page/:perPage", checkAuth, AdminsCtrl.GetAllAdmins);
router.post("/search", checkAuth, AdminsCtrl.SearchAdmins);

module.exports = router;
