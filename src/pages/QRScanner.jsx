import { useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
// import FaceScanner from "../components/FaceScanner"; // 🔒 kept for future use

import "./QRScanner.css"; // ✅ UI only

export default function QRScanner({ onSuccess }) {
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyQR = async () => {
    setLoading(true);
    setMsg("");

    try {
      const snap = await get(ref(db, "qrSession"));
      const data = snap.val();

      // ❌ Invalid QR
      if (!data || data.token !== token) {
        setMsg("❌ Invalid QR");
        setLoading(false);
        return;
      }

      // ⏰ Expired QR
      if (Date.now() > data.expiry) {
        setMsg("⛔ QR expired");
        setLoading(false);
        return;
      }

      // ✅ QR Verified
      setMsg("✅ QR verified. Marking attendance...");
      setLoading(false);

      // 🔥 IMPORTANT: trigger attendance marking
      onSuccess();

    } catch (err) {
      console.error(err);
      setMsg("⚠️ Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="qr-container">
      <div className="qr-card">
        <h2>QR Verification</h2>

        <p className="subtitle">
          Enter the QR token shown by the instructor
        </p>

        <input
          className="qr-input"
          placeholder="Enter QR token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <button
          className="btn primary"
          onClick={verifyQR}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify QR"}
        </button>

        {msg && <p className="message">{msg}</p>}
      </div>

      {/*
      ===============================
      🔒 FACE VERIFICATION (DISABLED)
      ===============================
      {step === 2 && (
        <div className="qr-card">
          <h2>Face Verification</h2>
          <p className="subtitle">
            Please complete face verification to continue
          </p>

          <div className="face-box">
            <FaceScanner onVerified={onSuccess} />
          </div>
        </div>
      )}
      */}
    </div>
  );
}
