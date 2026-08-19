

// components/Dashboard.tsx
import React, { useState} from "react";
import {
  AlertTriangle,

  Server,
  Target,
  MapPin,
  Clock,
  Shield,
  User,
  Truck,

  Zap,
  AlertCircle,

} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface Threat {
  id: string;
  type: "Vehicle" | "Person" | "Other";
  location: string;
  score: number;
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  trackId: string;
  timestamp: string;
}

// ============================================================
// MOCK DATA
// ============================================================
const metrics = [
  { label: "ACTIVE THREATS", value: "08", icon: AlertTriangle, color: "#D9534F" },
  { label: "OBJECTS DETECTED", value: "47", icon: Target, color: "#6FAF72" },
  { label: "ANOMALIES", value: "12", icon: Zap, color: "#D59B3A" },
  { label: "SYSTEM STATUS", value: "OPERATIONAL", icon: Server, color: "#6FAF72" },
];

const threats: Threat[] = [
  {
    id: "T-001",
    type: "Vehicle",
    location: "Sector B",
    score: 82,
    level: "CRITICAL",
    reason: "Restricted zone entry",
    trackId: "T-001",
    timestamp: "14:32:18",
  },
  {
    id: "T-002",
    type: "Person",
    location: "Sector A",
    score: 67,
    level: "HIGH",
    reason: "Unusual movement pattern",
    trackId: "T-002",
    timestamp: "14:28:45",
  },
  {
    id: "T-003",
    type: "Vehicle",
    location: "Sector C",
    score: 48,
    level: "MEDIUM",
    reason: "Abnormal speed",
    trackId: "T-003",
    timestamp: "14:15:22",
  },
];

const aiAssessment = {
  overallRisk: "HIGH",
  score: 72,
  breakdown: [
    { label: "Restricted Zone Entry", score: 40 },
    { label: "Unusual Timestamp", score: 20 },
    { label: "Abnormal Movement", score: 12 },
  ],
  summary: "Increased activity has been observed in Sector B. One event has been flagged due to restricted-zone entry and unusual timing.",
  requiresReview: true,
  timestamp: "2025-04-13 14:32:18",
};

