const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const UserPermissionCtrl = require("../controllers/UserPermissions");

router.post(
    "/create",
    checkAuth,
    UserPermissionCtrl.CreateUpdateUserPermission
);
router.post(
    "/list",
    checkAuth,
    UserPermissionCtrl.GetUserPermissions
);
router.get("/get-by-id/:id", checkAuth, UserPermissionCtrl.GetUserPermissionById);
router.delete(
    "/delete/:id",
    checkAuth,
    UserPermissionCtrl.DeleteUserPermissionById
);

module.exports = router;
