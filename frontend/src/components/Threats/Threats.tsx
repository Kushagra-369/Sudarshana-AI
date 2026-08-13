// components/Threats.tsx
import React, { useState } from "react";
import {
  AlertTriangle,

  ChevronRight,
  Filter,
  Search,

  Activity,

  Clock as ClockIcon,

} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface Threat {
  id: string;
  type: "Vehicle" | "Person" | "Other";
  location: string;
  sector: string;
  timestamp: string;
  score: number;
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  confidence: number;
  reasons: string[];
  status: "ACTIVE" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  trackId: string;
  objectId: string;
  detectedAt: string;
  lastUpdated: string;
  description: string;
}

// ============================================================
// MOCK DATA
// ============================================================
const mockThreats: Threat[] = [
  {
    id: "THR-001",
    type: "Vehicle",
    location: "Sector B - Main Road",
    sector: "B",
    timestamp: "2025-04-13 14:32:18",
    score: 82,
    level: "CRITICAL",
    confidence: 94,
    reasons: ["Restricted zone entry", "Unusual timestamp", "Abnormal movement pattern"],
    status: "ACTIVE",
    trackId: "TRK-001",
    objectId: "OBJ-001",
    detectedAt: "2025-04-13 14:32:18",
    lastUpdated: "2025-04-13 14:35:22",
    description: "Vehicle entered restricted sector B with unusual timing and movement pattern.",
  },
  {
    id: "THR-002",
    type: "Person",
    location: "Sector A - Checkpoint",
    sector: "A",
    timestamp: "2025-04-13 14:28:45",
    score: 67,
    level: "HIGH",
    confidence: 91,
    reasons: ["Unusual movement pattern", "Proximity to restricted zone"],
    status: "ACTIVE",
    trackId: "TRK-002",
    objectId: "OBJ-002",
    detectedAt: "2025-04-13 14:28:45",
    lastUpdated: "2025-04-13 14:30:12",
    description: "Person exhibiting unusual movement patterns near checkpoint A.",
  },
  {
    id: "THR-003",
    type: "Vehicle",
    location: "Sector C - Highway",
    sector: "C",
    timestamp: "2025-04-13 14:15:22",
    score: 48,
    level: "MEDIUM",
    confidence: 78,
    reasons: ["Abnormal speed", "Erratic movement"],
    status: "UNDER_REVIEW",
    trackId: "TRK-003",
    objectId: "OBJ-003",
    detectedAt: "2025-04-13 14:15:22",
    lastUpdated: "2025-04-13 14:20:45",
    description: "Vehicle detected with abnormal speed pattern on highway C.",
  },
  {
    id: "THR-004",
    type: "Person",
    location: "Sector D - Perimeter",
    sector: "D",
    timestamp: "2025-04-13 13:58:03",
    score: 35,
    level: "LOW",
    confidence: 65,
    reasons: ["Brief loitering"],
    status: "RESOLVED",
    trackId: "TRK-004",
    objectId: "OBJ-004",
    detectedAt: "2025-04-13 13:58:03",
    lastUpdated: "2025-04-13 14:05:30",
    description: "Person briefly loitering at perimeter D, resolved.",
  },
  {
    id: "THR-005",
    type: "Vehicle",
    location: "Sector B - East Gate",
    sector: "B",
    timestamp: "2025-04-13 13:42:51",
    score: 72,
    level: "HIGH",
    confidence: 85,
    reasons: ["Unauthorized presence", "Suspicious timing"],
    status: "ACTIVE",
    trackId: "TRK-005",
    objectId: "OBJ-005",
    detectedAt: "2025-04-13 13:42:51",
    lastUpdated: "2025-04-13 13:48:33",
    description: "Vehicle detected at East Gate with unauthorized presence.",
  },
];

