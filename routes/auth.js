require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const User = require("../models/user");
const Contact = require("../models/contact");

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Helper: OTP Generator
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Upload Image to Cloudinary

// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      location,
      role,
      description,
      skillsHave,
      skillsWant,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: "Email already exists" });

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      role,
      description,
      skillsHave,
      skillsWant,
      otp,
      isVerified: false,
    });

    await newUser.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SkillBarter - Verify Your Email",
      text: `Your OTP is: ${otp}`,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ OTP Verification
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.otp !== otp) return res.json({ success: false, message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = "";
    await user.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    if (!user.isVerified) return res.json({ success: false, message: "Email not verified" });

    res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Contact Form
router.post("/contact", async (req, res) => {
  try {
    const { fullName, email, phone, location, interest, message } = req.body;

    const newMessage = new Contact({
      fullName,
      email,
      phone,
      location,
      interest,
      message,
    });

    await newMessage.save();
    res.json({ success: true, message: "Your message has been sent!" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get User by Email
router.get("/user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Update User Profile
router.put("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const updatedData = req.body;

    const updatedUser = await User.findOneAndUpdate({ email }, updatedData, {
      new: true,
    });

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("❌ Error updating user", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
