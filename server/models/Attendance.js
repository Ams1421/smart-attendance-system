import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  date: String, // YYYY-MM-DD
  session: { type: String, enum: ["Morning", "Evening"] },
  time: String,
  status: { type: String, default: "Present" }
});

export default mongoose.model("Attendance", AttendanceSchema);