// ============================================================
// COMPONENT
// ============================================================
const Threats: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [expandedThreat, setExpandedThreat] = useState<string | null>(null);

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

  const headerRightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
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

  // ---- THREAT LIST ----
  const threatListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const threatItemStyle = (level: string, expanded: boolean): React.CSSProperties => {
    let borderColor = colors.border;
    if (level === "CRITICAL") borderColor = colors.accentRed;
    else if (level === "HIGH") borderColor = colors.accentOrange;
    else if (level === "MEDIUM") borderColor = colors.accentAmber;
    return {
      background: colors.surface,
      border: `1px solid ${expanded ? borderColor : colors.border}`,
      borderLeft: `4px solid ${borderColor}`,
      padding: expanded ? "1rem" : "0.75rem 1rem",
      cursor: "pointer",
      transition: "all 0.2s",
    };
  };

  const threatHeaderRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const threatLevelStyle = (level: string): React.CSSProperties => {
    let color = colors.textSecondary;
    let bg = colors.surfaceLighter;
    if (level === "CRITICAL") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
    else if (level === "HIGH") { color = colors.accentOrange; bg = `${colors.accentOrange}15`; }
    else if (level === "MEDIUM") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
    return {
      fontSize: "9px",
      fontWeight: 700,
      color,
      background: bg,
      padding: "0.15rem 0.5rem",
      borderRadius: "3px",
      letterSpacing: "0.5px",
    };
  };

  const threatScoreStyle = (score: number): React.CSSProperties => {
    let color = colors.accentGreen;
    if (score > 80) color = colors.accentRed;
    else if (score > 60) color = colors.accentOrange;
    else if (score > 40) color = colors.accentAmber;
    return {
      fontSize: "16px",
      fontWeight: 700,
      color,
    };
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    let color = colors.textSecondary;
    if (status === "ACTIVE") color = colors.accentRed;
    else if (status === "UNDER_REVIEW") color = colors.accentOrange;
    else if (status === "RESOLVED") color = colors.accentGreen;
    else if (status === "DISMISSED") color = colors.textSecondary;
    return {
      fontSize: "9px",
      fontWeight: 600,
      color,
      padding: "0.15rem 0.5rem",
      border: `1px solid ${color}33`,
      borderRadius: "3px",
    };
  };

  // ---- EXPANDED DETAILS ----
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

  const reasonListStyle: React.CSSProperties = {
    background: colors.surfaceLighter,
    padding: "0.5rem",
    marginTop: "0.25rem",
    border: `1px solid ${colors.border}`,
  };

  const reasonItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    padding: "0.15rem 0",
    color: colors.textPrimary,
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

  // ============================================================
  // RENDER
  // ============================================================
  const filteredThreats = mockThreats.filter(threat => {
    const matchesSearch = threat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          threat.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "ALL" || threat.level === filterLevel;
    const matchesStatus = filterStatus === "ALL" || threat.status === filterStatus;
    const matchesType = filterType === "ALL" || threat.type === filterType;
    return matchesSearch && matchesLevel && matchesStatus && matchesType;
  });

  const stats = {
    total: mockThreats.length,
    critical: mockThreats.filter(t => t.level === "CRITICAL").length,
    active: mockThreats.filter(t => t.status === "ACTIVE").length,
    underReview: mockThreats.filter(t => t.status === "UNDER_REVIEW").length,
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>Threat Intelligence</div>
          <div style={headerSubtitleStyle}>
            <AlertTriangle size={14} style={{ display: "inline", marginRight: "6px" }} />
            Explainable threat detection & scoring
          </div>
        </div>
        <div style={headerRightStyle}>
          <div style={{ fontSize: "11px", color: colors.textSecondary }}>
            <Activity size={14} style={{ display: "inline", marginRight: "4px" }} />
            Real-time analysis
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <span style={statValueStyle}>{stats.total}</span>
          <span style={statLabelStyle}>Total Threats</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentRed }}>
          <span style={{ ...statValueStyle, color: colors.accentRed }}>{stats.critical}</span>
          <span style={statLabelStyle}>Critical</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentOrange }}>
          <span style={{ ...statValueStyle, color: colors.accentOrange }}>{stats.active}</span>
          <span style={statLabelStyle}>Active</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentAmber }}>
          <span style={{ ...statValueStyle, color: colors.accentAmber }}>{stats.underReview}</span>
          <span style={statLabelStyle}>Under Review</span>
        </div>
      </div>

      {/* FILTERS */}
      <div style={filterBarStyle}>
        <div style={searchContainerStyle}>
          <Search size={14} color={colors.textSecondary} />
          <input
            style={searchInputStyle}
            placeholder="Search threats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          style={filterSelectStyle}
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="ALL">All Levels</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          style={filterSelectStyle}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>

        <select
          style={filterSelectStyle}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Person">Person</option>
          <option value="Other">Other</option>
        </select>

        <div style={{ fontSize: "11px", color: colors.textSecondary }}>
          <Filter size={12} style={{ display: "inline", marginRight: "4px" }} />
          {filteredThreats.length} results
        </div>
      </div>

      {/* THREAT LIST */}
      <div style={threatListStyle}>
        {filteredThreats.map((threat) => (
          <div
            key={threat.id}
            style={threatItemStyle(threat.level, expandedThreat === threat.id)}
            onClick={() => setExpandedThreat(expandedThreat === threat.id ? null : threat.id)}
          >
            <div style={threatHeaderRowStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                <span style={threatLevelStyle(threat.level)}>{threat.level}</span>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  {threat.type} • {threat.id}
                </span>
                <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                  {threat.location}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={threatScoreStyle(threat.score)}>
                  {threat.score}/100
                </span>
                <span style={statusBadgeStyle(threat.status)}>
                  {threat.status.replace("_", " ")}
                </span>
                <ChevronRight
                  size={16}
                  style={{
                    transform: expandedThreat === threat.id ? "rotate(90deg)" : "none",
                    transition: "transform 0.2s",
                    color: colors.textSecondary,
                  }}
                />
              </div>
            </div>

            {expandedThreat === threat.id && (
              <div style={detailsStyle}>
                <div style={detailRowStyle}>
                  <span>Object ID</span>
                  <span style={{ color: colors.textPrimary }}>{threat.objectId}</span>
                </div>
                <div style={detailRowStyle}>
                  <span>Track ID</span>
                  <span style={{ color: colors.textPrimary }}>{threat.trackId}</span>
                </div>
                <div style={detailRowStyle}>
                  <span>Confidence</span>
                  <span style={{ color: colors.textPrimary }}>{threat.confidence}%</span>
                </div>
                <div style={detailRowStyle}>
                  <span>Detected At</span>
                  <span style={{ color: colors.textPrimary }}>{threat.detectedAt}</span>
                </div>
                <div style={detailRowStyle}>
                  <span>Last Updated</span>
                  <span style={{ color: colors.textPrimary }}>{threat.lastUpdated}</span>
                </div>

                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.25rem" }}>
                    WHY WAS THIS FLAGGED?
                  </div>
                  <div style={reasonListStyle}>
                    {threat.reasons.map((reason, idx) => (
                      <div key={idx} style={reasonItemStyle}>
                        <span>• {reason}</span>
                        <span style={{ color: colors.accentAmber }}>
                          +{Math.floor(70 / threat.reasons.length + (idx * 5))}
                        </span>
                      </div>
                    ))}
                    <div style={{ ...reasonItemStyle, borderTop: `1px solid ${colors.border}`, paddingTop: "0.25rem", marginTop: "0.25rem" }}>
                      <span style={{ fontWeight: 600 }}>TOTAL</span>
                      <span style={{ fontWeight: 700, color: colors.textPrimary }}>{threat.score}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "0.5rem", fontSize: "11px", color: colors.textSecondary }}>
                  {threat.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Threats;