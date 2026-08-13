// components/Timeline.tsx
import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Filter,
  Search,
  ChevronRight,
  AlertTriangle,

  Target,

  Circle,

  AlertOctagon,
  Zap,
  Navigation,
  Shield
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface TimelineEvent {
  id: string;
  type: "DETECTION" | "TRACKING" | "ANOMALY" | "THREAT" | "INCIDENT" | "SYSTEM";
  category: "OBJECT" | "MOVEMENT" | "ALERT" | "STATUS";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  timestamp: string;
  message: string;
  location?: string;
  sector?: string;
  objectId?: string;
  trackId?: string;
  score?: number;
  details?: string;
  status?: "ACTIVE" | "RESOLVED" | "UNDER_REVIEW";
}

// ============================================================
// MOCK DATA
// ============================================================
const mockEvents: TimelineEvent[] = [
  {
    id: "EVT-001",
    type: "THREAT",
    category: "ALERT",
    severity: "CRITICAL",
    timestamp: "2025-04-13 14:32:18",
    message: "Vehicle detected in restricted zone",
    location: "Sector B - Main Road",
    sector: "B",
    objectId: "OBJ-001",
    trackId: "TRK-001",
    score: 82,
    details: "Vehicle entered restricted sector B with unusual timing.",
    status: "ACTIVE",
  },
  {
    id: "EVT-002",
    type: "ANOMALY",
    category: "MOVEMENT",
    severity: "HIGH",
    timestamp: "2025-04-13 14:28:45",
    message: "Unusual movement pattern detected",
    location: "Sector A - Checkpoint",
    sector: "A",
    objectId: "OBJ-002",
    trackId: "TRK-002",
    score: 67,
    details: "Person exhibiting unusual movement patterns near checkpoint.",
    status: "UNDER_REVIEW",
  },
  {
    id: "EVT-003",
    type: "TRACKING",
    category: "OBJECT",
    severity: "INFO",
    timestamp: "2025-04-13 14:25:30",
    message: "Object tracking initiated",
    location: "Sector C - Highway",
    sector: "C",
    objectId: "OBJ-003",
    trackId: "TRK-003",
    details: "Vehicle #03 tracking started with 78% confidence.",
    status: "ACTIVE",
  },
  {
    id: "EVT-004",
    type: "DETECTION",
    category: "OBJECT",
    severity: "INFO",
    timestamp: "2025-04-13 14:22:15",
    message: "New object detected",
    location: "Sector B - East Gate",
    sector: "B",
    objectId: "OBJ-005",
    trackId: "TRK-005",
    details: "Vehicle detected at East Gate with 85% confidence.",
    status: "ACTIVE",
  },
  {
    id: "EVT-005",
    type: "THREAT",
    category: "ALERT",
    severity: "HIGH",
    timestamp: "2025-04-13 14:18:42",
    message: "Unauthorized presence detected",
    location: "Sector B - East Gate",
    sector: "B",
    objectId: "OBJ-005",
    trackId: "TRK-005",
    score: 72,
    details: "Vehicle detected with unauthorized presence.",
    status: "ACTIVE",
  },
  {
    id: "EVT-006",
    type: "ANOMALY",
    category: "MOVEMENT",
    severity: "MEDIUM",
    timestamp: "2025-04-13 14:15:22",
    message: "Abnormal speed detected",
    location: "Sector C - Highway",
    sector: "C",
    objectId: "OBJ-003",
    trackId: "TRK-003",
    score: 48,
    details: "Vehicle detected with abnormal speed pattern.",
    status: "ACTIVE",
  },
  {
    id: "EVT-007",
    type: "INCIDENT",
    category: "ALERT",
    severity: "LOW",
    timestamp: "2025-04-13 13:58:03",
    message: "Loitering detected at perimeter",
    location: "Sector D - Perimeter",
    sector: "D",
    objectId: "OBJ-004",
    trackId: "TRK-004",
    score: 35,
    details: "Person briefly loitering at perimeter.",
    status: "RESOLVED",
  },
  {
    id: "EVT-008",
    type: "SYSTEM",
    category: "STATUS",
    severity: "INFO",
    timestamp: "2025-04-13 13:45:00",
    message: "System status updated",
    details: "All systems operational. Local processing active.",
    status: "ACTIVE",
  },
  {
    id: "EVT-009",
    type: "DETECTION",
    category: "OBJECT",
    severity: "INFO",
    timestamp: "2025-04-13 13:42:51",
    message: "New object detected at East Gate",
    location: "Sector B - East Gate",
    sector: "B",
    objectId: "OBJ-005",
    details: "Vehicle detected with suspicious timing.",
  },
  {
    id: "EVT-010",
    type: "TRACKING",
    category: "OBJECT",
    severity: "INFO",
    timestamp: "2025-04-13 13:38:27",
    message: "Object tracking lost",
    location: "Sector C - Highway",
    sector: "C",
    objectId: "OBJ-006",
    trackId: "TRK-006",
    details: "Tracking lost due to object exiting camera view.",
    status: "RESOLVED",
  },
];

