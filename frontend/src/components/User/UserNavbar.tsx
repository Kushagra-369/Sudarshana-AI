// components/UserNavbar.tsx
import React, { useEffect, useState, } from "react";
import { Menu, X, Home, Bell, Shield, Info, Bot } from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

export interface UserNavbarProps {
  activePage?: "home" | "alerts" | "safety" | "information" | "assistant";
  onNavigate?: (page: string) => void;
  notificationCount?: number;
  userName?: string;
}

const UserNavbar: React.FC<UserNavbarProps> = ({
  activePage = "home",
  onNavigate,
  notificationCount = 0,
  userName = "Guest",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [currentUserName, setCurrentUserName] =
    useState(userName);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token =
          sessionStorage.getItem("authToken");

        if (!token) {
          return;
        }

        const response = await fetch(
          `${APIURL}/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Failed to fetch current user:",
            data.message
          );
          return;
        }

        if (data.user?.name) {
          setCurrentUserName(data.user.name);
        }
      } catch (error) {
        console.error(
          "Current user fetch error:",
          error
        );
      }
    };

    fetchCurrentUser();
  }, []);

  const colors = {
    bg: "#0D1412",
    surface: "#1A2622",
    border: "#2A3A34",
    textPrimary: "#E6E8E3",
    textSecondary: "#8C9890",
    accentGreen: "#6FAF72",
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "safety", label: "Safety", icon: Shield },
    { id: "information", label: "Information", icon: Info },
    { id: "assistant", label: "AI Assistant", icon: Bot },
  ];

  const containerStyle: React.CSSProperties = {
    background: colors.bg,
    borderBottom: `1px solid ${colors.border}`,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.textPrimary,
    position: "sticky",
    top: 0,
    zIndex: 1000,
  };

  const innerContainerStyle: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
  };

  const leftSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const brandIconStyle: React.CSSProperties = {
    width: "36px",
    height: "36px",
    background: `linear-gradient(135deg, #2A4A3A, ${colors.accentGreen})`,
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "14px",
    color: colors.textPrimary,
    letterSpacing: "0.5px",
    border: `1px solid ${colors.border}`,
  };

  const brandTextStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  };

  const brandPrimaryStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: colors.textPrimary,
    letterSpacing: "0.3px",
  };

  const brandSecondaryStyle: React.CSSProperties = {
    fontSize: "9px",
    fontWeight: 500,
    color: colors.textSecondary,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  };

  const navContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  };

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    background: active ? colors.surface : "transparent",
    border: "none",
    padding: "0.4rem 1rem",
    fontSize: "13px",
    fontWeight: active ? 600 : 500,
    color: active ? colors.textPrimary : colors.textSecondary,
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    fontFamily: "inherit",
    letterSpacing: "0.2px",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    ...(active && {
      borderBottom: `2px solid ${colors.accentGreen}`,
      borderRadius: "4px 4px 0 0",
    }),
  });

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  const userWrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    border: `1px solid ${colors.border}`,
    background: colors.surface,
  };

  const avatarStyle: React.CSSProperties = {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 600,
    color: colors.textPrimary,
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 500,
    color: colors.textSecondary,
  };

  const mobileMenuButtonStyle: React.CSSProperties = {
    display: "none",
    background: "transparent",
    border: "none",
    color: colors.textPrimary,
    cursor: "pointer",
    padding: "4px",
  };

  const mobileMenuStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: colors.bg,
    borderTop: `1px solid ${colors.border}`,
    padding: "1rem 1.5rem",
    gap: "0.5rem",
  };

  const mobileNavLinkStyle = (active: boolean): React.CSSProperties => ({
    background: active ? colors.surface : "transparent",
    border: "none",
    padding: "0.6rem 1rem",
    fontSize: "14px",
    fontWeight: active ? 600 : 500,
    color: active ? colors.textPrimary : colors.textSecondary,
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    textAlign: "left",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    ...(active && {
      borderLeft: `3px solid ${colors.accentGreen}`,
    }),
  });

  return (
    <div style={containerStyle}>
      <div style={innerContainerStyle}>
        {/* Left Section */}
        <div style={leftSectionStyle}>
          <div style={brandIconStyle}>SA</div>
          <div style={brandTextStyle}>
            <span style={brandPrimaryStyle}>Sudarshana-AI</span>
            <span style={brandSecondaryStyle}>Public Safety & Awareness</span>
          </div>
        </div>

        {/* Center Navigation - Desktop */}
        <div style={navContainerStyle}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                style={navLinkStyle(activePage === item.id)}
                onClick={() => onNavigate?.(item.id)}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Section */}
        <div style={rightSectionStyle}>
          <div style={userWrapperStyle}>
            <div style={avatarStyle}>
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <span style={userNameStyle}>
              {currentUserName}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            style={mobileMenuButtonStyle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={mobileMenuStyle}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                style={mobileNavLinkStyle(activePage === item.id)}
                onClick={() => {
                  onNavigate?.(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserNavbar;