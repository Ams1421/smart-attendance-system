import mongoose from "mongoose";

const AttendanceRuleSchema = new mongoose.Schema({
  morningStart: String,
  morningEnd: String,
  eveningStart: String,
  eveningEnd: String
});

export default mongoose.model("AttendanceRule", AttendanceRuleSchema);
