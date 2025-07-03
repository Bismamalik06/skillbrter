require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Contact = require("../models/contact");

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


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

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Email already exists" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with all fields
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

    // Send OTP via Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SkillBarter - Verify Your Email",
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = ""; // clear OTP after verification
    await user.save();

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // User find karo
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Password check karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.json({ success: false, message: "Email not verified" });
    }

    return res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
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

    return res.json({ success: true, message: "Your message has been sent!" });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
