import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Signup from "./components/Login/Signup";
import ProtectedRoute from "./ProtectedRoute";
// ============================================================
// INTERNAL / BASE HEAD
// ============================================================
import OTPVerification from "./components/Login/OTPVerification";
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

  const getInitialRoute = () => {

    const token =
      localStorage.getItem("authToken");

    const userRaw =
      localStorage.getItem("authUser");

    if (!token || !userRaw) {
      return "/signin";
    }

    try {

      const user = JSON.parse(userRaw);

      if (
        user.role === "USER"
      ) {
        return "/user";
      }

      if (
        user.role === "ADMIN"
      ) {
        return "/admin";
      }

      if (
        user.role === "BASE_HEAD"
      ) {
        if (
          user.status === "APPROVED" &&
          user.baseId
        ) {
          return "/command";
        }

        if (
          user.status === "PENDING"
        ) {
          return "/waiting-for-approval";
        }

        return "/base-setup";
      }

    } catch (error) {

      console.error(
        "Failed to restore saved user:",
        error
      );
    }

    return "/signin";
  };

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
    location.pathname === "/signup" ||
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
        <AdminNavbar />
      )}



      {/* ======================================================
          INTERNAL / BASE HEAD NAVBAR
      ====================================================== */}

      {!isAuthPage &&
        !isUserPage &&
        !isAdminPage &&
        !isBaseHeadSetupPage && (
          <Navbar
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
              to={getInitialRoute()}
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

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/email-otp"
          element={<OTPVerification />}
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
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/head-requests"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <BaseHeadRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bases"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <BasesOverview />
            </ProtectedRoute>
          }
        />


        {/* ====================================================
            USER
        ==================================================== */}

        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user_info"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserInformation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user_safety"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserSafety />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user_alert"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserAlerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user_assistant"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserAIAssistant />
            </ProtectedRoute>
          }
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
          element={
            <ProtectedRoute allowedRoles={["BASE_HEAD"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/surveillance"
          element={
            <ProtectedRoute allowedRoles={["BASE_HEAD"]}>
              <Surveillance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/threats"
          element={
            <ProtectedRoute allowedRoles={["BASE_HEAD"]}>
              <Threats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/incidents"
          element={
            <ProtectedRoute allowedRoles={["BASE_HEAD"]}>
              <Incidents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/timeline"
          element={
            <ProtectedRoute allowedRoles={["BASE_HEAD"]}>
              <Timeline />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["BASE_HEAD"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistant"
          element={
            <ProtectedRoute allowedRoles={["BASE_HEAD"]}>
              <AI_Assistant />
            </ProtectedRoute>
          }
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