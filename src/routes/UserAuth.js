const express = require("express");
const router = express.Router();

const UserAuthCtrl = require('./../controllers/UserAuth');
const checkAuth = require("../middleware/check-auth");

router.post("/login", UserAuthCtrl.Login);
router.post("/login-mobile", UserAuthCtrl.LoginMobilePhone);
router.post("/check-username", UserAuthCtrl.CheckUserName);
router.post("/check-email", UserAuthCtrl.CheckEmail);
router.post("/check-mobile-phone", UserAuthCtrl.CheckMobilePhone);
router.post("/sign-up", UserAuthCtrl.SignUp);
router.post("/complete-account", UserAuthCtrl.CompleteAccount);
router.post("/email-verification", UserAuthCtrl.VerifyEmail);
router.post("/mobile-verification", UserAuthCtrl.VerifyMobilePhone);
router.post("/forgot-password", UserAuthCtrl.ForgotPassword);
router.post("/reset-password", UserAuthCtrl.ResetPassword);

router.patch('/change-password', checkAuth, UserAuthCtrl.ChangePassword);
router.post("/get-profile", checkAuth, UserAuthCtrl.GetProfile);
router.post("/send-mobile-verify-code", checkAuth, UserAuthCtrl.SendCodeMobilePhone);
router.patch("/update-profile", checkAuth, UserAuthCtrl.UpdateProfile);
router.post("/login-as", checkAuth, UserAuthCtrl.LoginAsUser);

module.exports = router;
