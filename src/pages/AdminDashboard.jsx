import { ref, onValue, set } from "firebase/database";
import { db, auth } from "../firebase";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import QRGenerator from "../components/QRGenerator";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

import "./AdminDashboard.css"; // ✅ UI only

export default function AdminDashboard() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [qrToken, setQrToken] = useState("");

  const [filterDate, setFilterDate] = useState("");
  const [filterSession, setFilterSession] = useState("");

  const handleLogout = async () => {
    await signOut(auth);
  };

  const generateQR = async () => {
    const token = Date.now().toString();
    setQrToken(token);

    await set(ref(db, "qrSession"), {
      token,
      expiry: Date.now() + 2 * 60 * 1000
    });
  };

  useEffect(() => {
    const attRef = ref(db, "attendance");

    onValue(attRef, (snap) => {
      const data = snap.val();
      let list = [];

      if (data) {
        Object.keys(data).forEach((uid) => {
          Object.keys(data[uid]).forEach((date) => {
            Object.keys(data[uid][date]).forEach((session) => {
              list.push({
                studentId: uid,
                date,
                session,
                ...data[uid][date][session]
              });
            });
          });
        });
      }

      setRecords(list);
      setFiltered(list);
    });
  }, []);

  useEffect(() => {
    let temp = records;

    if (filterDate) temp = temp.filter(r => r.date === filterDate);
    if (filterSession) temp = temp.filter(r => r.session === filterSession);

    setFiltered(temp);
  }, [filterDate, filterSession, records]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream"
    });

    saveAs(file, "attendance_report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 14, 10);

    doc.autoTable({
      head: [["Student ID", "Date", "Session", "Status", "Time"]],
      body: filtered.map(r => [
        r.studentId,
        r.date,
        r.session,
        r.status,
        r.time
      ])
    });

    doc.save("attendance_report.pdf");
  };

  return (
    <div className="admin-container">

      {/* HEADER */}
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="btn danger" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* QR SECTION */}
      <section className="card">
        <h2>QR Attendance</h2>
        <button className="btn primary" onClick={generateQR}>
          Generate Attendance QR
        </button>

        {qrToken && (
          <div className="qr-box">
            <QRGenerator token={qrToken} />
          </div>
        )}
      </section>

      {/* REPORT SECTION */}
      <section className="card">
        <h2>Attendance Report</h2>

        <div className="filters">
          <div>
            <label>Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div>
            <label>Session</label>
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
            >
              <option value="">All</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>
        </div>

        <div className="export-buttons">
          <button className="btn success" onClick={exportToExcel}>
            Export Excel
          </button>
          <button className="btn secondary" onClick={exportToPDF}>
            Export PDF
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Date</th>
                <th>Session</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={i}>
                    <td>{r.studentId}</td>
                    <td>{r.date}</td>
                    <td>{r.session}</td>
                    <td className={r.status === "Present" ? "present" : "absent"}>
                      {r.status}
                    </td>
                    <td>{r.time}</td>
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
