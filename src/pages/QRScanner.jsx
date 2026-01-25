import { useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
//import FaceScanner from "../components/FaceScanner";

import "./QRScanner.css"; // ✅ UI only

export default function QRScanner({ onSuccess }) {
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");

  const verifyQR = async () => {
    const snap = await get(ref(db, "qrSession"));
    const data = snap.val();

    if (!data || data.token !== token) {
      setMsg("Invalid QR");
      return;
    }

    if (Date.now() > data.expiry) {
      setMsg("QR expired");
      return;
    }

    setMsg("QR verified ✔");
    setStep(2);
  };

  return (
    <div className="qr-container">
      {step === 1 && (
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

          <button className="btn primary" onClick={verifyQR}>
            Verify QR
          </button>

          {msg && <p className="message">{msg}</p>}
        </div>
      )}
      
      {/*
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
