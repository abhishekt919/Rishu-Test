const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const UsersCtrl = require("../controllers/Users");

router.post("/create", checkAuth, UsersCtrl.CreateUser);
router.get("/list/:companyId/:status", checkAuth, UsersCtrl.GetUsers);
router.get("/active/:companyId", checkAuth, UsersCtrl.GetActiveUsers);
router.get("/get/:id", checkAuth, UsersCtrl.GetUserById);
router.delete("/delete/:id", checkAuth, UsersCtrl.DeleteUserById);
router.patch("/update", checkAuth, UsersCtrl.UpdateUserById);
router.get("/count/:companyId", checkAuth, UsersCtrl.GetUsersCount);
router.get("/download/:companyId", checkAuth, UsersCtrl.DownloadUsersByCompany);
router.get("/permissions/get/:userId", checkAuth, UsersCtrl.GetPermissionsByUserId);
router.patch("/permissions/update", checkAuth, UsersCtrl.UpdateUserPermissionsByUserId);
router.get("/permissions/default/:role", checkAuth, UsersCtrl.GetDefaultPermissionsByRole);

// Super Admin
router.get("/list-all/:status/:page/:perPage", checkAuth, UsersCtrl.GetAllUsers);
router.get("/all-count", checkAuth, UsersCtrl.GetAllUsersCount);
router.post("/search", checkAuth, UsersCtrl.SearchUsers);

module.exports = router;
