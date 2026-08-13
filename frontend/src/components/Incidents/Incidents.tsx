// components/Incidents.tsx
import React, { useState } from "react";
import {
  AlertCircle,
  Filter,
  Search,

  ChevronRight,

  RefreshCw,

} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface Incident {
  id: string;
  type: "Vehicle" | "Person" | "Other";
  location: string;
  sector: string;
  timestamp: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  score: number;
  status: "ACTIVE" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  threatId: string;
  objectId: string;
  description: string;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  requiresReview: boolean;
  evidence: string[];
}

// ============================================================
// MOCK DATA
// ============================================================
const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    type: "Vehicle",
    location: "Sector B - Main Road",
    sector: "B",
    timestamp: "2025-04-13 14:32:18",
    severity: "CRITICAL",
    score: 82,
    status: "ACTIVE",
    threatId: "THR-001",
    objectId: "OBJ-001",
    description: "Vehicle entered restricted sector B with unusual timing and movement pattern.",
    assignedTo: "Captain Singh",
    createdAt: "2025-04-13 14:32:18",
    updatedAt: "2025-04-13 14:35:22",
    requiresReview: true,
    evidence: ["Restricted zone entry", "Unusual timestamp", "Abnormal movement pattern"],
  },
  {
    id: "INC-002",
    type: "Person",
    location: "Sector A - Checkpoint",
    sector: "A",
    timestamp: "2025-04-13 14:28:45",
    severity: "HIGH",
    score: 67,
    status: "UNDER_REVIEW",
    threatId: "THR-002",
    objectId: "OBJ-002",
    description: "Person exhibiting unusual movement patterns near checkpoint A.",
    assignedTo: "Lieutenant Kumar",
    createdAt: "2025-04-13 14:28:45",
    updatedAt: "2025-04-13 14:30:12",
    requiresReview: true,
    evidence: ["Unusual movement pattern", "Proximity to restricted zone"],
  },
  {
    id: "INC-003",
    type: "Vehicle",
    location: "Sector C - Highway",
    sector: "C",
    timestamp: "2025-04-13 14:15:22",
    severity: "MEDIUM",
    score: 48,
    status: "ACTIVE",
    threatId: "THR-003",
    objectId: "OBJ-003",
    description: "Vehicle detected with abnormal speed pattern on highway C.",
    createdAt: "2025-04-13 14:15:22",
    updatedAt: "2025-04-13 14:20:45",
    requiresReview: false,
    evidence: ["Abnormal speed", "Erratic movement"],
  },
  {
    id: "INC-004",
    type: "Person",
    location: "Sector D - Perimeter",
    sector: "D",
    timestamp: "2025-04-13 13:58:03",
    severity: "LOW",
    score: 35,
    status: "RESOLVED",
    threatId: "THR-004",
    objectId: "OBJ-004",
    description: "Person briefly loitering at perimeter D, resolved.",
    assignedTo: "Lieutenant Patel",
    resolvedAt: "2025-04-13 14:05:30",
    createdAt: "2025-04-13 13:58:03",
    updatedAt: "2025-04-13 14:05:30",
    requiresReview: false,
    evidence: ["Brief loitering"],
  },
  {
    id: "INC-005",
    type: "Vehicle",
    location: "Sector B - East Gate",
    sector: "B",
    timestamp: "2025-04-13 13:42:51",
    severity: "HIGH",
    score: 72,
    status: "ACTIVE",
    threatId: "THR-005",
    objectId: "OBJ-005",
    description: "Vehicle detected at East Gate with unauthorized presence.",
    assignedTo: "Captain Singh",
    createdAt: "2025-04-13 13:42:51",
    updatedAt: "2025-04-13 13:48:33",
    requiresReview: true,
    evidence: ["Unauthorized presence", "Suspicious timing"],
  },
];

