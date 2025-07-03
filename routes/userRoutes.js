// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

// GET all users (for frontend cards)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // exclude password field
    res.status(200).json(users); // send users to frontend
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
