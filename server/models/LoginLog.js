import mongoose from "mongoose";

const LoginLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  role: String,
  loginTime: Date,
  logoutTime: Date
});

export default mongoose.model("LoginLog", LoginLogSchema);
