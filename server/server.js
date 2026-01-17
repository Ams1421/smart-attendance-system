import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import attendanceRoutes from "./routes/attendance.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ROUTES (important order)
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Smart Attendance Backend Running 🚀");
});

// ✅ DB CONNECT
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB error", err));

// ✅ START SERVER
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