// ============================================================
// COMPONENT
// ============================================================
const Incidents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

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

  // ---- INCIDENT LIST ----
  const incidentListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const incidentItemStyle = (severity: string, expanded: boolean): React.CSSProperties => {
    let borderColor = colors.border;
    if (severity === "CRITICAL") borderColor = colors.accentRed;
    else if (severity === "HIGH") borderColor = colors.accentOrange;
    else if (severity === "MEDIUM") borderColor = colors.accentAmber;
    return {
      background: colors.surface,
      border: `1px solid ${expanded ? borderColor : colors.border}`,
      borderLeft: `4px solid ${borderColor}`,
      padding: expanded ? "1rem" : "0.75rem 1rem",
      cursor: "pointer",
      transition: "all 0.2s",
    };
  };

  const incidentHeaderRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const severityBadgeStyle = (severity: string): React.CSSProperties => {
    let color = colors.textSecondary;
    let bg = colors.surfaceLighter;
    if (severity === "CRITICAL") { color = colors.accentRed; bg = `${colors.accentRed}15`; }
    else if (severity === "HIGH") { color = colors.accentOrange; bg = `${colors.accentOrange}15`; }
    else if (severity === "MEDIUM") { color = colors.accentAmber; bg = `${colors.accentAmber}15`; }
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

  const reviewBadgeStyle: React.CSSProperties = {
    fontSize: "8px",
    fontWeight: 600,
    color: colors.accentRed,
    border: `1px solid ${colors.accentRed}`,
    padding: "0.1rem 0.4rem",
    borderRadius: "2px",
    marginLeft: "0.5rem",
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
  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSearch = incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === "ALL" || incident.severity === filterSeverity;
    const matchesStatus = filterStatus === "ALL" || incident.status === filterStatus;
    const matchesType = filterType === "ALL" || incident.type === filterType;
    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const stats = {
    total: mockIncidents.length,
    active: mockIncidents.filter(i => i.status === "ACTIVE").length,
    underReview: mockIncidents.filter(i => i.status === "UNDER_REVIEW").length,
    resolved: mockIncidents.filter(i => i.status === "RESOLVED").length,
    requiresReview: mockIncidents.filter(i => i.requiresReview).length,
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>Incident Management</div>
          <div style={headerSubtitleStyle}>
            <AlertCircle size={14} style={{ display: "inline", marginRight: "6px" }} />
            Human-in-the-loop incident review
          </div>
        </div>
        <div style={{ fontSize: "11px", color: colors.textSecondary }}>
          <RefreshCw size={14} style={{ display: "inline", marginRight: "4px" }} />
          Auto-refresh: 30s
        </div>
      </div>

      {/* STATS */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <span style={statValueStyle}>{stats.total}</span>
          <span style={statLabelStyle}>Total Incidents</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentRed }}>
          <span style={{ ...statValueStyle, color: colors.accentRed }}>{stats.active}</span>
          <span style={statLabelStyle}>Active</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentOrange }}>
          <span style={{ ...statValueStyle, color: colors.accentOrange }}>{stats.underReview}</span>
          <span style={statLabelStyle}>Under Review</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentAmber }}>
          <span style={{ ...statValueStyle, color: colors.accentAmber }}>{stats.requiresReview}</span>
          <span style={statLabelStyle}>Requires Review</span>
        </div>
      </div>

      {/* FILTERS */}
      <div style={filterBarStyle}>
        <div style={searchContainerStyle}>
          <Search size={14} color={colors.textSecondary} />
          <input
            style={searchInputStyle}
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
          {filteredIncidents.length} results
        </div>
      </div>

      {/* INCIDENT LIST */}
      <div style={incidentListStyle}>
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            style={incidentItemStyle(incident.severity, expandedIncident === incident.id)}
            onClick={() => setExpandedIncident(expandedIncident === incident.id ? null : incident.id)}
          >
            <div style={incidentHeaderRowStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                <span style={severityBadgeStyle(incident.severity)}>{incident.severity}</span>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  {incident.type} • {incident.id}
                </span>
                <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                  {incident.location}
                </span>
                {incident.requiresReview && (
                  <span style={reviewBadgeStyle}>REVIEW</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: colors.accentAmber }}>
                  {incident.score}/100
                </span>
                <span style={statusBadgeStyle(incident.status)}>
                  {incident.status.replace("_", " ")}
                </span>
                <ChevronRight
                  size={16}
                  style={{
                    transform: expandedIncident === incident.id ? "rotate(90deg)" : "none",
                    transition: "transform 0.2s",
                    color: colors.textSecondary,
                  }}
                />
              </div>
            </div>

            {expandedIncident === incident.id && (
              <div style={detailsStyle}>
                <div style={detailRowStyle}>
                  <span>Object ID</span>
                  <span style={{ color: colors.textPrimary }}>{incident.objectId}</span>
                </div>
                <div style={detailRowStyle}>
                  <span>Threat ID</span>
                  <span style={{ color: colors.textPrimary }}>{incident.threatId}</span>
                </div>
                <div style={detailRowStyle}>
                  <span>Assigned To</span>
                  <span style={{ color: colors.textPrimary }}>{incident.assignedTo || "Unassigned"}</span>
                </div>
                <div style={detailRowStyle}>
                  <span>Created At</span>
                  <span style={{ color: colors.textPrimary }}>{incident.createdAt}</span>
                </div>
                <div style={detailRowStyle}>
                  <span>Updated At</span>
                  <span style={{ color: colors.textPrimary }}>{incident.updatedAt}</span>
                </div>
                {incident.resolvedAt && (
                  <div style={detailRowStyle}>
                    <span>Resolved At</span>
                    <span style={{ color: colors.textPrimary }}>{incident.resolvedAt}</span>
                  </div>
                )}

                <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: colors.surfaceLighter, border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.25rem" }}>
                    EVIDENCE
                  </div>
                  {incident.evidence.map((item, idx) => (
                    <div key={idx} style={{ fontSize: "11px", color: colors.textPrimary, padding: "0.15rem 0" }}>
                      • {item}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "0.5rem", fontSize: "11px", color: colors.textSecondary }}>
                  {incident.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Incidents;