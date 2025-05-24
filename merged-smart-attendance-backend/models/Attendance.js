const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  studentName: { type: String, required: true }, // ✅ new field
  code: { type: String, required: true },
  status: { type: String, default: "Present" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attendance", attendanceSchema); 
