import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import LoginLog from "../models/LoginLog.js";

const router = express.Router();

// Register (admin will create students later)
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role
  });

  res.json({ message: "User created" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const log = await LoginLog.create({
    userId: user._id,
    role: user.role,
    loginTime: new Date()
  });

  res.json({
    token,
    role: user.role,
    logId: log._id
  });
});

// Logout
router.post("/logout", async (req, res) => {
  const { logId } = req.body;

  await LoginLog.findByIdAndUpdate(logId, {
    logoutTime: new Date()
  });

  res.json({ message: "Logged out" });
});

export default router;
