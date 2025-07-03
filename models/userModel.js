// backend/models/userModel.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  image: String,
  skillsHave: [String],
  skillsWant: [String],
  phone:String,
  location:String,
  role:String,
  description:String,
});

// ✅ Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
