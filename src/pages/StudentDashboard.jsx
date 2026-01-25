import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { ref, onValue, get, set } from "firebase/database";
import { signOut } from "firebase/auth";
import QRScanner from "./QRScanner";

import "./StudentDashboard.css"; // ✅ UI only

export default function StudentDashboard() {
  const user = auth.currentUser;

  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [percent, setPercent] = useState(0);
  const [activeSession, setActiveSession] = useState(null);

  // ⏰ Time check helper
  // const isWithinTime = (now, s, e) => {
//   if (typeof s !== "string" || typeof e !== "string") return false;
//
//   const cur = now.getHours() * 60 + now.getMinutes();
//   const st = parseInt(s.split(":")[0]) * 60 + parseInt(s.split(":")[1]);
//   const en = parseInt(e.split(":")[0]) * 60 + parseInt(e.split(":")[1]);
//   return cur >= st && cur <= en;
// };


  // 🔓 Logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  // ✅ FINAL ATTENDANCE LOGIC (Present / Late)
  const markAttendance = async (session) => {
    if (!user) return;

    const ruleSnap = await get(ref(db, "rules"));
    const rules = ruleSnap.val();
    const now = new Date();

    const today = new Date().toISOString().split("T")[0];
    const attRef = ref(db, `attendance/${user.uid}/${today}/${session}`);

    // ❌ Duplicate check
    const existSnap = await get(attRef);
    if (existSnap.exists()) {
      setMsg("⚠️ Attendance already marked");
      return;
    }

    const curMinutes = now.getHours() * 60 + now.getMinutes();

    const start =
      session === "Morning"
        ? rules.morningStart
        : rules.eveningStart;

    const end =
      session === "Morning"
        ? rules.morningEnd
        : rules.eveningEnd;

    const s =
      parseInt(start.split(":")[0]) * 60 +
      parseInt(start.split(":")[1]);

    const e =
      parseInt(end.split(":")[0]) * 60 +
      parseInt(end.split(":")[1]);

    if (curMinutes < s) {
      setMsg("⛔ Attendance not started yet");
      return;
    }

    let status = "Present";
    let message = "✅ Attendance marked successfully";

    if (curMinutes > e) {
      status = "Late";
      message = "⚠️ Attendance marked (Late Comer)";
    }

    await set(attRef, {
      studentId: user.uid,
      date: today,
      session,
      status,
      time: now.toLocaleTimeString()
    });

    setMsg(message);
  };

  // 📊 Load attendance + percentage (REAL TIME)
  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `attendance/${user.uid}`);
    onValue(userRef, (snap) => {
      const data = snap.val();
      let list = [];

      if (data) {
        Object.keys(data).forEach((date) => {
          Object.keys(data[date]).forEach((session) => {
            list.push(data[date][session]);
          });
        });
      }

      setHistory(list);

      const total = list.length;
      const present = list.filter(
        (r) => r.status === "Present" || r.status === "Late"
      ).length;

      setPercent(
        total === 0 ? 0 : ((present / total) * 100).toFixed(2)
      );
    });
  }, [user]);

  return (
    <div className="student-container">

      {/* HEADER */}
      <header className="student-header">
        <h1>Student Dashboard</h1>
        <button className="btn danger" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* STATS */}
      <section className="card stats-card">
        <h2>Attendance Percentage</h2>
        <div className="percentage">
          {percent}%
        </div>
      </section>

      {/* ACTIONS */}
      <section className="card">
        <h2>Mark Attendance</h2>

        <div className="action-buttons">
          <button
            className="btn primary"
            onClick={() => setActiveSession("Morning")}
          >
            Mark Morning
          </button>

          <button
            className="btn secondary"
            onClick={() => setActiveSession("Evening")}
          >
            Mark Evening
          </button>
        </div>

        {activeSession && (
          <div className="qr-section">
            <QRScanner
              onSuccess={() => {
                markAttendance(activeSession);
                setActiveSession(null);
              }}
            />
          </div>
        )}

        {msg && <p className="message">{msg}</p>}
      </section>

      {/* HISTORY */}
      <section className="card">
        <h2>Attendance History</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Session</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.date}</td>
                    <td>{h.session}</td>
                    <td
                      className={
                        h.status === "Late" ? "late" : "present"
                      }
                    >
                      {h.status}
                    </td>
                    <td>{h.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
