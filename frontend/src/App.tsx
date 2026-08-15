import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// ============================================================
// INTERNAL / BASE HEAD
// ============================================================

import Navbar from "./components/Navbar/Navbar";
import BaseSetup from "./components/BaseHead/BaseSetup";
import WaitingForApproval from "./components/BaseHead/WaitingForApproval";
import Dashboard from "./components/Dashboard/Dashboard";
import Surveillance from "./components/Surveillance/Surveillance";
import Threats from "./components/Threats/Threats";
import Incidents from "./components/Incidents/Incidents";
import Timeline from "./components/Timeline/Timeline";
import Analytics from "./components/Analytics/Analytics";
import AI_Assistant from "./components/AI_Assistant/AI_Assistant";

// ============================================================
// USER
// ============================================================

import UserAlerts from "./components/User/UserAlert";
import UserInformation from "./components/User/UserInformation";
import UserSafety from "./components/User/UserSafety";
import UserDashboard from "./components/User/UserDashboard";
import UserNavbar from "./components/User/UserNavbar";
import type { UserNavbarProps } from "./components/User/UserNavbar";
import UserAIAssistant from "./components/User/UserAIAssistant";

// ============================================================
// AUTH
// ============================================================

import Signin from "./components/Login/Signin";
import AdminVerification from "./components/Admin/AdminVerification";
import AdminTOTPSetup from "./components/Admin/AdminTOTPSetup";

// ============================================================
// ADMIN
// ============================================================

import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminNavbar from "./components/Admin/AdminNavbar";
import BaseHeadRequests from "./components/Admin/BaseHeadRequests";
import BasesOverview from "./components/Admin/BasesOverview";


// ============================================================
// APP CONTENT
// ============================================================

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================================
  // USER ACTIVE PAGE
  // ==========================================================

  const getUserActivePage =
    (): UserNavbarProps["activePage"] => {
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


  // ==========================================================
  // USER PAGES
  // ==========================================================

  const isUserPage =
    location.pathname === "/user" ||
    location.pathname.startsWith("/user_");

  const isBaseHeadSetupPage =
    location.pathname === "/base-setup" ||
    location.pathname === "/waiting-for-approval";


  // ==========================================================
  // ADMIN PAGES
  // ==========================================================

  const isAdminPage =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div>

      {/* ======================================================
          USER NAVBAR
      ====================================================== */}

      {isUserPage && (
        <UserNavbar
          activePage={getUserActivePage()}
          userName="User"
          notificationCount={3}
          onNavigate={(page) => {
            switch (page) {

              case "home":
                navigate("/user");
                break;

              case "alerts":
                navigate("/user_alert");
                break;

              case "safety":
                navigate("/user_safety");
                break;

              case "information":
                navigate("/user_info");
                break;

              case "assistant":
                navigate("/user_assistant");
                break;

              default:
                break;
            }
          }}
        />
      )}


      {/* ======================================================
          ADMIN NAVBAR
      ====================================================== */}

      {isAdminPage && (
        <AdminNavbar adminName="Admin" />
      )}



      {/* ======================================================
          INTERNAL / BASE HEAD NAVBAR
      ====================================================== */}

      {!isAuthPage &&
        !isUserPage &&
        !isAdminPage &&
        !isBaseHeadSetupPage && (
          <Navbar
            operatorName="Captain Singh"
            notificationCount={5}
            isOperational={true}
          />
        )}


      {/* ======================================================
          ROUTES
      ====================================================== */}

      <Routes>

        {/* ====================================================
            ROOT
        ==================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/signin"
              replace
            />
          }
        />


        {/* ====================================================
            SIGN IN
        ==================================================== */}

        <Route
          path="/signin"
          element={<Signin />}
        />



        {/* ====================================================
            ADMIN AUTH
        ==================================================== */}

        <Route
          path="/admin-verification"
          element={<AdminVerification />}
        />

        <Route
          path="/admin-totp-setup"
          element={<AdminTOTPSetup />}
        />


        {/* ====================================================
            ADMIN
        ==================================================== */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/head-requests"
          element={<BaseHeadRequests />}
        />

        <Route
          path="/admin/bases"
          element={<BasesOverview />}
        />


        {/* ====================================================
            USER
        ==================================================== */}

        <Route
          path="/user"
          element={<UserDashboard />}
        />

        <Route
          path="/user_info"
          element={<UserInformation />}
        />

        <Route
          path="/user_safety"
          element={<UserSafety />}
        />

        <Route
          path="/user_alert"
          element={<UserAlerts />}
        />

        <Route
          path="/user_assistant"
          element={<UserAIAssistant />}
        />


        {/* ====================================================
            BASE HEAD / COMMAND
        ==================================================== */}

        <Route
          path="/base-setup"
          element={<BaseSetup />}
        />

        <Route
          path="/waiting-for-approval"
          element={<WaitingForApproval />}
        />

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


        {/* ====================================================
            UNKNOWN ROUTE
        ==================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/signin"
              replace
            />
          }
        />

      </Routes>

    </div>
  );
}


// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;