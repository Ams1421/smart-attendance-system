import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";

export default function FaceScanner({ onVerified }) {
  const videoRef = useRef();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    };

    loadModels();
  }, []);

  const verifyFace = async () => {
    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks();

    if (!detection) {
      setMsg("No face detected");
      return;
    }

    setMsg("Face detected ✔");
    onVerified(); // proceed to attendance
  };

  return (
    <div>
      <video ref={videoRef} autoPlay width="260" />
      <br />
      <button onClick={verifyFace}>Verify Face</button>
      <p>{msg}</p>
    </div>
  );
}
