import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import Dashboard from "./components/Dashboard/Dashboard";
import Surveillance from "./components/Surveillance/Surveillance";
import Threats from "./components/Threats/Threats";
import Incidents from "./components/Incidents/Incidents";
import Timeline from "./components/Timeline/Timeline";
import Analytics from "./components/Analytics/Analytics";
import AI_Assistant from "./components/AI_Assistant/AI_Assistant";

import Signin from "./components/Login/Signin";

function AppContent() {
  const location = useLocation();

  // Login/authentication pages par Navbar nahi dikhana
  const isAuthPage = location.pathname.startsWith("/signin");

  return (
    <div>
      {!isAuthPage && (
        <Navbar
          operatorName="Captain Singh"
          notificationCount={5}
          isOperational={true}
        />
      )}

      <Routes>
        {/* ================= AUTH ================= */}

        <Route path="/" element={<Navigate to="/signin" replace />} />

        <Route path="/signin" element={<Signin />} />

        {/* ================= COMMAND ================= */}

        <Route path="/command" element={<Dashboard />} />

        {/* ================= SURVEILLANCE ================= */}

        <Route
          path="/surveillance"
          element={<Surveillance />}
        />

        {/* ================= THREATS ================= */}

        <Route
          path="/threats"
          element={<Threats />}
        />

        {/* ================= INCIDENTS ================= */}

        <Route
          path="/incidents"
          element={<Incidents />}
        />

        {/* ================= TIMELINE ================= */}

        <Route
          path="/timeline"
          element={<Timeline />}
        />

        {/* ================= ANALYTICS ================= */}

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* ================= AI ASSISTANT ================= */}

        <Route
          path="/assistant"
          element={<AI_Assistant />}
        />

        {/* ================= UNKNOWN ROUTE ================= */}

        <Route
          path="*"
          element={<Navigate to="/signin" replace />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;