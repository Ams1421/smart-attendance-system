import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import { getUserRole } from "./utils/getRole";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });
  }, []);

  if (loading) return <h2>Loading...</h2>;

  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <Routes>
        {role === "admin" && <Route path="/" element={<AdminDashboard />} />}
        {role === "student" && <Route path="/" element={<StudentDashboard />} />}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