// ============================================================
// COMPONENT
// ============================================================
const Timeline: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterSector, setFilterSector] = useState<string>("ALL");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

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
    accentPurple: "#8A6EB0",
  };

  // ---- STYLES ----
  const containerStyle: React.CSSProperties = {
    background: colors.bg,
    padding: "1.5rem",
    minHeight: "calc(100vh - 82px)",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.textPrimary,
  };

  // ---- HEADER ----
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

  // ---- FILTERS ----
  const filterBarStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    alignItems: "center",
  };

  const searchContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "0.3rem 0.75rem",
    borderRadius: "4px",
    flex: 1,
    minWidth: "200px",
  };

  const searchInputStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: colors.textPrimary,
    fontSize: "12px",
    padding: "0.25rem 0.5rem",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  };

  const filterSelectStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    padding: "0.3rem 0.75rem",
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
  };

  // ---- TIMELINE ----
  const timelineContainerStyle: React.CSSProperties = {
    position: "relative",
    paddingLeft: "2rem",
  };

  const timelineLineStyle: React.CSSProperties = {
    position: "absolute",
    left: "6px",
    top: 0,
    bottom: 0,
    width: "2px",
    background: colors.border,
  };

  const eventItemStyle = (severity: string, expanded: boolean): React.CSSProperties => {
    let dotColor = colors.border;
    if (severity === "CRITICAL") dotColor = colors.accentRed;
    else if (severity === "HIGH") dotColor = colors.accentOrange;
    else if (severity === "MEDIUM") dotColor = colors.accentAmber;
    else if (severity === "LOW") dotColor = colors.accentBlue;
    else dotColor = colors.textSecondary;
    
    return {
      position: "relative",
      marginBottom: "0.75rem",
      padding: expanded ? "0.75rem" : "0.5rem 0.75rem",
      background: expanded ? colors.surfaceLighter : "transparent",
      border: expanded ? `1px solid ${dotColor}44` : "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s",
    };
  };

  const eventDotStyle = (severity: string): React.CSSProperties => {
    let color = colors.border;
    if (severity === "CRITICAL") color = colors.accentRed;
    else if (severity === "HIGH") color = colors.accentOrange;
    else if (severity === "MEDIUM") color = colors.accentAmber;
    else if (severity === "LOW") color = colors.accentBlue;
    else color = colors.textSecondary;
    
    return {
      position: "absolute",
      left: "-1.5rem",
      top: "0.5rem",
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: color,
      border: `2px solid ${colors.bg}`,
      boxShadow: `0 0 8px ${color}44`,
    };
  };

  const eventHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const eventTypeStyle = (type: string): React.CSSProperties => {
    const typeColors: Record<string, string> = {
      DETECTION: colors.accentGreen,
      TRACKING: colors.accentBlue,
      ANOMALY: colors.accentAmber,
      THREAT: colors.accentRed,
      INCIDENT: colors.accentOrange,
      SYSTEM: colors.accentPurple,
    };
    return {
      fontSize: "10px",
      fontWeight: 600,
      color: typeColors[type] || colors.textSecondary,
      letterSpacing: "0.5px",
    };
  };

  const severityBadgeStyle = (severity: string): React.CSSProperties => {
    let color = colors.textSecondary;
    let bg = "transparent";
    if (severity === "CRITICAL") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
    else if (severity === "HIGH") { color = colors.accentOrange; bg = `${colors.accentOrange}15`; }
    else if (severity === "MEDIUM") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
    else if (severity === "LOW") { color = colors.accentBlue; bg = `${colors.accentBlue}15`; }
    else { color = colors.textSecondary; bg = `${colors.textSecondary}15`; }
    return {
      fontSize: "8px",
      fontWeight: 600,
      color,
      background: bg,
      padding: "0.1rem 0.4rem",
      borderRadius: "2px",
      letterSpacing: "0.3px",
    };
  };

  // ============================================================
  // RENDER
  // ============================================================
  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "ALL" || event.type === filterType;
    const matchesSeverity = filterSeverity === "ALL" || event.severity === filterSeverity;
    const matchesSector = filterSector === "ALL" || event.sector === filterSector;
    return matchesSearch && matchesType && matchesSeverity && matchesSector;
  });

  // Get unique sectors for filter
  const sectors = Array.from(new Set(mockEvents.map(e => e.sector).filter(Boolean)));

  const getEventIcon = (type: string): React.ReactNode => {
    switch(type) {
      case "DETECTION": return <Target size={12} />;
      case "TRACKING": return <Navigation size={12} />;
      case "ANOMALY": return <Zap size={12} />;
      case "THREAT": return <AlertTriangle size={12} />;
      case "INCIDENT": return <AlertOctagon size={12} />;
      case "SYSTEM": return <Shield size={12} />;
      default: return <Circle size={12} />;
    }
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>Event Timeline</div>
          <div style={headerSubtitleStyle}>
            <Clock size={14} style={{ display: "inline", marginRight: "6px" }} />
            Chronological operational events
          </div>
        </div>
        <div style={{ fontSize: "11px", color: colors.textSecondary }}>
          <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* FILTERS */}
      <div style={filterBarStyle}>
        <div style={searchContainerStyle}>
          <Search size={14} color={colors.textSecondary} />
          <input
            style={searchInputStyle}
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          style={filterSelectStyle}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="DETECTION">Detection</option>
          <option value="TRACKING">Tracking</option>
          <option value="ANOMALY">Anomaly</option>
          <option value="THREAT">Threat</option>
          <option value="INCIDENT">Incident</option>
          <option value="SYSTEM">System</option>
        </select>

        <select
          style={filterSelectStyle}
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
        >
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="INFO">Info</option>
        </select>

        <select
          style={filterSelectStyle}
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
        >
          <option value="ALL">All Sectors</option>
          {sectors.map(s => (
            <option key={s} value={s}>Sector {s}</option>
          ))}
        </select>

        <div style={{ fontSize: "11px", color: colors.textSecondary }}>
          <Filter size={12} style={{ display: "inline", marginRight: "4px" }} />
          {filteredEvents.length} events
        </div>
      </div>

      {/* TIMELINE */}
      <div style={timelineContainerStyle}>
        <div style={timelineLineStyle} />
        
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            style={eventItemStyle(event.severity, expandedEvent === event.id)}
            onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
          >
            <div style={eventDotStyle(event.severity)} />
            
            <div style={eventHeaderStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                <span style={eventTypeStyle(event.type)}>
                  {getEventIcon(event.type)} {event.type}
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  {event.message}
                </span>
                {event.score && (
                  <span style={{ fontSize: "11px", fontWeight: 700, color: colors.accentAmber }}>
                    {event.score}/100
                  </span>
                )}
                {event.status && (
                  <span style={{
                    fontSize: "8px",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "2px",
                    border: `1px solid ${event.status === "ACTIVE" ? colors.accentRed : event.status === "RESOLVED" ? colors.accentGreen : colors.accentOrange}`,
                    color: event.status === "ACTIVE" ? colors.accentRed : event.status === "RESOLVED" ? colors.accentGreen : colors.accentOrange,
                  }}>
                    {event.status}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                  {event.timestamp.split(" ")[1]}
                </span>
                <span style={severityBadgeStyle(event.severity)}>
                  {event.severity}
                </span>
                <ChevronRight
                  size={14}
                  style={{
                    transform: expandedEvent === event.id ? "rotate(90deg)" : "none",
                    transition: "transform 0.2s",
                    color: colors.textSecondary,
                  }}
                />
              </div>
            </div>

            {expandedEvent === event.id && (
              <div style={{
                marginTop: "0.5rem",
                paddingTop: "0.5rem",
                borderTop: `1px solid ${colors.border}`,
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem", fontSize: "11px" }}>
                  <div style={{ color: colors.textSecondary }}>
                    <span>Event ID: </span>
                    <span style={{ color: colors.textPrimary }}>{event.id}</span>
                  </div>
                  {event.location && (
                    <div style={{ color: colors.textSecondary }}>
                      <span>Location: </span>
                      <span style={{ color: colors.textPrimary }}>{event.location}</span>
                    </div>
                  )}
                  {event.sector && (
                    <div style={{ color: colors.textSecondary }}>
                      <span>Sector: </span>
                      <span style={{ color: colors.textPrimary }}>{event.sector}</span>
                    </div>
                  )}
                  {event.objectId && (
                    <div style={{ color: colors.textSecondary }}>
                      <span>Object: </span>
                      <span style={{ color: colors.textPrimary }}>{event.objectId}</span>
                    </div>
                  )}
                  {event.trackId && (
                    <div style={{ color: colors.textSecondary }}>
                      <span>Track: </span>
                      <span style={{ color: colors.textPrimary }}>{event.trackId}</span>
                    </div>
                  )}
                  <div style={{ color: colors.textSecondary, gridColumn: "1 / -1" }}>
                    <span>Details: </span>
                    <span style={{ color: colors.textPrimary }}>{event.details}</span>
                  </div>
                  <div style={{ color: colors.textSecondary, gridColumn: "1 / -1" }}>
                    <span>Timestamp: </span>
                    <span style={{ color: colors.textPrimary }}>{event.timestamp}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;