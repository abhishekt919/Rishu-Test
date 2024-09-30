const express = require("express");
const router = express.Router();

const FilesCleanUpCtrl = require("../cronjobs/FilesCleanUp");
const MachineStatusCtrl = require("../cronjobs/MachineStatus");

FilesCleanUpCtrl.FolderCleanUp();
MachineStatusCtrl.CheckMachineStatus();

module.exports = router;

