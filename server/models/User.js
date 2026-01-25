import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ["admin", "student"], default: "student" },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model("User", UserSchema);
