const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const UploadCtrl = require("../controllers/FileUpload");
const uploadFile = require("../config/FileUpload");

router.get("/file/:fileName", checkAuth, UploadCtrl.GetFile);
router.post("/single", checkAuth, uploadFile.single('file'), UploadCtrl.UploadSingleFile);
router.post("/multiple", checkAuth, uploadFile.array('file'), UploadCtrl.UploadMultipleFiles);
router.delete("/delete", checkAuth, UploadCtrl.DeleteFile);
router.post("/base-64", checkAuth, UploadCtrl.UploadBase64);

module.exports = router;
