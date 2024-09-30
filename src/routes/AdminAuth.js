const express = require('express');
const router = express.Router();

const AdminAuthCtrl = require('../controllers/AdminAuth');
const checkAuth = require("../middleware/check-auth");

router.post("/login", AdminAuthCtrl.Login);
router.post("/forgot-password", AdminAuthCtrl.ForgotPassword);
router.post("/reset-password", AdminAuthCtrl.ResetPassword);
router.post("/check-email", AdminAuthCtrl.CheckEmail);
router.post("/check-mobile-phone", AdminAuthCtrl.CheckMobilePhone);
router.post("/email-verification", AdminAuthCtrl.VerifyEmail);
router.post("/login-as", checkAuth, AdminAuthCtrl.LoginAsUser);

router.post("/get-profile", checkAuth, AdminAuthCtrl.GetProfile);
router.patch("/update-profile", checkAuth, AdminAuthCtrl.UpdateProfile);
router.patch('/change-password', checkAuth, AdminAuthCtrl.ChangePassword);
module.exports = router;
