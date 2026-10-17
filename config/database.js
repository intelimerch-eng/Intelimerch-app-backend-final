// src/config/database.js
const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,   // fail after 10s, not 30s
      socketTimeoutMS: 45000,
    });
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    throw err;
  }
};