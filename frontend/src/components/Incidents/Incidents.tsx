// components/Incidents.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  UserPlus,
  Search,
  MapPin,
  Radio,
  Signal,
  Crosshair,
  Wifi,
  WifiOff,
  X,
  Check,
  ChevronRight,
  Activity,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

// ============================================================
// TYPES
// ============================================================
interface Personnel {
  id: string;
  name: string;
  email: string;
  status: "ONLINE" | "WEAK_SIGNAL" | "CONNECTION_LOST";
  latitude: number;
  longitude: number;
  lastUpdate: number;
  accuracy: number;
  communication: string;
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  status: "ONLINE" | "WEAK_SIGNAL" | "CONNECTION_LOST";
  role?: string;
  isActive?: boolean;
  authProvider?: string;
  baseId?: string | null;
}

// ============================================================
// COMPONENT
// ============================================================
const Incidents: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<Personnel[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [isAddingUsers, setIsAddingUsers] = useState(false);

  // ---- COLORS ----
  const colors = {
    bg: "#080D0C",
    surface: "#111A16",
    surfaceLighter: "#1A2A24",
    border: "#26352D",
    borderLight: "#354A40",
    textPrimary: "#E6E8E3",
    textSecondary: "#8C9890",
    accentGreen: "#6FAF72",
    accentAmber: "#D59B3A",
    accentOrange: "#D97832",
    accentRed: "#D9534F",
    accentBlue: "#4A8C9E",
  };

  // ---- Fetch registered users from backend ----
  const fetchRegisteredUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);

      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setUsersError("Authentication required. Please login.");
        setLoadingUsers(false);
        return;
      }

      const response = await fetch(`${APIURL}/get_all_users`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch users`);
      }

      const data = await response.json();

      if (data.success) {
        // Map backend users to RegisteredUser format
        const mappedUsers: RegisteredUser[] = data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.isActive ? "ONLINE" : "CONNECTION_LOST",
          role: user.role,
          isActive: user.isActive,
          authProvider: user.authProvider,
          baseId: user.baseId,
        }));
        setRegisteredUsers(mappedUsers);
      } else {
        setUsersError(data.message || "Failed to fetch users");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setUsersError(error.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // ---- Fetch users on component mount ----
  useEffect(() => {
    fetchRegisteredUsers();
  }, []);

  // ---- Initialize with first 3 users as team members (optional) ----
  useEffect(() => {
    if (registeredUsers.length > 0 && teamMembers.length === 0) {
      // Add first 3 users as default team members
      const defaultMembers = registeredUsers.slice(0, Math.min(3, registeredUsers.length)).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        latitude: 28.6 + Math.random() * 0.02,
        longitude: 77.2 + Math.random() * 0.02,
        lastUpdate: Date.now(),
        accuracy: 3 + Math.random() * 8,
        communication: Math.random() > 0.5 ? "LOCAL RADIO LINK" : "SATELLITE LINK",
      }));
      setTeamMembers(defaultMembers);
    }
  }, [registeredUsers]);

  // ---- LIVE LOCATION UPDATES ----
  useEffect(() => {
    const interval = setInterval(() => {
      setTeamMembers((prev) =>
        prev.map((member) => {
          // ============================================
          // CONNECTION LOST
          // ============================================
          // Lost members don't move, but have a small
          // chance to reconnect.
          if (member.status === "CONNECTION_LOST") {
            const reconnectChance = Math.random();

            if (reconnectChance < 0.03) {
              return {
                ...member,
                status: "ONLINE" as const,
                lastUpdate: Date.now(),
              };
            }

            return member;
          }

          // ============================================
          // WEAK SIGNAL
          // ============================================
          const isWeak = member.status === "WEAK_SIGNAL";

          // Weak-signal members update less frequently
          const shouldUpdate =
            !isWeak || Math.random() > 0.5;

          if (!shouldUpdate) {
            return member;
          }

          // ============================================
          // SIMULATE GPS MOVEMENT
          // ============================================
          const latChange =
            (Math.random() - 0.5) * 0.00005;

          const lngChange =
            (Math.random() - 0.5) * 0.00005;

          // ============================================
          // STATUS UPDATE
          // ============================================
          let newStatus: RegisteredUser["status"] =
            member.status;

          const rand = Math.random();

          // --------------------------------------------
          // ONLINE → WEAK_SIGNAL / CONNECTION_LOST
          // --------------------------------------------
          if (member.status === "ONLINE") {
            // 2% chance of connection degradation
            if (rand < 0.02) {
              newStatus =
                Math.random() < 0.8
                  ? "WEAK_SIGNAL"
                  : "CONNECTION_LOST";
            }
          }

          // --------------------------------------------
          // WEAK_SIGNAL → ONLINE / CONNECTION_LOST
          // --------------------------------------------
          else if (member.status === "WEAK_SIGNAL") {
            // 5% chance to recover
            if (rand < 0.05) {
              newStatus = "ONLINE";
            }

            // Next 2% chance to completely lose connection
            else if (rand < 0.07) {
              newStatus = "CONNECTION_LOST";
            }
          }

          // ============================================
          // RETURN UPDATED MEMBER
          // ============================================
          return {
            ...member,
            latitude:
              member.latitude + latChange,
            longitude:
              member.longitude + lngChange,
            lastUpdate: Date.now(),
            status: newStatus,
          };
        })
      );
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ---- Statistics ----
  const stats = {
    total: teamMembers.length,
    online: teamMembers.filter((m) => m.status === "ONLINE").length,
    weakSignal: teamMembers.filter((m) => m.status === "WEAK_SIGNAL").length,
    connectionLost: teamMembers.filter((m) => m.status === "CONNECTION_LOST").length,
  };

  // ---- Status helpers ----
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "ONLINE":
        return colors.accentGreen;
      case "WEAK_SIGNAL":
        return colors.accentAmber;
      case "CONNECTION_LOST":
        return colors.accentRed;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "ONLINE":
        return "ONLINE";
      case "WEAK_SIGNAL":
        return "WEAK SIGNAL";
      case "CONNECTION_LOST":
        return "CONNECTION LOST";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ONLINE":
        return <Wifi size={14} color={colors.accentGreen} />;
      case "WEAK_SIGNAL":
        return <Signal size={14} color={colors.accentAmber} />;
      case "CONNECTION_LOST":
        return <WifiOff size={14} color={colors.accentRed} />;
      default:
        return <Activity size={14} color={colors.textSecondary} />;
    }
  };

  // ---- Modal handlers ----
  const handleAddToTeam = () => {
    const selected = registeredUsers.filter((u) => selectedUsers.includes(u.id));
    const newMembers: Personnel[] = selected.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      latitude: 28.6 + Math.random() * 0.02,
      longitude: 77.2 + Math.random() * 0.02,
      lastUpdate: Date.now(),
      accuracy: 3 + Math.random() * 8,
      communication: Math.random() > 0.5 ? "LOCAL RADIO LINK" : "SATELLITE LINK",
    }));

    const existingIds = new Set(teamMembers.map((m) => m.id));
    const uniqueNewMembers = newMembers.filter((m) => !existingIds.has(m.id));

    setTeamMembers([...teamMembers, ...uniqueNewMembers]);
    setShowCreateModal(false);
    setSelectedUsers([]);
    setSearchTerm("");
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
    setRemoveConfirm(null);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // ---- Filter registered users ----
  const filteredUsers = registeredUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---- STYLES ----
  const containerStyle: React.CSSProperties = {
    background: colors.bg,
    padding: "1.5rem",
    minHeight: "calc(100vh - 82px)",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.textPrimary,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: "0.75rem",
  };

  const headerLeftStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: colors.textPrimary,
  };

  const headerSubtitleStyle: React.CSSProperties = {
    fontSize: "12px",
    color: colors.textSecondary,
    letterSpacing: "0.5px",
  };

  const statusBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
    color: colors.accentGreen,
    border: `1px solid ${colors.accentGreen}33`,
    background: `${colors.accentGreen}15`,
  };

  // ---- STATS ----
  const statsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  };

  const statCardStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "0.75rem",
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: colors.textPrimary,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: "9px",
    fontWeight: 500,
    color: colors.textSecondary,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  // ---- TEAM LIST ----
  const teamListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const memberCardStyle = (status: string, expanded: boolean): React.CSSProperties => {
    const borderColor = getStatusColor(status);
    return {
      background: colors.surface,
      border: `1px solid ${expanded ? borderColor : colors.border}`,
      borderLeft: `4px solid ${borderColor}`,
      padding: expanded ? "1rem" : "0.75rem 1rem",
      cursor: "pointer",
      transition: "all 0.2s",
    };
  };

  const memberHeaderRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const memberNameStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    color: colors.textPrimary,
  };

  const memberInfoStyle: React.CSSProperties = {
    fontSize: "11px",
    color: colors.textSecondary,
  };

  const statusDotStyle = (status: string): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: getStatusColor(status),
    display: "inline-block",
    marginRight: "4px",
    boxShadow: status === "ONLINE" ? `0 0 12px ${colors.accentGreen}44` : "none",
  });

  const statusLabelStyle = (status: string): React.CSSProperties => ({
    fontSize: "10px",
    fontWeight: 600,
    color: getStatusColor(status),
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
  });

  // ---- Expanded details ----
  const detailsStyle: React.CSSProperties = {
    marginTop: "0.75rem",
    paddingTop: "0.75rem",
    borderTop: `1px solid ${colors.border}`,
  };

  const detailRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.25rem 0",
    fontSize: "11px",
    color: colors.textSecondary,
  };

  // ---- Tactical Map ----
  const tacticalMapStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "1rem",
    marginTop: "1.5rem",
    position: "relative",
    minHeight: "300px",
  };

  const mapGridStyle: React.CSSProperties = {
    background: `radial-gradient(circle at 50% 50%, ${colors.surfaceLighter}, ${colors.surface})`,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    height: "280px",
    position: "relative",
    overflow: "hidden",
  };

  // ---- MODAL ----
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "1rem",
  };

  const modalStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "2rem",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
  };

  const modalHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    paddingBottom: "0.75rem",
    borderBottom: `1px solid ${colors.border}`,
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: colors.textPrimary,
  };

  const searchContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    padding: "0.3rem 0.75rem",
    borderRadius: "4px",
    marginBottom: "1rem",
  };

  const searchInputStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: colors.textPrimary,
    fontSize: "13px",
    padding: "0.25rem 0.5rem",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  };

  const userItemStyle = (selected: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem 0.75rem",
    background: selected ? `${colors.accentGreen}15` : "transparent",
    border: `1px solid ${selected ? colors.accentGreen : colors.border}`,
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.15s",
    marginBottom: "0.25rem",
  });

  const modalButtonStyle = (variant: "primary" | "secondary"): React.CSSProperties => ({
    padding: "0.5rem 1.5rem",
    borderRadius: "4px",
    border: variant === "secondary" ? `1px solid ${colors.border}` : "none",
    background: variant === "primary" ? colors.accentGreen : "transparent",
    color: variant === "secondary" ? colors.textSecondary : colors.textPrimary,
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  });

  const removeButtonStyle: React.CSSProperties = {
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    border: `1px solid ${colors.accentRed}33`,
    background: "transparent",
    color: colors.accentRed,
    fontSize: "10px",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
  };

  const createButtonStyle: React.CSSProperties = {
    background: colors.accentGreen,
    border: "none",
    borderRadius: "4px",
    padding: "0.4rem 1rem",
    color: colors.textPrimary,
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    fontFamily: "inherit",
  };

  const refreshButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    padding: "0.3rem 0.6rem",
    color: colors.textSecondary,
    fontSize: "11px",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>
            <Users size={20} style={{ display: "inline", marginRight: "8px", color: colors.accentGreen }} />
            My Team
          </div>
          <div style={headerSubtitleStyle}>
            Personnel coordination & live location tracking
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            style={refreshButtonStyle}
            onClick={fetchRegisteredUsers}
            disabled={loadingUsers}
          >
            <RefreshCw size={12} className={loadingUsers ? "animate-spin" : ""} />
            Refresh
          </button>
          <span style={statusBadgeStyle}>
            <Radio size={12} color={colors.accentGreen} />
            PERSONNEL LINK
            <span style={{ color: colors.accentGreen, fontWeight: 700 }}>ACTIVE</span>
          </span>
          <button style={createButtonStyle} onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create Team
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <span style={statValueStyle}>{stats.total}</span>
          <span style={statLabelStyle}>Total Personnel</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentGreen }}>
          <span style={{ ...statValueStyle, color: colors.accentGreen }}>{stats.online}</span>
          <span style={statLabelStyle}>Active / Online</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentAmber }}>
          <span style={{ ...statValueStyle, color: colors.accentAmber }}>{stats.weakSignal}</span>
          <span style={statLabelStyle}>Weak Signal</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentRed }}>
          <span style={{ ...statValueStyle, color: colors.accentRed }}>{stats.connectionLost}</span>
          <span style={statLabelStyle}>Connection Lost</span>
        </div>
      </div>

      {/* TEAM LIST */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: colors.textSecondary, letterSpacing: "0.8px", textTransform: "uppercase" }}>
          <Users size={14} style={{ display: "inline", marginRight: "6px" }} />
          My Team
        </span>
        <span style={{ fontSize: "10px", color: colors.textSecondary }}>{teamMembers.length} Personnel</span>
      </div>

      {teamMembers.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "3rem 2rem",
          color: colors.textSecondary,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
        }}>
          <Users size={48} style={{ marginBottom: "1rem", opacity: 0.3 }} />
          <div style={{ fontSize: "16px", fontWeight: 600, color: colors.textPrimary, marginBottom: "0.5rem" }}>
            No Team Members
          </div>
          <div style={{ fontSize: "13px", marginBottom: "1.5rem" }}>
            Create a team and add personnel to begin tracking.
          </div>
          <button style={createButtonStyle} onClick={() => setShowCreateModal(true)}>
            <UserPlus size={16} />
            Create Team
          </button>
        </div>
      ) : (
        <div style={teamListStyle}>
          {teamMembers.map((member) => (
            <div
              key={member.id}
              style={memberCardStyle(member.status, expandedMember === member.id)}
              onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
            >
              <div style={memberHeaderRowStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                  <span style={statusDotStyle(member.status)} />
                  <span style={memberNameStyle}>{member.name}</span>
                  <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                    {member.id.slice(0, 8)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={statusLabelStyle(member.status)}>
                    {getStatusIcon(member.status)}
                    {getStatusLabel(member.status)}
                  </span>
                  <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                    <MapPin size={12} style={{ display: "inline", marginRight: "2px" }} />
                    {member.latitude.toFixed(4)}°N, {member.longitude.toFixed(4)}°E
                  </span>
                  <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                    {member.status === "ONLINE" ? "Live" : `${Math.round((Date.now() - member.lastUpdate) / 1000)}s ago`}
                  </span>
                  <button
                    style={removeButtonStyle}
                    onClick={(e) => { e.stopPropagation(); setRemoveConfirm(member.id); }}
                  >
                    <Trash2 size={12} />
                  </button>
                  <ChevronRight
                    size={16}
                    style={{
                      transform: expandedMember === member.id ? "rotate(90deg)" : "none",
                      transition: "transform 0.2s",
                      color: colors.textSecondary,
                    }}
                  />
                </div>
              </div>

              {expandedMember === member.id && (
                <div style={detailsStyle}>
                  <div style={detailRowStyle}>
                    <span>Personnel ID</span>
                    <span style={{ color: colors.textPrimary }}>{member.id}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Email</span>
                    <span style={{ color: colors.textPrimary }}>{member.email}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Status</span>
                    <span style={{ color: getStatusColor(member.status) }}>
                      {getStatusLabel(member.status)}
                    </span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Latitude</span>
                    <span style={{ color: colors.textPrimary }}>{member.latitude.toFixed(6)}° N</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Longitude</span>
                    <span style={{ color: colors.textPrimary }}>{member.longitude.toFixed(6)}° E</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Last Update</span>
                    <span style={{ color: colors.textPrimary }}>
                      {new Date(member.lastUpdate).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Location Accuracy</span>
                    <span style={{ color: colors.textPrimary }}>± {member.accuracy.toFixed(1)} m</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Communication</span>
                    <span style={{ color: colors.textPrimary }}>{member.communication}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TACTICAL MAP */}
      {teamMembers.length > 0 && (
        <div style={tacticalMapStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, color: colors.textSecondary, letterSpacing: "0.8px", textTransform: "uppercase" }}>
              <Crosshair size={14} style={{ display: "inline", marginRight: "6px" }} />
              Tactical Location View
            </span>
            <span style={{ fontSize: "9px", color: colors.textSecondary }}>
              {teamMembers.filter(m => m.status === "ONLINE").length} active
            </span>
          </div>
          <div style={mapGridStyle}>
            {/* Grid lines */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(to right, ${colors.border} 1px, transparent 1px),
                linear-gradient(to bottom, ${colors.border} 1px, transparent 1px)
              `,
              backgroundSize: "20% 20%",
              opacity: 0.3,
            }} />

            {/* Personnel markers */}
            {teamMembers.map((member) => {
              // Normalize coordinates to percentage (within a small bounding box)
              const latMin = 28.61;
              const latMax = 28.62;
              const lngMin = 77.205;
              const lngMax = 77.215;

              const x = ((member.longitude - lngMin) / (lngMax - lngMin)) * 100;
              const y = ((member.latitude - latMin) / (latMax - latMin)) * 100;

              const isOnline = member.status === "ONLINE";
              const color = getStatusColor(member.status);

              return (
                <div
                  key={member.id}
                  style={{
                    position: "absolute",
                    left: `${Math.min(95, Math.max(5, x))}%`,
                    top: `${Math.min(95, Math.max(5, y))}%`,
                    transform: "translate(-50%, -50%)",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                >
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: color,
                    boxShadow: isOnline ? `0 0 20px ${color}66` : `0 0 8px ${color}44`,
                    border: `2px solid ${colors.bg}`,
                    animation: isOnline ? "pulse-dot 2s infinite" : "none",
                  }}>
                    <div style={{
                      position: "absolute",
                      top: "-16px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "8px",
                      fontWeight: 600,
                      color: colors.textPrimary,
                      whiteSpace: "nowrap",
                      background: "rgba(0,0,0,0.7)",
                      padding: "1px 4px",
                      borderRadius: "2px",
                    }}>
                      {member.id.slice(0, 8)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              fontSize: "8px",
              color: colors.textSecondary,
              background: "rgba(0,0,0,0.7)",
              padding: "0.25rem 0.5rem",
              borderRadius: "2px",
              display: "flex",
              gap: "0.5rem",
            }}>
              <span style={{ color: colors.accentGreen }}>● Online</span>
              <span style={{ color: colors.accentAmber }}>● Weak</span>
              <span style={{ color: colors.accentRed }}>● Lost</span>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE DIALOG */}
      {removeConfirm && (
        <div style={modalOverlayStyle} onClick={() => setRemoveConfirm(null)}>
          <div style={{ ...modalStyle, maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div style={modalTitleStyle}>Remove Personnel</div>
              <button
                style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer" }}
                onClick={() => setRemoveConfirm(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: "1.5rem", color: colors.textSecondary, fontSize: "13px" }}>
              Are you sure you want to remove this team member?
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                style={modalButtonStyle("secondary")}
                onClick={() => setRemoveConfirm(null)}
              >
                Cancel
              </button>
              <button
                style={{ ...modalButtonStyle("primary"), background: colors.accentRed }}
                onClick={() => handleRemoveMember(removeConfirm)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      {showCreateModal && (
        <div style={modalOverlayStyle} onClick={() => { setShowCreateModal(false); setSelectedUsers([]); setSearchTerm(""); }}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={modalTitleStyle}>Create Team</div>
                <div style={{ fontSize: "12px", color: colors.textSecondary, marginTop: "0.25rem" }}>
                  Select personnel to add to this operational team
                </div>
              </div>
              <button
                style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer" }}
                onClick={() => { setShowCreateModal(false); setSelectedUsers([]); setSearchTerm(""); }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingUsers ? (
              <div style={{ textAlign: "center", padding: "2rem", color: colors.textSecondary }}>
                <Loader2 size={32} className="animate-spin" style={{ marginBottom: "0.5rem" }} />
                <div>Loading personnel...</div>
              </div>
            ) : usersError ? (
              <div style={{
                padding: "1rem",
                background: `${colors.accentRed}15`,
                border: `1px solid ${colors.accentRed}`,
                borderRadius: "4px",
                color: colors.accentRed,
                fontSize: "13px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <AlertCircle size={18} />
                {usersError}
                <button
                  style={{
                    marginLeft: "auto",
                    padding: "0.2rem 0.6rem",
                    background: colors.accentRed,
                    border: "none",
                    borderRadius: "3px",
                    color: colors.textPrimary,
                    cursor: "pointer",
                    fontSize: "11px",
                    fontFamily: "inherit",
                  }}
                  onClick={fetchRegisteredUsers}
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div style={searchContainerStyle}>
                  <Search size={14} color={colors.textSecondary} />
                  <input
                    style={searchInputStyle}
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem" }}>
                  {filteredUsers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem", color: colors.textSecondary, fontSize: "13px" }}>
                      {searchTerm ? "No users found matching your search" : "No registered users available"}
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelected = selectedUsers.includes(user.id);
                      const alreadyInTeam = teamMembers.some((m) => m.id === user.id);
                      const statusColor = getStatusColor(user.status);

                      return (
                        <div
                          key={user.id}
                          style={userItemStyle(isSelected)}
                          onClick={() => {
                            if (!alreadyInTeam) {
                              toggleUserSelection(user.id);
                            }
                          }}
                        >
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: `${statusColor}20`,
                            border: `1px solid ${statusColor}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: colors.textPrimary,
                            flexShrink: 0,
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: 500, color: colors.textPrimary }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: "11px", color: colors.textSecondary }}>
                              {user.email}
                            </div>
                            {user.role && (
                              <div style={{ fontSize: "9px", color: colors.textSecondary, marginTop: "2px" }}>
                                Role: {user.role} • {user.isActive ? "Active" : "Inactive"}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "9px", fontWeight: 600, color: statusColor }}>
                              {user.status}
                            </span>
                            {alreadyInTeam ? (
                              <span style={{ fontSize: "9px", fontWeight: 600, color: colors.accentGreen }}>
                                ✓ Added
                              </span>
                            ) : isSelected ? (
                              <Check size={16} color={colors.accentGreen} />
                            ) : (
                              <div style={{
                                width: "16px",
                                height: "16px",
                                border: `1px solid ${colors.border}`,
                                borderRadius: "3px",
                              }} />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: "11px", color: colors.textSecondary }}>
                {selectedUsers.length} selected
              </span>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  style={modalButtonStyle("secondary")}
                  onClick={() => { setShowCreateModal(false); setSelectedUsers([]); setSearchTerm(""); }}
                >
                  Cancel
                </button>
                <button
                  style={modalButtonStyle("primary")}
                  onClick={handleAddToTeam}
                  disabled={selectedUsers.length === 0 || loadingUsers}
                >
                  <UserPlus size={16} style={{ display: "inline", marginRight: "4px" }} />
                  Add to Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KEYFRAMES */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Incidents;