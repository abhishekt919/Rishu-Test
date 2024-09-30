const express = require("express");
const router = express.Router();

const StudentCtrl = require("../controllers/Student");

router.post("/add", StudentCtrl.AddStudent);
router.get("/get-student", StudentCtrl.GetStudent);
router.get("/get-student-id/:id", StudentCtrl.GetStudentByID);
router.put("/update-student/:id", StudentCtrl.UpdateById);

module.exports = router;