// ============================================================
// COMPONENT
// ============================================================
const Dashboard: React.FC = () => {
  const [, setSelectedThreat] = useState<string | null>(null);

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

  // ---- COMMAND HEADER ----
  const commandHeaderStyle: React.CSSProperties = {
    marginBottom: "1.5rem",
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: "0.75rem",
  };

  const commandTitleStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "1.5px",
    color: colors.textSecondary,
    textTransform: "uppercase",
  };

  const commandSubtitleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: colors.textPrimary,
    marginTop: "0.25rem",
  };

  const commandStatusStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginTop: "0.5rem",
    fontSize: "12px",
    color: colors.textSecondary,
  };

  const statusDotStyle = (active: boolean): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: active ? colors.accentGreen : "#3A4A40",
    display: "inline-block",
    marginRight: "6px",
  });

  // ---- METRICS ----
  const metricsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  };

  const metricCardStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "0.75rem 1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  const metricIconStyle: React.CSSProperties = {
    width: "36px",
    height: "36px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: colors.surfaceLighter,
    border: `1px solid ${colors.border}`,
  };

  const metricContentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: colors.textPrimary,
    lineHeight: 1.2,
  };

  const metricLabelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 500,
    color: colors.textSecondary,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  // ---- MAIN GRID ----
  const mainGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "1rem",
    marginBottom: "1.5rem",
  };

  const panelStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "1rem",
  };

  const panelHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "0.5rem",
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: "0.75rem",
  };

  const panelTitleStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  };

  // ---- SURVEILLANCE FEED ----
  const feedContainerStyle: React.CSSProperties = {
    position: "relative",
    background: "#0A1210",
    borderRadius: "4px",
    height: "340px",
    overflow: "hidden",
    border: `1px solid ${colors.borderLight}`,
  };

  const feedOverlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: "0.75rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const feedTopBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "10px",
    color: colors.textSecondary,
    letterSpacing: "0.5px",
  };

  const feedRecStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const recDotStyle: React.CSSProperties = {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: colors.accentRed,
    animation: "pulse-dot 1s infinite",
  };

  const feedSceneStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "radial-gradient(ellipse at center, #1A2A24 0%, #0A1210 100%)",
  };

  // Ground/terrain
  const groundStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    background: "linear-gradient(180deg, transparent, #0F1A16)",
    borderTop: `1px solid ${colors.borderLight}`,
  };

  // Road
  const roadStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "20%",
    left: "10%",
    right: "10%",
    height: "4px",
    background: colors.borderLight,
    opacity: 0.5,
  };

  // Bounding box style
  const bboxStyle = (color: string, top: string, left: string): React.CSSProperties => ({
    position: "absolute",
    border: `2px solid ${color}`,
    background: `${color}15`,
    padding: "0.25rem 0.5rem",
    borderRadius: "2px",
    fontSize: "9px",
    fontWeight: 600,
    color: colors.textPrimary,
    top,
    left,
    minWidth: "80px",
  });

  const bboxLabelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  };

  // Tracking line
  const trackLineStyle: React.CSSProperties = {
    position: "absolute",
    border: `1px dashed ${colors.accentAmber}`,
    opacity: 0.4,
    pointerEvents: "none",
  };

  // ---- MAP ----
  const mapContainerStyle: React.CSSProperties = {
    background: "#0A1210",
    borderRadius: "4px",
    height: "340px",
    padding: "0.75rem",
    border: `1px solid ${colors.borderLight}`,
    position: "relative",
  };

  const mapGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "repeat(4, 1fr)",
    height: "100%",
    gap: "1px",
    background: colors.borderLight,
  };

  const mapCellStyle: React.CSSProperties = {
    background: "#0A1210",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    color: colors.textSecondary,
    position: "relative",
  };

  const mapLegendStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "0.5rem",
    right: "0.5rem",
    fontSize: "8px",
    color: colors.textSecondary,
    background: "rgba(8, 13, 12, 0.9)",
    padding: "0.25rem 0.5rem",
    border: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  };

  // ---- BOTTOM GRID ----
  const bottomGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  };

  // ---- THREAT ITEMS ----
  const threatItemStyle = (level: string): React.CSSProperties => {
    let borderColor = colors.border;
    if (level === "CRITICAL") borderColor = colors.accentRed;
    else if (level === "HIGH") borderColor = colors.accentOrange;
    else if (level === "MEDIUM") borderColor = colors.accentAmber;
    return {
      padding: "0.6rem 0.75rem",
      borderLeft: `3px solid ${borderColor}`,
      borderBottom: `1px solid ${colors.border}`,
      marginBottom: "0.5rem",
      cursor: "pointer",
      transition: "background 0.15s",
    };
  };

  const threatHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const threatLevelStyle = (level: string): React.CSSProperties => {
    let color = colors.textSecondary;
    if (level === "CRITICAL") color = colors.accentRed;
    else if (level === "HIGH") color = colors.accentOrange;
    else if (level === "MEDIUM") color = colors.accentAmber;
    return {
      fontSize: "9px",
      fontWeight: 700,
      color,
      letterSpacing: "0.5px",
    };
  };

  const threatScoreStyle = (score: number): React.CSSProperties => {
    let color = colors.accentGreen;
    if (score > 80) color = colors.accentRed;
    else if (score > 60) color = colors.accentOrange;
    else if (score > 40) color = colors.accentAmber;
    return {
      fontSize: "14px",
      fontWeight: 700,
      color,
    };
  };

  // ---- AI ASSESSMENT ----
  const aiRiskStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "0.2rem 0.75rem",
    fontSize: "11px",
    fontWeight: 700,
    background: colors.accentRed,
    color: colors.textPrimary,
    letterSpacing: "0.5px",
    marginBottom: "0.5rem",
  };

  const aiBreakdownStyle: React.CSSProperties = {
    background: colors.surfaceLighter,
    padding: "0.5rem 0.75rem",
    margin: "0.5rem 0",
    border: `1px solid ${colors.border}`,
  };

  const aiBreakdownRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    padding: "0.15rem 0",
    color: colors.textSecondary,
  };

  const aiSummaryStyle: React.CSSProperties = {
    fontSize: "13px",
    lineHeight: 1.5,
    color: colors.textPrimary,
    margin: "0.5rem 0",
    padding: "0.5rem",
    background: colors.surfaceLighter,
    border: `1px solid ${colors.border}`,
  };

  const reviewBadgeStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "0.15rem 0.6rem",
    fontSize: "9px",
    fontWeight: 600,
    color: colors.accentRed,
    border: `1px solid ${colors.accentRed}`,
    letterSpacing: "0.5px",
  };

  // ---- KEYFRAMES ----
  React.useEffect(() => {
    const style = document.createElement("style");

    style.textContent = `
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={containerStyle}>
      {/* COMMAND HEADER */}
      <div style={commandHeaderStyle}>
        <div style={commandTitleStyle}>Command Centre</div>
        <div style={commandSubtitleStyle}>Current Operational Situation</div>
        <div style={commandStatusStyle}>
          <span>
            <span style={statusDotStyle(true)} />
            OPERATIONAL
          </span>
          <span>•</span>
          <span>LOCAL PROCESSING</span>
          <span>•</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* METRICS */}
      <div style={metricsGridStyle}>
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} style={metricCardStyle}>
              <div style={metricIconStyle}>
                <Icon size={18} color={metric.color} />
              </div>
              <div style={metricContentStyle}>
                <span style={metricValueStyle}>{metric.value}</span>
                <span style={metricLabelStyle}>{metric.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN GRID: Surveillance + Map */}
      <div style={mainGridStyle}>
        {/* SURVEILLANCE FEED */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>Surveillance Feed • Sector B • Cam-04</span>
            <span style={{ fontSize: "10px", color: colors.textSecondary }}>
              <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
              14:32:18
            </span>
          </div>
          <div style={feedContainerStyle}>
            <div style={feedSceneStyle}>
              {/* Ground */}
              <div style={groundStyle} />
              <div style={roadStyle} />

              {/* Vehicle BBox */}
              <div style={{ ...bboxStyle(colors.accentOrange, "35%", "25%"), borderColor: colors.accentOrange }}>
                <div style={bboxLabelStyle}>
                  <span style={{ fontWeight: 700 }}>VEHICLE #04</span>
                  <span style={{ fontSize: "8px", color: colors.textSecondary }}>94% • TRACK: T-001</span>
                  <span style={{ fontSize: "8px", color: colors.accentOrange }}>THREAT: HIGH</span>
                </div>
              </div>

              {/* Person BBox */}
              <div style={{ ...bboxStyle(colors.accentGreen, "55%", "50%"), borderColor: colors.accentGreen }}>
                <div style={bboxLabelStyle}>
                  <span style={{ fontWeight: 700 }}>PERSON #12</span>
                  <span style={{ fontSize: "8px", color: colors.textSecondary }}>91% • TRACK: T-002</span>
                  <span style={{ fontSize: "8px", color: colors.textSecondary }}>STATUS: NORMAL</span>
                </div>
              </div>

              {/* Tracking line */}
              <div style={{ ...trackLineStyle, top: "40%", left: "30%", width: "80px", transform: "rotate(45deg)" }} />

              {/* Feed overlay */}
              <div style={feedOverlayStyle}>
                <div style={feedTopBarStyle}>
                  <div style={feedRecStyle}>
                    <span style={recDotStyle} />
                    <span>REC</span>
                  </div>
                  <span>LOCAL FEED</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", fontSize: "9px", color: colors.textSecondary }}>
                  <span>OBJECTS: 02</span>
                  <span>•</span>
                  <span>TRACKING: 02</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TACTICAL MAP */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>Tactical Situation Map</span>
            <span style={{ fontSize: "10px", color: colors.textSecondary }}>
              <MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />
              Sectors: A-D
            </span>
          </div>
          <div style={mapContainerStyle}>
            <div style={mapGridStyle}>
              {["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4", "D1", "D2", "D3", "D4"].map((cell) => (
                <div key={cell} style={mapCellStyle}>
                  {cell}
                  {cell === "B2" && (
                    <div style={{ position: "absolute", top: "30%", left: "30%" }}>
                      <Target size={12} color={colors.accentRed} />
                    </div>
                  )}
                  {cell === "A3" && (
                    <div style={{ position: "absolute", top: "40%", right: "20%" }}>
                      <User size={12} color={colors.accentGreen} />
                    </div>
                  )}
                  {cell === "C2" && (
                    <div style={{ position: "absolute", bottom: "30%", left: "30%" }}>
                      <Truck size={12} color={colors.accentAmber} />
                    </div>
                  )}
                  {cell === "B3" && (
                    <div style={{
                      position: "absolute",
                      top: "20%",
                      left: "20%",
                      right: "20%",
                      bottom: "20%",
                      border: `1px dashed ${colors.accentRed}`,
                      opacity: 0.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "7px",
                      color: colors.accentRed,
                    }}>
                      RESTRICTED
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={mapLegendStyle}>
              <span style={{ color: colors.accentRed }}>● Critical</span>
              <span style={{ color: colors.accentOrange }}>● High</span>
              <span style={{ color: colors.accentAmber }}>● Medium</span>
              <span style={{ color: colors.accentGreen }}>● Normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID: Threats + AI Assessment */}
      <div style={bottomGridStyle}>
        {/* ACTIVE THREATS */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>Active Threats</span>
            <span style={{ fontSize: "10px", color: colors.textSecondary }}>
              <AlertCircle size={12} style={{ display: "inline", marginRight: "4px" }} />
              {threats.length} threats
            </span>
          </div>
          <div>
            {threats.map((threat) => (
              <div
                key={threat.id}
                style={threatItemStyle(threat.level)}
                onClick={() => setSelectedThreat(threat.id)}
              >
                <div style={threatHeaderStyle}>
                  <div>
                    <span style={threatLevelStyle(threat.level)}>{threat.level}</span>
                    <span style={{ marginLeft: "0.5rem", fontSize: "12px", fontWeight: 600 }}>
                      {threat.type} • {threat.id}
                    </span>
                  </div>
                  <div style={threatScoreStyle(threat.score)}>
                    {threat.score}/100
                  </div>
                </div>
                <div style={{ fontSize: "10px", color: colors.textSecondary, marginTop: "0.25rem" }}>
                  {threat.location} • {threat.reason} • Track: {threat.trackId}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI SITUATION ASSESSMENT */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>AI Situation Assessment</span>
            <span style={{ fontSize: "10px", color: colors.textSecondary }}>
              <Shield size={12} style={{ display: "inline", marginRight: "4px" }} />
              v2.1
            </span>
          </div>
          <div>
            <span style={aiRiskStyle}>OVERALL RISK: {aiAssessment.overallRisk}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.5rem 0" }}>
              <span style={{ fontSize: "24px", fontWeight: 700 }}>
                {aiAssessment.score}
              </span>
              <span style={{ fontSize: "14px", color: colors.textSecondary }}>/ 100</span>
            </div>

            <div style={aiBreakdownStyle}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.25rem" }}>
                WHY WAS THIS FLAGGED?
              </div>
              {aiAssessment.breakdown.map((item, idx) => (
                <div key={idx} style={aiBreakdownRowStyle}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>+{item.score}</span>
                </div>
              ))}
              <div style={{ ...aiBreakdownRowStyle, borderTop: `1px solid ${colors.border}`, paddingTop: "0.25rem", marginTop: "0.25rem" }}>
                <span style={{ fontWeight: 700 }}>TOTAL</span>
                <span style={{ fontWeight: 700, color: colors.textPrimary }}>{aiAssessment.score}</span>
              </div>
            </div>

            <div style={aiSummaryStyle}>
              "{aiAssessment.summary}"
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                {aiAssessment.timestamp}
              </span>
              {aiAssessment.requiresReview && (
                <span style={reviewBadgeStyle}>REQUIRES HUMAN REVIEW</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;