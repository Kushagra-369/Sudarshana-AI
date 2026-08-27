// components/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  Activity,
  LogOut,

} from "lucide-react";

// ====================================================================
// TYPES
// ====================================================================
export type NavPage =
  | "command"
  | "surveillance"
  | "threats"
  | "incidents"
  | "timeline"
  | "analytics"
  | "assistant";

export interface NavbarProps {
  activePage?: NavPage;
  onNavigate?: (page: NavPage) => void;
  notificationCount?: number;
  operatorName?: string;
  isOperational?: boolean;
}

// ====================================================================
// MOCK NOTIFICATIONS
// ====================================================================
const mockNotifications = [
  {
    id: "n1",
    level: "CRITICAL",
    message: "Vehicle detected in Sector B",
    time: "07:32",
  },
  {
    id: "n2",
    level: "HIGH",
    message: "Anomaly detected in Sector A",
    time: "07:28",
  },
  {
    id: "n3",
    level: "REVIEW",
    message: "Incident requires human review",
    time: "07:15",
  },
];

// ====================================================================
// COMPONENT
// ====================================================================
const Navbar: React.FC<NavbarProps> = ({
  activePage = "command",
  onNavigate,
  notificationCount = 5,
  operatorName = "",
  isOperational = true,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOperatorMenu, setShowOperatorMenu] = useState(false);
  const [actualOperatorName, setActualOperatorName] = useState(operatorName);
  const notifRef = useRef<HTMLDivElement>(null);
  const operatorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const location = useLocation();

  const currentPage: NavPage =
    location.pathname === "/surveillance"
      ? "surveillance"
      : location.pathname === "/threats"
        ? "threats"
        : location.pathname === "/incidents"
          ? "incidents"
          : location.pathname === "/timeline"
            ? "timeline"
            : location.pathname === "/analytics"
              ? "analytics"
              : location.pathname === "/assistant"
                ? "assistant"
                : "command";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:4321/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.success && data.user?.name) {
          setActualOperatorName(data.user.name);

          // Also keep sessionStorage updated
          sessionStorage.setItem(
            "authUser",
            JSON.stringify(data.user)
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch current user:",
          error
        );
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (operatorRef.current && !operatorRef.current.contains(e.target as Node)) {
        setShowOperatorMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const timeStr = currentTime.toLocaleTimeString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = currentTime.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const navItems: { id: NavPage; label: string }[] = [
    { id: "command", label: "COMMAND" },
    { id: "surveillance", label: "SURVEILLANCE" },
    { id: "threats", label: "RESTRICTED ZONES" },
    { id: "incidents", label: "MY TEAM" },
    { id: "timeline", label: "TIMELINE" },
    { id: "analytics", label: "ANALYTICS" },
    { id: "assistant", label: "AI ASSISTANT" },
  ];

  // ---- COLORS ----
  const colors = {
    bg: "#080D0C",
    surface: "#0D1513",
    surfaceLighter: "#111A16",
    border: "#1A2A24",
    borderLight: "#26352D",
    textPrimary: "#C5D0C8",
    textSecondary: "#7A8F82",
    accentGreen: "#3A8C5A",
    accentGold: "#B8945C",
    accentOrange: "#C87A3A",
    accentRed: "#A84A3A",
    activeBg: "#0F1A16",
  };

  // ---- STYLES ----
  const containerStyle: React.CSSProperties = {
    background: colors.bg,
    borderBottom: `1px solid ${colors.border}`,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.textPrimary,
    userSelect: "none",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "48px",
    padding: "0 1.5rem",
    borderBottom: `1px solid ${colors.border}`,
  };

  const leftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const brandIconStyle: React.CSSProperties = {
    width: "28px",
    height: "28px",
    background: `linear-gradient(135deg, #1A3A2A, ${colors.accentGreen})`,
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "11px",
    color: colors.textPrimary,
    letterSpacing: "0.5px",
    border: `1px solid ${colors.borderLight}`,
  };

  const brandTextStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  };

  const brandPrimaryStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.3px",
    color: colors.textPrimary,
  };

  const brandSecondaryStyle: React.CSSProperties = {
    fontSize: "8px",
    fontWeight: 500,
    letterSpacing: "0.8px",
    color: colors.textSecondary,
    textTransform: "uppercase",
  };

  const centerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    fontSize: "11px",
  };

  const statusGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const dotStyle = (active: boolean, color: string = colors.accentGreen): React.CSSProperties => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: active ? color : "#2A3A32",
    boxShadow: active ? `0 0 8px ${color}44` : "none",
    animation: active ? "pulse-dot 1.8s infinite" : "none",
  });

  const statusLabelStyle: React.CSSProperties = {
    fontWeight: 500,
    fontSize: "10px",
    letterSpacing: "0.5px",
    color: colors.textSecondary,
    textTransform: "uppercase",
  };

  const statusValueStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "10px",
    letterSpacing: "0.5px",
    color: colors.accentGreen,
    textTransform: "uppercase",
  };

  const dividerStyle: React.CSSProperties = {
    width: "1px",
    height: "16px",
    background: colors.border,
  };

  const timeStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 400,
    color: colors.textSecondary,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.2px",
  };

  const rightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const notifWrapperStyle: React.CSSProperties = {
    position: "relative",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    color: colors.textSecondary,
  };

  const notifBadgeStyle: React.CSSProperties = {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    background: colors.accentRed,
    color: "#fff",
    fontSize: "8px",
    fontWeight: 700,
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `2px solid ${colors.bg}`,
  };

  const operatorWrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
    transition: "background 0.15s",
    position: "relative",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    sessionStorage.removeItem("adminPendingAuth");
    sessionStorage.removeItem("pendingLoginUser");

    setShowOperatorMenu(false);

    navigate("/signin", { replace: true });
  };

  const avatarStyle: React.CSSProperties = {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: colors.surfaceLighter,
    border: `1px solid ${colors.borderLight}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: 600,
    color: colors.textPrimary,
  };

  const operatorNameStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 500,
    color: colors.textSecondary,
    letterSpacing: "0.2px",
  };

  const dropdownPanelStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    padding: "0.25rem 0",
    minWidth: "160px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
    zIndex: 100,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: "0.35rem 1rem",
    fontSize: "11px",
    color: colors.textSecondary,
    cursor: "pointer",
    transition: "background 0.15s",
    background: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const notifPanelStyle: React.CSSProperties = {
    ...dropdownPanelStyle,
    minWidth: "220px",
    right: 0,
  };

  const notifItemStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    borderBottom: `1px solid ${colors.border}`,
    fontSize: "11px",
    lineHeight: 1.3,
  };

  const navStripStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: "34px",
    padding: "0 1.5rem",
    gap: "0.25rem",
    overflowX: "auto",
    whiteSpace: "nowrap",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    background: active ? colors.activeBg : "transparent",
    border: "none",
    padding: "0.25rem 1rem",
    fontSize: "10px",
    fontWeight: 500,
    color: active ? colors.textPrimary : colors.textSecondary,
    letterSpacing: "0.8px",
    cursor: "pointer",
    borderRadius: "3px",
    transition: "all 0.2s ease",
    position: "relative",
    fontFamily: "inherit",
    ...(active && {
      borderBottom: `2px solid ${colors.accentGreen}`,
      borderRadius: "3px 3px 0 0",
    }),
  });

  useEffect(() => {
    const style = document.createElement("style");

    style.textContent = `
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return (
    <div style={containerStyle}>
      {/* HEADER ROW */}
      <div style={headerStyle}>
        {/* LEFT */}
        <div style={leftStyle}>
          <div style={brandIconStyle}>SA</div>
          <div style={brandTextStyle}>
            <span style={brandPrimaryStyle}>SUDARSHANA-AI</span>
            <span style={brandSecondaryStyle}>DEFENCE INTELLIGENCE SYSTEM</span>
          </div>
        </div>

        {/* CENTER */}
        <div style={centerStyle}>
          <div style={statusGroupStyle}>
            <span style={dotStyle(isOperational)} />
            <span style={statusLabelStyle}>STATUS</span>
            <span style={statusValueStyle}>
              {isOperational ? "OPERATIONAL" : "DEGRADED"}
            </span>
          </div>

          <div style={dividerStyle} />

          <div style={statusGroupStyle}>
            <span style={{ ...dotStyle(true, colors.accentGold) }} />
            <span style={statusLabelStyle}>PROCESSING</span>
            <span style={{ ...statusValueStyle, color: colors.accentGold }}>
              LOCAL
            </span>
          </div>

          <div style={dividerStyle} />

          <div style={timeStyle}>
            {dateStr} · {timeStr}
          </div>
        </div>

        {/* RIGHT */}
        <div style={rightStyle}>
          <div style={notifWrapperStyle} ref={notifRef} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={16} />
            {notificationCount > 0 && (
              <span style={notifBadgeStyle}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
            {showNotifications && (
              <div style={notifPanelStyle}>
                {mockNotifications.map((n) => (
                  <div key={n.id} style={notifItemStyle}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "9px",
                        color:
                          n.level === "CRITICAL"
                            ? colors.accentRed
                            : n.level === "HIGH"
                              ? colors.accentOrange
                              : colors.textSecondary,
                        letterSpacing: "0.3px",
                      }}
                    >
                      {n.level}
                    </div>
                    <div style={{ color: colors.textPrimary }}>{n.message}</div>
                    <div style={{ fontSize: "9px", color: colors.textSecondary, marginTop: "2px" }}>
                      {n.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={operatorWrapperStyle}
            ref={operatorRef}
            onClick={() => setShowOperatorMenu(!showOperatorMenu)}
          >
            <div style={avatarStyle}>
              {(actualOperatorName || "User")
                .charAt(0)
                .toUpperCase()}
            </div>
            <span style={operatorNameStyle}>
              {actualOperatorName || "User"}
            </span>
            <ChevronDown size={12} color={colors.textSecondary} />
            {showOperatorMenu && (
              <div style={dropdownPanelStyle}>
                <button style={dropdownItemStyle}>
                  <User size={14} /> Profile
                </button>
                <button style={dropdownItemStyle}>
                  <Settings size={14} /> Settings
                </button>
                <button style={dropdownItemStyle}>
                  <Activity size={14} /> System Status
                </button>
                <hr style={{ border: "none", borderTop: `1px solid ${colors.border}`, margin: "0.25rem 0" }} />
                <button
                  style={dropdownItemStyle}
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION STRIP */}
      <div style={navStripStyle}>
        {navItems.map((item) => (
          <button
            key={item.id}
            style={navLinkStyle(currentPage === item.id)}
            onClick={() => {
              navigate(`/${item.id}`);
              onNavigate?.(item.id);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navbar;