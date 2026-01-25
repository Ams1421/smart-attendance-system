const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// 🔐 Gmail SMTP (App Password from Firebase config)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password
  }
});

// 📩 Send email when ABSENT entry is created
exports.sendAbsenceEmail = functions.database
  .ref("/attendance/{uid}/{date}/{session}")
  .onCreate(async (snapshot, context) => {
    const attendance = snapshot.val();

    // ✅ Only send mail if ABSENT
    if (attendance.status !== "Absent") {
      return null;
    }

    const uid = context.params.uid;

    // 🔍 Fetch student + parent email
    const studentSnap = await admin
      .database()
      .ref(`/students/${uid}`)
      .once("value");

    const student = studentSnap.val();

    if (!student || !student.parentEmail) {
      console.log("❌ Parent email not found");
      return null;
    }

    const mailOptions = {
      from: "Smart Attendance System <smartattendances41@gmail.com>",
      to: student.parentEmail,
      subject: "🚨 Attendance Alert",
      text: `
Dear Parent,

Your child (${student.name || "Student"}) was marked ABSENT.

Date: ${attendance.date}
Session: ${attendance.session}

Regards,
Smart Attendance System
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Absence email sent to parent");

    return null;
  });
