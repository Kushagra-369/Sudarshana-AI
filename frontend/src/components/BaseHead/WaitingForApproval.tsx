// src/components/BaseHead/WaitingForApproval.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  User,
  Mail,
  Building2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Lock,

} from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  baseId?: string;
  createdAt?: string;
}

const WaitingForApproval: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const colors = {
    bg: "#080D0C",
    surface: "#111A16",
    surfaceLighter: "#1A2622",
    border: "#26352D",
    borderLight: "#354A40",
    textPrimary: "#E6E8E3",
    textSecondary: "#8C9890",
    accentGreen: "#6FAF72",
    accentAmber: "#D6A84F",
    accentRed: "#D9534F",
    accentBlue: "#4A8C9E",
  };

  useEffect(() => {
    const authUser = sessionStorage.getItem("authUser");
    const token = sessionStorage.getItem("authToken");

    if (!authUser || !token) {
      navigate("/signin");
      return;
    }

    try {
      const parsedUser = JSON.parse(authUser);
      setUser(parsedUser);

      // Check if user is already approved (redirect if approved)
      if (parsedUser.status === "APPROVED" && parsedUser.baseId) {
        navigate("/command");
      }

      // If rejected, show rejection message
      if (parsedUser.status === "REJECTED") {
        setStatusMessage("Your Base Head application was rejected by the administrator.");
      }

      // If suspended
      if (parsedUser.status === "SUSPENDED") {
        setStatusMessage("Your account has been suspended.");
      }
    } catch (err) {
      navigate("/signin");
    }
  }, [navigate]);

  const checkApprovalStatus = async () => {
    try {
      setCheckingStatus(true);
      setError(null);

      const token = sessionStorage.getItem("authToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${APIURL}/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("authUser");
          navigate("/signin");
          return;
        }
        throw new Error("Failed to check status");
      }

      const data = await response.json();
      const updatedUser = data.user || data;

      // Update session storage
      sessionStorage.setItem("authUser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Check status
      if (updatedUser.status === "APPROVED" && updatedUser.baseId) {
        // Approved! Navigate to command
        navigate("/command");
        return;
      }

      if (updatedUser.status === "REJECTED") {
        setStatusMessage("Your Base Head application was rejected by the administrator.");
        return;
      }

      if (updatedUser.status === "SUSPENDED") {
        setStatusMessage("Your account has been suspended.");
        return;
      }

      // Still pending
      setStatusMessage("Your application is still under administrator review.");
    } catch (err: any) {
      setError(err.message || "Failed to check status");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    navigate("/signin");
  };

  const containerStyle: React.CSSProperties = {
    background: colors.bg,
    minHeight: "calc(100vh - 64px)",
    padding: "2rem 1.5rem",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.textPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: "600px",
    width: "100%",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "2.5rem",
    textAlign: "center",
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: "2rem",
  };

  const iconWrapperStyle: React.CSSProperties = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: `${colors.accentAmber}15`,
    border: `2px solid ${colors.accentAmber}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 700,
    color: colors.textPrimary,
    marginBottom: "0.5rem",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "14px",
    color: colors.textSecondary,
    lineHeight: 1.6,
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    let color = colors.accentAmber;
    let bg = `${colors.accentAmber}15`;
    if (status === "APPROVED") { color = colors.accentGreen; bg = `${colors.accentGreen}15`; }
    if (status === "REJECTED") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
    if (status === "SUSPENDED") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
    return {
      display: "inline-block",
      padding: "0.25rem 1rem",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: 600,
      color,
      background: bg,
      marginTop: "0.5rem",
    };
  };

  const timelineStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    margin: "2rem 0",
    textAlign: "left",
  };

  const timelineItemStyle = (completed: boolean, active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    opacity: completed ? 1 : active ? 0.8 : 0.4,
  });

  const timelineIconStyle = (completed: boolean, active: boolean): React.CSSProperties => {
    let color = colors.textSecondary;
    if (completed) color = colors.accentGreen;
    else if (active) color = colors.accentAmber;
    return {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      background: completed ? `${colors.accentGreen}15` : active ? `${colors.accentAmber}15` : colors.surfaceLighter,
      border: `2px solid ${color}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    };
  };

  const timelineTextStyle = (completed: boolean, active: boolean): React.CSSProperties => ({
    color: completed ? colors.textPrimary : active ? colors.textSecondary : colors.textSecondary,
    fontSize: "14px",
    fontWeight: completed ? 600 : 500,
  });

  const userInfoStyle: React.CSSProperties = {
    background: colors.surfaceLighter,
    border: `1px solid ${colors.border}`,
    padding: "1rem",
    marginBottom: "1.5rem",
    textAlign: "left",
  };

  const userInfoRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.3rem 0",
    fontSize: "13px",
    borderBottom: `1px solid ${colors.border}`,
  };

  const userInfoLabelStyle: React.CSSProperties = {
    color: colors.textSecondary,
  };

  const userInfoValueStyle: React.CSSProperties = {
    color: colors.textPrimary,
    fontWeight: 500,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0.6rem 1.5rem",
    background: colors.accentGreen,
    border: "none",
    borderRadius: "4px",
    color: colors.textPrimary,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    justifyContent: "center",
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.6,
    cursor: "not-allowed",
  };

  const logoutButtonStyle: React.CSSProperties = {
    padding: "0.6rem 1.5rem",
    background: "transparent",
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    color: colors.textSecondary,
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    justifyContent: "center",
  };

  const errorStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    background: `${colors.accentRed}15`,
    border: `1px solid ${colors.accentRed}`,
    borderRadius: "4px",
    color: colors.accentRed,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  };

  const isRejected = user?.status === "REJECTED";
  const isSuspended = user?.status === "SUSPENDED";
  const isPending = user?.status === "PENDING";

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {isRejected || isSuspended ? (
          // Rejected/Suspended State
          <>
            <div style={headerStyle}>
              <div style={iconWrapperStyle}>
                <XCircle size={40} color={colors.accentRed} />
              </div>
              <div style={titleStyle}>
                {isRejected ? "Application Rejected" : "Account Suspended"}
              </div>
              <div style={subtitleStyle}>
                {statusMessage || "Your application has been rejected."}
              </div>
              <div style={statusBadgeStyle(user?.status || "REJECTED")}>
                {user?.status || "REJECTED"}
              </div>
            </div>
            <button
              style={logoutButtonStyle}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.accentRed;
                e.currentTarget.style.color = colors.accentRed;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          // Pending State
          <>
            <div style={headerStyle}>
              <div style={iconWrapperStyle}>
                <Clock size={40} color={colors.accentAmber} />
              </div>
              <div style={titleStyle}>Awaiting Administrator Approval</div>
              <div style={subtitleStyle}>
                Your Base Head application has been submitted successfully. An administrator must review and approve your request before command access is granted.
              </div>
              <div style={statusBadgeStyle("PENDING")}>PENDING</div>
            </div>

            {/* User Info */}
            {user && (
              <div style={userInfoStyle}>
                <div style={userInfoRowStyle}>
                  <span style={userInfoLabelStyle}>
                    <User size={14} style={{ display: "inline", marginRight: "4px" }} />
                    Name
                  </span>
                  <span style={userInfoValueStyle}>{user.name}</span>
                </div>
                <div style={userInfoRowStyle}>
                  <span style={userInfoLabelStyle}>
                    <Mail size={14} style={{ display: "inline", marginRight: "4px" }} />
                    Email
                  </span>
                  <span style={userInfoValueStyle}>{user.email}</span>
                </div>
                <div style={userInfoRowStyle}>
                  <span style={userInfoLabelStyle}>
                    <Shield size={14} style={{ display: "inline", marginRight: "4px" }} />
                    Role
                  </span>
                  <span style={userInfoValueStyle}>{user.role}</span>
                </div>
                <div style={userInfoRowStyle}>
                  <span style={userInfoLabelStyle}>
                    <Clock size={14} style={{ display: "inline", marginRight: "4px" }} />
                    Status
                  </span>
                  <span style={{ ...userInfoValueStyle, color: colors.accentAmber }}>{user.status}</span>
                </div>
                {user.baseId && (
                  <div style={userInfoRowStyle}>
                    <span style={userInfoLabelStyle}>
                      <Building2 size={14} style={{ display: "inline", marginRight: "4px" }} />
                      Base ID
                    </span>
                    <span style={userInfoValueStyle}>{user.baseId}</span>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div style={timelineStyle}>
              <div style={timelineItemStyle(true, false)}>
                <div style={timelineIconStyle(true, false)}>
                  <CheckCircle size={18} color={colors.accentGreen} />
                </div>
                <div>
                  <div style={timelineTextStyle(true, false)}>Application Submitted</div>
                  <div style={{ fontSize: "12px", color: colors.textSecondary }}>
                    Base information submitted successfully
                  </div>
                </div>
              </div>

              <div style={timelineItemStyle(false, true)}>
                <div style={timelineIconStyle(false, true)}>
                  <Clock size={18} color={colors.accentAmber} />
                </div>
                <div>
                  <div style={timelineTextStyle(false, true)}>Administrator Review</div>
                  <div style={{ fontSize: "12px", color: colors.textSecondary }}>
                    Waiting for administrator approval
                  </div>
                </div>
              </div>

              <div style={timelineItemStyle(false, false)}>
                <div style={timelineIconStyle(false, false)}>
                  <Lock size={18} color={colors.textSecondary} />
                </div>
                <div>
                  <div style={timelineTextStyle(false, false)}>Command Access</div>
                  <div style={{ fontSize: "12px", color: colors.textSecondary }}>
                    Access granted upon approval
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={errorStyle}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {statusMessage && (
              <div style={{
                padding: "0.75rem 1rem",
                background: `${colors.accentBlue}15`,
                border: `1px solid ${colors.accentBlue}`,
                borderRadius: "4px",
                color: colors.textSecondary,
                fontSize: "13px",
                marginBottom: "1rem",
              }}>
                {statusMessage}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                style={checkingStatus ? buttonDisabledStyle : buttonStyle}
                onClick={checkApprovalStatus}
                disabled={checkingStatus}
              >
                <RefreshCw size={18} className={checkingStatus ? "animate-spin" : ""} />
                {checkingStatus ? "Checking..." : "Check Approval Status"}
              </button>

              <button
                style={logoutButtonStyle}
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.accentRed;
                  e.currentTarget.style.color = colors.accentRed;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WaitingForApproval;