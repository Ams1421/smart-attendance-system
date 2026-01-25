import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useEffect, useState } from "react";
import { getUserRole } from "./utils/getRole";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const r = await getUserRole(u.uid);
        setRole(r);
      } else {
        setUser(null);
        setRole(null);
      }
    });
  }, []);

  if (!user) return <Login />;
  if (!role) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* ADMIN ROUTE */}
        {role === "admin" && (
          <Route path="/admin" element={<AdminDashboard />} />
        )}

        {/* STUDENT ROUTE */}
        {role === "student" && (
          <Route path="/student" element={<StudentDashboard />} />
        )}

        {/* AUTO REDIRECT */}
        <Route
          path="*"
          element={
            role === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/student" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
