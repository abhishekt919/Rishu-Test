const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    rollNumber: { type: String, unique: true },
    class: String,
    status: String
  },
  { timestamps: true }
);

const StudentObj = mongoose.model("Student", StudentSchema);
module.exports = StudentObj;
