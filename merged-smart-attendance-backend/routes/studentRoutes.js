const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Confirm registerStudent exists!
console.log("🧪 Loaded studentController:", studentController);

// Register endpoint
router.post("/register", studentController.registerStudent);
// login endpoint
router.post("/login", studentController.loginStudent);

// Profile endpoint
router.get("/profile/:studentId", studentController.getStudentProfile);
// Mark attendance endpoint
router.post("/mark-attendance", studentController.markAttendance);

module.exports = router;
