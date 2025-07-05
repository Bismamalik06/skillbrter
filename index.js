const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const chatbotRoute = require("./routes/chatbot");

dotenv.config();

const app = express(); // ✅ Initialize `app` BEFORE using it

app.use(cors({
  origin: "https://skillbarter-beta.vercel.app",
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chatbot", chatbotRoute);


const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server connected on port", port);
});
