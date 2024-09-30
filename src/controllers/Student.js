const mongoose = require('mongoose');
const constantObj = require("../config/Constants");
const StudentObj = require("../models/Student");
const { errorHandler } = require("../helpers/helperFunctions");

//Adding New Records
exports.AddStudent = async (req, res) => {
  try {
    const { _id } = req.body;

    if (_id) {
      // Update an existing student
      const updatedStudent = await StudentObj.findByIdAndUpdate(_id, req.body, { new: true });
      return res.status(200).jsonp({
        status: "success",
        messageId: 200,
        message: "Student " + constantObj.messages.RecordUpdated,
        data: updatedStudent
      });
    } else {
      // Create a new student
      const newStudent = new StudentObj(req.body);
      await newStudent.save();
      return res.status(200).jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.StudentAdded,
        data: newStudent
      });
    }
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(400).jsonp({
        status: "error",
        messageId: 400,
        message: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`
      });
    }

    return res.status(500).jsonp({
      status: "error",
      messageId: 500,
      message: error.message
    });
  }
};

//Getting AllRecords.
exports.GetStudent = async (req, res) => {
  StudentObj.find()
    .sort({ name: 1 })
    .lean()
    .exec(function (err, data) {
      if (err) {
        return res.jsonp({
          status: "failure",
          messageId: 203,
          message: constantObj.messages.ErrorRetrievingData,
        });
      }

      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        data: data,
      });
    });
};

//Get Record By Id
exports.GetStudentByID = (req, res) => {
  StudentObj.findOne({ _id: req.params.id })
    .lean()
    .exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler(err.message));
      }
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        data: data,
      });
    });
};

//UpdateStudent By Id
exports.UpdateById = (req, res) => {
  const studentId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).jsonp({
      status: "error",
      messageId: 400,
      message: "Invalid student ID format"
    });
  }

  StudentObj.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(studentId) },
    { $set: req.body },
    { new: true },
    (err, updatedStudent) => {
      if (err) {
        return res.status(500).jsonp(errorHandler(err.message));
      }

      if (!updatedStudent) {
        return res.status(404).jsonp({
          status: "error",
          messageId: 404,
          message: "Student record not found"
        });
      }

      return res.status(200).jsonp({
        status: "success",
        messageId: 200,
        message: "Student " + constantObj.messages.RecordUpdated,
        data: updatedStudent,
      });
    }
  );
};