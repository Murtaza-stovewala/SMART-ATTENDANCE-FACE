const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI);
console.log("📈 Connected to MongoDB: ", conn.connection.host);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
