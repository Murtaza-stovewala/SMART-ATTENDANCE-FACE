const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const PredefinedStudent = require("../models/PredefinedStudent");
const LectureCode = require("../models/Lecturecode");
const Attendance = require("../models/Attendance");
const { euclideanDistance } = require("../utils/faceUtils");

// ✅ Register Student
exports.registerStudent = async (req, res) => {
  const { name, email, collegeId, password, faceDescriptor } = req.body;

  if (!name || !email || !collegeId || !password || !faceDescriptor) {
    return res.status(400).json({ message: "All fields are required including face descriptor." });
  }

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already registered." });
    }

    const validStudent = await PredefinedStudent.findOne({ name, collegeId });
    if (!validStudent) {
      return res.status(403).json({ message: "Student not pre-approved by admin." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email,
      collegeId,
      password: hashedPassword,
      faceDescriptor
    });

    await student.save();
    res.status(201).json({ success: true, student: { name, email, collegeId } });

  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "College ID or Email already registered." });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
};
const jwt = require("jsonwebtoken"); // Make sure this is installed (npm install jsonwebtoken)

// ✅ Student Login by College ID
exports.loginStudent = async (req, res) => {
  const { collegeId, password } = req.body;

  if (!collegeId || !password) {
    return res.status(400).json({ message: "College ID and password are required." });
  }

  try {
    const student = await Student.findOne({ collegeId });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ✅ Optional: Generate JWT token
    const token = jwt.sign(
      { id: student._id, collegeId: student.collegeId },
      process.env.JWT_SECRET || "secretkey", // use env var in production
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        collegeId: student.collegeId
      },
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// ✅ Get Student Profile
exports.getStudentProfile = async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required." });
  }

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json({
      success: true,
      student: {
        name: student.name,
        email: student.email,
        collegeId: student.collegeId
      }
    });

  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
};
// ✅ Mark Attendance


// exports.markAttendance = async (req, res) => {
//   const { collegeId, code, faceDescriptor } = req.body;

//   if (!collegeId || !code || !faceDescriptor) {
//     return res.status(400).json({ message: "Missing required fields." });
//   }

//   try {
//     const student = await Student.findOne({ collegeId });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found." });
//     }

//     if (!student.faceDescriptor || student.faceDescriptor.length !== 128) {
//       return res.status(400).json({ message: "No registered face found for this student." });
//     }

//     const lecture = await LectureCode.findOne({ code });
//     if (!lecture) {
//       return res.status(400).json({ message: "Invalid or expired code." });
//     }

//     const distance = euclideanDistance(student.faceDescriptor, faceDescriptor);
//     console.log("🧠 Face distance:", distance);

//     const threshold = 0.4; // Stricter match
//     if (distance > threshold) {
//       return res.status(401).json({ message: "❌ Face mismatch. Attendance not marked." });
//     }

//     const attendance = new Attendance({
//       studentId: student._id,
//       studentName: student.name,
//       code,
//       status: "Present"
//     });

//     await attendance.save();

//     res.status(200).json({
//       success: true,
//       message: `✅ Attendance marked successfully for ${student.name}`
//     });

//   } catch (error) {
//     console.error("❌ Error in markAttendance:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };
exports.markAttendance = async (req, res) => {
  const { collegeId, code, faceDescriptor } = req.body;

  if (!collegeId || !code || !faceDescriptor) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const student = await Student.findOne({ collegeId });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const lecture = await LectureCode.findOne({ code });
    if (!lecture) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    const distance = euclideanDistance(student.faceDescriptor, faceDescriptor);
    console.log("🧠 Face distance:", distance);

    if (distance > 0.6) {
      return res.status(401).json({ message: "Face mismatch. Attendance not marked." });
    }

    const attendance = new Attendance({
      studentId: student._id,
      studentName: student.name, // ✅ ADD THIS
      code,
      status: "Present"
    });

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `✅ Attendance marked successfully for ${student.name}`
    });

  } catch (error) {
    console.error("❌ Error in markAttendance:", error);
    res.status(500).json({ message: "Server error." });
  }
};