import { QRCodeCanvas } from "qrcode.react";

export default function QRGenerator({ token }) {
  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <h3>Live Attendance QR</h3>

      <QRCodeCanvas
        value={token}
        size={220}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
      />

      <p style={{ color: "red", marginTop: "10px" }}>
        QR valid for 2 minutes
      </p>
    </div>
  );
}
