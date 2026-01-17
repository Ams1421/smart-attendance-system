import express from "express";
import Attendance from "../models/Attendance.js";
import AttendanceRule from "../models/AttendanceRule.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Default time rules (run once)
router.get("/init-rules", async (req, res) => {
  const exists = await AttendanceRule.findOne();
  if (!exists) {
    await AttendanceRule.create({
      morningStart: "08:30",
      morningEnd: "09:30",
      eveningStart: "15:30",
      eveningEnd: "16:30"
    });
  }
  res.json({ message: "Rules initialized" });
});

// Helper function
function isWithinTime(start, end) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const s = parseInt(start.split(":")[0]) * 60 + parseInt(start.split(":")[1]);
  const e = parseInt(end.split(":")[0]) * 60 + parseInt(end.split(":")[1]);
  return current >= s && current <= e;
}

// Mark attendance
router.post("/mark", protect, async (req, res) => {
  const { session } = req.body;
  const studentId = req.user.id;

  if (req.user.role !== "student")
    return res.status(403).json({ message: "Only students can mark attendance" });

  const rules = await AttendanceRule.findOne();
  if (!rules) return res.status(500).json({ message: "Rules not set" });

  let allowed = false;
  if (session === "Morning")
    allowed = isWithinTime(rules.morningStart, rules.morningEnd);
  if (session === "Evening")
    allowed = isWithinTime(rules.eveningStart, rules.eveningEnd);

  if (!allowed) return res.json({ message: "Attendance closed for this session" });

  const today = new Date().toISOString().split("T")[0];
  const time = new Date().toLocaleTimeString();

  const exists = await Attendance.findOne({ studentId, date: today, session });
  if (exists) return res.json({ message: "Already marked" });

  await Attendance.create({
    studentId,
    date: today,
    session,
    time
  });

  res.json({ message: "Attendance marked successfully" });
});

// Student history
router.get("/my-history", protect, async (req, res) => {
  const records = await Attendance.find({ studentId: req.user.id })
    .sort({ date: -1 });

  res.json(records);
});

// Attendance percentage
router.get("/my-percentage", protect, async (req, res) => {
  const total = await Attendance.countDocuments({ studentId: req.user.id });
  const present = await Attendance.countDocuments({
    studentId: req.user.id,
    status: "Present"
  });

  const percent = total === 0 ? 0 : ((present / total) * 100).toFixed(2);
  res.json({ percentage: percent });
});

export default router;
