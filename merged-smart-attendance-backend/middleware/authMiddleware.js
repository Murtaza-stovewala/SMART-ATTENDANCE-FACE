const jwt = require("jsonwebtoken");
const Student = require("../models/Student");


const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.student = await Student.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, token missing" });
  }
};

module.exports = protect;
