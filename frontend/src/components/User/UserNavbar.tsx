// components/UserNavbar.tsx
import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  Bell,
  Shield,
  Info,
  Bot,
  ChevronDown,
  LogOut,
} from "lucide-react";
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
  const [currentUserName, setCurrentUserName] = useState(userName);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);


  const handleLogout = () => {
    // Remove authentication/session data
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    // In case any old sessionStorage token exists
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    // Close menus
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);

    // Redirect to signin
    window.location.href = "/signin";
  };


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch(`${APIURL}/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to fetch current user:", data.message);
          return;
        }

        if (data.user?.name) {
          setCurrentUserName(data.user.name);
        }
      } catch (error) {
        console.error("Current user fetch error:", error);
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

  const userMenuContainerStyle: React.CSSProperties = {
    position: "relative",
  };

  const userDropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: "210px",
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: "6px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    overflow: "hidden",
    zIndex: 2000,
  };

  const userDropdownHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
  };

  const userDropdownAvatarStyle: React.CSSProperties = {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700,
    color: colors.textPrimary,
    flexShrink: 0,
  };

  const userDropdownUserInfoStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    minWidth: 0,
  };

  const dropdownDividerStyle: React.CSSProperties = {
    height: "1px",
    background: colors.border,
  };

  const logoutButtonStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px 12px",
    border: "none",
    background: "transparent",
    color: "#D87874",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  };

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
    padding: "0 1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
    gap: "0.5rem",
  };

  const leftSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexShrink: 0,
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
    flexShrink: 0,
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

  // Desktop Navigation - Hidden on mobile
  const navContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  };

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    background: active ? colors.surface : "transparent",
    border: "none",
    padding: "0.4rem 0.75rem",
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
    gap: "0.5rem",
    flexShrink: 0,
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
    flexShrink: 0,
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 500,
    color: colors.textSecondary,
  };

  // Mobile Menu Button - Visible only on mobile
  const mobileMenuButtonStyle: React.CSSProperties = {
    display: "flex",
    background: "transparent",
    border: "none",
    color: colors.textPrimary,
    cursor: "pointer",
    padding: "4px",
    alignItems: "center",
    justifyContent: "center",
  };

  const mobileMenuStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: colors.bg,
    borderTop: `1px solid ${colors.border}`,
    padding: "1rem 1rem",
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
        {/* Left Section - Brand */}
        <div style={leftSectionStyle}>
          <div style={brandIconStyle}>SA</div>
          <div style={brandTextStyle}>
            <span style={brandPrimaryStyle}>Sudarshana-AI</span>
            <span style={brandSecondaryStyle}>Public Safety & Awareness</span>
          </div>
        </div>

        {/* Center Navigation - Desktop Only */}
        <div style={navContainerStyle} className="desktop-nav">
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
          <div style={userMenuContainerStyle}>
            <button
              type="button"
              style={userWrapperStyle}
              onClick={() =>
                setIsUserMenuOpen(!isUserMenuOpen)
              }
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
            >
              <div style={avatarStyle}>
                {currentUserName.charAt(0).toUpperCase()}
              </div>

              <span style={userNameStyle}>
                {currentUserName}
              </span>

              <ChevronDown
                size={15}
                style={{
                  transform: isUserMenuOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {isUserMenuOpen && (
              <div style={userDropdownStyle}>
                <div style={userDropdownHeaderStyle}>
                  <div style={userDropdownAvatarStyle}>
                    {currentUserName.charAt(0).toUpperCase()}
                  </div>

                  <div style={userDropdownUserInfoStyle}>
                    <strong>{currentUserName}</strong>
                    <span>USER</span>
                  </div>
                </div>

                <div style={dropdownDividerStyle} />

                <button
                  type="button"
                  style={logoutButtonStyle}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Visible on mobile */}
          <button
            style={mobileMenuButtonStyle}
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Visible when open */}
      {isMobileMenuOpen && (
        <div style={mobileMenuStyle} className="mobile-menu">
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



      {/* Responsive CSS */}
      <style>{`
        /* Hide desktop nav on tablet and mobile */
        @media (max-width: 992px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }

        

        /* Show desktop nav, hide mobile button on large screens */
        @media (min-width: 993px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }

        /* Mobile small screens */
        @media (max-width: 480px) {
          .user-nav-inner {
            padding: 0 0.5rem !important;
            height: 56px !important;
          }
          .user-nav-brand-primary {
            font-size: 12px !important;
          }
          .user-nav-brand-secondary {
            display: none !important;
          }
          .user-nav-brand-icon {
            width: 28px !important;
            height: 28px !important;
            font-size: 10px !important;
          }
          .user-nav-username {
            font-size: 11px !important;
            display: none !important;
          }
          .user-nav-user-wrapper {
            padding: 0.2rem 0.3rem !important;
          }
          .user-nav-right {
            gap: 0.3rem !important;
          }
          .mobile-menu {
            padding: 0.75rem !important;
          }
          .user-nav-mobile-link {
            padding: 0.5rem 0.75rem !important;
            font-size: 13px !important;
          }
          .user-nav-mobile-link svg {
            width: 16px !important;
            height: 16px !important;
          }
        }

        /* Tablet */
        @media (min-width: 481px) and (max-width: 992px) {
          .user-nav-inner {
            padding: 0 1rem !important;
          }
          .user-nav-brand-primary {
            font-size: 14px !important;
          }
          .user-nav-brand-secondary {
            font-size: 8px !important;
          }
          .user-nav-brand-icon {
            width: 32px !important;
            height: 32px !important;
            font-size: 12px !important;
          }
          .user-nav-avatar {
            width: 24px !important;
            height: 24px !important;
            font-size: 10px !important;
          }
          .user-nav-username {
            font-size: 12px !important;
          }
          .user-nav-user-wrapper {
            padding: 0.2rem 0.4rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserNavbar;