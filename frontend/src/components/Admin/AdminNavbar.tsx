// src/components/Admin/AdminNavbar.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  LogOut, 
  Menu, 
  X,
  ChevronDown
} from "lucide-react";

interface AdminNavbarProps {
  adminName?: string;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ adminName = "Admin" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const colors = {
    bg: "#080D0C",
    surface: "#121A16",
    border: "#26352D",
    textPrimary: "#E6E8E3",
    textSecondary: "#8C9890",
    accentGreen: "#6FAF72",
    accentRed: "#D9534F",
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { id: "head-requests", label: "Head Requests", icon: Users, path: "/admin/head-requests" },
    { id: "bases", label: "Bases", icon: Building2, path: "/admin/bases" },
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
    background: `linear-gradient(135deg, #1A3A2A, ${colors.accentGreen})`,
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
    cursor: "pointer",
    position: "relative",
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

  const dropdownMenuStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 8px)",
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
    padding: "0.4rem 1rem",
    fontSize: "12px",
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

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    sessionStorage.removeItem("adminPendingAuth");
    navigate("/signin");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div style={containerStyle}>
      <div style={innerContainerStyle}>
        {/* Left Section */}
        <div style={leftSectionStyle}>
          <div style={brandIconStyle}>SA</div>
          <div style={brandTextStyle}>
            <span style={brandPrimaryStyle}>Sudarshana-AI</span>
            <span style={brandSecondaryStyle}>Administrator</span>
          </div>
        </div>

        {/* Center Navigation - Desktop */}
        <div style={navContainerStyle}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                style={navLinkStyle(isActive(item.path))}
                onClick={() => handleNavigate(item.path)}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Section */}
        <div style={rightSectionStyle}>
          <div 
            style={userWrapperStyle}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div style={avatarStyle}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span style={userNameStyle}>{adminName}</span>
            <ChevronDown size={14} color={colors.textSecondary} />
            
            {isProfileOpen && (
              <div style={dropdownMenuStyle}>
                <button 
                  style={dropdownItemStyle}
                  onClick={handleLogout}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.surface;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
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
                style={mobileNavLinkStyle(isActive(item.path))}
                onClick={() => handleNavigate(item.path)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
          <div style={{
            borderTop: `1px solid ${colors.border}`,
            paddingTop: "0.5rem",
            marginTop: "0.5rem",
          }}>
            <button
              style={mobileNavLinkStyle(false)}
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar;