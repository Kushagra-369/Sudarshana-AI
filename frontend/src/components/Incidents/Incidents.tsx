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
  AlertTriangle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { APIURL } from "../../GlobalAPIURL";

// ============================================================
// TYPES
// ============================================================
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  updatedAt?: string;
}

interface Personnel {
  id: string;
  name: string;
  email: string;
  status: "ONLINE" | "WEAK_SIGNAL" | "CONNECTION_LOST";
  latitude: number | null;
  longitude: number | null;
  lastUpdate: number | null;
  accuracy: number | null;
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
  location: LocationData | null;
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

  // ---- ALARM STATE ----
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousLostUsersRef = useRef<Set<string>>(new Set());
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [lostUsers, setLostUsers] = useState<string[]>([]);
  const [showAlertBanner, setShowAlertBanner] = useState(false);

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

  // ---- Status helper based on location age ----
  const getUserStatus = (
    isActive: boolean,
    location: LocationData | null
  ): "ONLINE" | "WEAK_SIGNAL" | "CONNECTION_LOST" => {
    if (!isActive) return "CONNECTION_LOST";
    if (!location?.updatedAt) return "CONNECTION_LOST";

    const lastUpdate = new Date(location.updatedAt).getTime();
    const age = Date.now() - lastUpdate;

    if (age <= 30000) return "ONLINE";
    if (age <= 90000) return "WEAK_SIGNAL";
    return "CONNECTION_LOST";
  };

  // ---- Fetch registered users from backend ----
  const fetchRegisteredUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        setUsersError("Authentication required. Please login.");
        return;
      }

      const response = await fetch(`${APIURL}/get_all_users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch users`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch users");
      }

      const mappedUsers: RegisteredUser[] = data.users.map((user: any) => {
        const location: LocationData | null = user.location
          ? {
            latitude: user.location.latitude,
            longitude: user.location.longitude,
            accuracy: user.location.accuracy,
            updatedAt: user.location.updatedAt,
          }
          : null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          status: getUserStatus(user.isActive, location),
          role: user.role,
          isActive: user.isActive,
          authProvider: user.authProvider,
          baseId: user.baseId,
          location,
        };
      });

      setRegisteredUsers(mappedUsers);

      // Update team members with fresh backend data
      setTeamMembers((currentMembers) => {
        // FIRST LOAD / PAGE RELOAD - Initialize with first 3 users
        if (currentMembers.length === 0) {
          return mappedUsers
            .slice(0, Math.min(3, mappedUsers.length))
            .map((user): Personnel => ({
              id: user.id,
              name: user.name,
              email: user.email,
              status: user.status,
              latitude: user.location?.latitude ?? null,
              longitude: user.location?.longitude ?? null,
              lastUpdate: user.location?.updatedAt
                ? new Date(user.location.updatedAt).getTime()
                : null,
              accuracy: user.location?.accuracy ?? null,
              communication: "LOCAL RADIO LINK",
            }));
        }

        // EXISTING TEAM - Update only members already in the team
        return currentMembers.map((member) => {
          const updatedUser = mappedUsers.find((user) => user.id === member.id);
          if (!updatedUser) return member;

          return {
            ...member,
            name: updatedUser.name,
            email: updatedUser.email,
            status: updatedUser.status,
            latitude: updatedUser.location?.latitude ?? null,
            longitude: updatedUser.location?.longitude ?? null,
            accuracy: updatedUser.location?.accuracy ?? null,
            lastUpdate: updatedUser.location?.updatedAt
              ? new Date(updatedUser.location.updatedAt).getTime()
              : null,
          };
        });
      });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setUsersError(error.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // ---- Fetch on mount and every 10 seconds ----
  useEffect(() => {
    fetchRegisteredUsers();
    const interval = setInterval(fetchRegisteredUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  // ---- ALARM SETUP ----
  useEffect(() => {
    const audio = new Audio("/videos/alarm.wav");
    audio.loop = true;
    audio.volume = 0.8;
    alarmAudioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // ---- ALARM LOGIC ----
  // ---- ALARM LOGIC ----
  useEffect(() => {
    const currentLostUsers = teamMembers
      .filter((member) => member.status === "CONNECTION_LOST")
      .map((member) => member.id);

    setLostUsers(currentLostUsers);

    const lostSet = new Set(currentLostUsers);
    const prevLostSet = previousLostUsersRef.current;

    const hasNewLost = currentLostUsers.some(
      (id) => !prevLostSet.has(id)
    );

    setShowAlertBanner(currentLostUsers.length > 0);

    const audio = alarmAudioRef.current;

    // 🔴 New connection lost OR alarm manually enabled while someone is already lost
    if (
      currentLostUsers.length > 0 &&
      alarmEnabled &&
      audio &&
      (hasNewLost || !prevLostSet.size)
    ) {
      audio.currentTime = 0;

      audio.play()
        .then(() => {
          setIsAlarmPlaying(true);
        })
        .catch((err) => {
          console.error("ALARM PLAY FAILED:", err);
          setIsAlarmPlaying(false);
        });
    }

    // 🟢 Everyone connected again
    if (currentLostUsers.length === 0 && audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsAlarmPlaying(false);
    }

    previousLostUsersRef.current = lostSet;
  }, [teamMembers, alarmEnabled]);

  // ---- Enable/Disable Alarm ----
  const toggleAlarm = async () => {
    const audio = alarmAudioRef.current;

    if (!audio) {
      console.error("Alarm audio is not initialized");
      return;
    }

    if (!alarmEnabled) {
      try {
        // Browser permission unlock
        audio.currentTime = 0;
        await audio.play();

        // Immediately stop test sound
        audio.pause();
        audio.currentTime = 0;

        setAlarmEnabled(true);

        // 🚨 IMPORTANT:
        // If someone is ALREADY connection lost,
        // start the alarm immediately.
        const hasLostPersonnel = teamMembers.some(
          (member) => member.status === "CONNECTION_LOST"
        );

        if (hasLostPersonnel) {
          audio.currentTime = 0;

          await audio.play();

          setIsAlarmPlaying(true);
        }

      } catch (err) {
        console.error("Could not enable alarm:", err);

        setAlarmEnabled(true);
      }

    } else {
      // 🔇 Disable alarm
      audio.pause();
      audio.currentTime = 0;

      setIsAlarmPlaying(false);
      setAlarmEnabled(false);
    }
  };

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
      latitude: u.location?.latitude ?? null,
      longitude: u.location?.longitude ?? null,
      lastUpdate: u.location?.updatedAt ? new Date(u.location.updatedAt).getTime() : null,
      accuracy: u.location?.accuracy ?? null,
      communication: "LOCAL RADIO LINK",
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
    flexWrap: "wrap",
    gap: "0.5rem",
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

  // ---- ALARM BANNER ----
  const alarmBannerStyle: React.CSSProperties = {
    background: `${colors.accentRed}20`,
    border: `2px solid ${colors.accentRed}`,
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    display: showAlertBanner ? "flex" : "none",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "4px",
    flexWrap: "wrap",
    gap: "0.5rem",
    animation: "pulse-banner 1.5s ease-in-out infinite",
  };

  const alarmTextStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: colors.accentRed,
    fontWeight: 700,
    fontSize: "13px",
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
    const isLost = status === "CONNECTION_LOST";
    return {
      background: colors.surface,
      border: `1px solid ${expanded ? borderColor : colors.border}`,
      borderLeft: `4px solid ${borderColor}`,
      padding: expanded ? "1rem" : "0.75rem 1rem",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: isLost ? `0 0 20px ${colors.accentRed}33` : "none",
    };
  };

  const memberHeaderRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.25rem",
  };

  const memberNameStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    color: colors.textPrimary,
  };



  const statusDotStyle = (status: string): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: getStatusColor(status),
    display: "inline-block",
    marginRight: "4px",
    boxShadow: status === "ONLINE" ? `0 0 12px ${colors.accentGreen}44` : status === "CONNECTION_LOST" ? `0 0 20px ${colors.accentRed}66` : "none",
    animation: status === "CONNECTION_LOST" ? "pulse-dot 0.8s infinite" : "none",
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
    flexWrap: "wrap",
    gap: "0.25rem",
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
    flexWrap: "wrap",
    gap: "0.5rem",
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
    flexWrap: "wrap",
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

  const alarmButtonStyle = (enabled: boolean): React.CSSProperties => ({
    padding: "0.3rem 0.75rem",
    borderRadius: "4px",
    border: `1px solid ${enabled ? colors.accentRed : colors.border}`,
    background: enabled ? `${colors.accentRed}20` : "transparent",
    color: enabled ? colors.accentRed : colors.textSecondary,
    fontSize: "10px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    transition: "all 0.15s",
  });

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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button
            style={alarmButtonStyle(alarmEnabled)}
            onClick={toggleAlarm}
            title={alarmEnabled ? "Disable alarm" : "Enable alarm"}
          >
            {alarmEnabled ? (
              <>
                {isAlarmPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
                {isAlarmPlaying ? "ALARM ACTIVE" : "ALARM ON"}
              </>
            ) : (
              <>
                <VolumeX size={14} />
                ALARM OFF
              </>
            )}
          </button>
          <button style={refreshButtonStyle} onClick={fetchRegisteredUsers} disabled={loadingUsers}>
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

      {/* ALARM BANNER */}
      <div style={alarmBannerStyle}>
        <div style={alarmTextStyle}>
          <AlertTriangle size={20} />
          <span>
            {lostUsers.length > 0
              ? `⚠️ ${lostUsers.length} PERSONNEL CONNECTION LOST`
              : "✅ All personnel connected"}
          </span>
        </div>
        <div style={{ fontSize: "11px", color: colors.textSecondary }}>
          {isAlarmPlaying && alarmEnabled ? (
            <span style={{ color: colors.accentRed, fontWeight: 700 }}>🔊 ALARM ACTIVE</span>
          ) : lostUsers.length > 0 ? (
            <span style={{ color: colors.accentAmber }}>Alarm disabled</span>
          ) : (
            <span style={{ color: colors.accentGreen }}>All clear</span>
          )}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.25rem" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, flexWrap: "wrap" }}>
                  <span style={statusDotStyle(member.status)} />
                  <span style={memberNameStyle}>{member.name}</span>
                  <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                    {member.id.slice(0, 8)}
                  </span>
                  {member.status === "CONNECTION_LOST" && (
                    <span style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      color: colors.accentRed,
                      background: `${colors.accentRed}15`,
                      padding: "0.1rem 0.4rem",
                      borderRadius: "2px",
                    }}>
                      LOST
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <span style={statusLabelStyle(member.status)}>
                    {getStatusIcon(member.status)}
                    {getStatusLabel(member.status)}
                  </span>
                  {member.latitude !== null && member.longitude !== null ? (
                    <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                      <MapPin size={12} style={{ display: "inline", marginRight: "2px" }} />
                      {member.latitude.toFixed(4)}°N, {member.longitude.toFixed(4)}°E
                    </span>
                  ) : (
                    <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                      <MapPin size={12} style={{ display: "inline", marginRight: "2px" }} />
                      No Location
                    </span>
                  )}
                  <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                    {member.status === "ONLINE" ? "Live" : member.lastUpdate ? `${Math.round((Date.now() - member.lastUpdate) / 1000)}s ago` : "No data"}
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
                    <span style={{ color: colors.textPrimary }}>{member.latitude !== null ? `${member.latitude.toFixed(6)}° N` : "N/A"}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Longitude</span>
                    <span style={{ color: colors.textPrimary }}>{member.longitude !== null ? `${member.longitude.toFixed(6)}° E` : "N/A"}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Last Update</span>
                    <span style={{ color: colors.textPrimary }}>
                      {member.lastUpdate ? new Date(member.lastUpdate).toLocaleTimeString() : "N/A"}
                    </span>
                  </div>
                  <div style={detailRowStyle}>
                    <span>Location Accuracy</span>
                    <span style={{ color: colors.textPrimary }}>{member.accuracy !== null ? `± ${member.accuracy.toFixed(1)} m` : "N/A"}</span>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.25rem" }}>
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

            {/* Personnel markers - Only show users with real coordinates */}
            {teamMembers.map((member) => {
              // Only show on map if coordinates exist
              if (member.latitude === null || member.longitude === null) return null;

              // Find min/max for dynamic scaling
              const validMembers = teamMembers.filter(
                (m) => m.latitude !== null && m.longitude !== null
              );

              const lats = validMembers.map((m) => m.latitude!);
              const lngs = validMembers.map((m) => m.longitude!);

              const latMin = lats.length ? Math.min(...lats) - 0.002 : 0;
              const latMax = lats.length ? Math.max(...lats) + 0.002 : 1;
              const lngMin = lngs.length ? Math.min(...lngs) - 0.002 : 0;
              const lngMax = lngs.length ? Math.max(...lngs) + 0.002 : 1;

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
                    boxShadow: isOnline ? `0 0 20px ${color}66` : member.status === "CONNECTION_LOST" ? `0 0 30px ${color}77` : `0 0 8px ${color}44`,
                    border: `2px solid ${colors.bg}`,
                    animation: isOnline ? "pulse-dot 2s infinite" : member.status === "CONNECTION_LOST" ? "pulse-dot 0.8s infinite" : "none",
                  }}>
                    <div style={{
                      position: "absolute",
                      top: "-16px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "8px",
                      fontWeight: 600,
                      color: member.status === "CONNECTION_LOST" ? colors.accentRed : colors.textPrimary,
                      whiteSpace: "nowrap",
                      background: "rgba(0,0,0,0.7)",
                      padding: "1px 4px",
                      borderRadius: "2px",
                    }}>
                      {member.id.slice(0, 8)}
                      {member.status === "CONNECTION_LOST" && " ⚠"}
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
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button style={modalButtonStyle("secondary")} onClick={() => setRemoveConfirm(null)}>
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
                flexWrap: "wrap",
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
                      const hasLocation = user.location !== null;

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
                          <div style={{ flex: 1, minWidth: "120px" }}>
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
                            {hasLocation && user.location && (
                              <div style={{ fontSize: "9px", color: colors.textSecondary, marginTop: "2px" }}>
                                <MapPin size={10} style={{ display: "inline", marginRight: "2px" }} />
                                {user.location.latitude.toFixed(4)}°N, {user.location.longitude.toFixed(4)}°E
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: `1px solid ${colors.border}`, flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ fontSize: "11px", color: colors.textSecondary }}>
                {selectedUsers.length} selected
              </span>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
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
        @keyframes pulse-banner {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 768px) {
          .incidents-stats {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .incidents-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Incidents;