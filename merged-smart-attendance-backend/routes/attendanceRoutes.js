const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// Already present
const { markAttendance } = require("../controllers/studentController");
router.post("/mark", markAttendance);

// ✅ Get live attendance for teacher
router.get("/live/:teacherId", async (req, res) => {
  const { teacherId } = req.params;

  try {
    const attendance = await Attendance.find({ status: "Present", code: { $exists: true } })
      .populate("studentId", "collegeId name") // populate student details
      .sort({ createdAt: -1 });

    // You can optionally filter by lectureCode.creator == teacherId if available
    const result = attendance.map(a => ({
      studentId: a.studentId.collegeId,
      name: a.studentId.name,
      status: a.status
    }));

    res.json({ success: true, attendance: result });
  } catch (err) {
    console.error("Live attendance fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Mark a student absent manually
router.post("/mark-absent", async (req, res) => {
  const { studentId } = req.body;

  try {
    const updated = await Attendance.findOneAndUpdate(
      { studentId },
      { status: "Absent" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    res.json({ success: true, message: "Student marked absent" });
  } catch (err) {
    console.error("Mark absent error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
