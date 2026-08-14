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
import UserAlerts from "./components/User/UserAlert";
import UserInformation from "./components/User/UserInformation";
import UserSafety from "./components/User/UserSafety";
import UserDashboard from "./components/User/UserDashboard";
import UserNavbar from "./components/User/UserNavbar";
import type { UserNavbarProps } from "./components/User/UserNavbar";
import UserAIAssistant from "./components/User/UserAIAssistant";
import Signin from "./components/Login/Signin";
import AdminVerification from "./components/Admin/AdminVerification";
import AdminTOTPSetup from "./components/Admin/AdminTOTPSetup";
function AppContent() {
  const location = useLocation();

  const getUserActivePage = (): UserNavbarProps["activePage"] => {
    switch (location.pathname) {
      case "/user":
        return "home";

      case "/user_alert":
        return "alerts";

      case "/user_safety":
        return "safety";

      case "/user_info":
        return "information";

      case "/user_assistant":
        return "assistant";

      default:
        return "home";
    }
  };

  const isAuthPage =
    location.pathname === "/signin" ||
    location.pathname === "/admin-verification" ||
    location.pathname === "/admin-totp-setup";

  const isUserPage =
    location.pathname.startsWith("/user");

  return (
    <div>
      {/* ================= USER NAVBAR ================= */}

      {isUserPage && (
        <UserNavbar
          activePage={getUserActivePage()}
          userName="User"
          notificationCount={3}
          onNavigate={(page) => {
            switch (page) {
              case "home":
                window.location.href = "/user";
                break;

              case "alerts":
                window.location.href = "/user_alert";
                break;

              case "safety":
                window.location.href = "/user_safety";
                break;

              case "information":
                window.location.href = "/user_info";
                break;

              case "assistant":
                window.location.href = "/user_assistant";
                break;
            }
          }}
        />
      )}

      {/* ================= INTERNAL NAVBAR ================= */}

      {!isAuthPage && !isUserPage && (
        <Navbar
          operatorName="Captain Singh"
          notificationCount={5}
          isOperational={true}
        />
      )}

      <Routes>

        {/* ================= AUTH ================= */}

        <Route
          path="/"
          element={<Navigate to="/signin" replace />}
        />

        <Route
          path="/signin"
          element={<Signin />}
        />

        <Route
          path="/admin-totp-setup"
          element={<AdminTOTPSetup />}
        />
        {/* ================= USER ================= */}

        <Route
          path="/user"
          element={<UserDashboard />}
        />

        <Route path="/user_info" element={<UserInformation />} />
        <Route path="/user_safety" element={<UserSafety />} />
        <Route path="/user_alert" element={<UserAlerts />} />
        <Route path="/user_assistant" element={<UserAIAssistant />} />

        <Route path="/admin-verification" element={<AdminVerification />} />

        {/* ================= INTERNAL COMMAND ================= */}

        <Route
          path="/command"
          element={<Dashboard />}
        />

        <Route
          path="/surveillance"
          element={<Surveillance />}
        />

        <Route
          path="/threats"
          element={<Threats />}
        />

        <Route
          path="/incidents"
          element={<Incidents />}
        />

        <Route
          path="/timeline"
          element={<Timeline />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/assistant"
          element={<AI_Assistant />}
        />

        {/* ================= UNKNOWN ================= */}

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