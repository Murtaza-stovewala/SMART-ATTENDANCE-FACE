const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  collegeId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  faceDescriptor: { type: [Number], required: true }, // <-- correct new field
  registeredDevice: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema); 
