// components/Dashboard.tsx
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Server,
  Target,
  Clock,
  Shield,
  Zap,
  AlertCircle,
  Eye,
  Radio,
} from "lucide-react";
import { getDashboard } from "../../api";

// ============================================================
// TYPES
// ============================================================
interface Threat {
  id: string;
  type: "Vehicle" | "Person" | "Other";
  location: string;
  score: number;
  level: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  trackId: string;
  timestamp: string;
}

interface AIAssessment {
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  breakdown: {
    label: string;
    score: number;
  }[];
  summary: string;
  timestamp: string;
  requiresReview: boolean;
}

// ============================================================
// COMPONENT
// ============================================================
const Dashboard: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [aiAssessment] = useState<AIAssessment>({
    overallRisk: "LOW",
    score: 0,
    breakdown: [],
    summary: "No AI assessment available.",
    timestamp: new Date().toLocaleTimeString(),
    requiresReview: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metrics = dashboard
    ? [
        {
          label: "ACTIVE THREATS",
          value: String(dashboard.active_threats ?? 0).padStart(2, "0"),
          icon: AlertTriangle,
          color: "#D9534F",
        },
        {
          label: "OBJECTS DETECTED",
          value: String(dashboard.objects_detected ?? 0).padStart(2, "0"),
          icon: Target,
          color: "#6FAF72",
        },
        {
          label: "ANOMALIES",
          value: String(dashboard.anomalies ?? 0).padStart(2, "0"),
          icon: Zap,
          color: "#D59B3A",
        },
        {
          label: "SYSTEM STATUS",
          value: dashboard.status === "UNKNOWN" ? "OFFLINE" : "OPERATIONAL",
          icon: Server,
          color: "#6FAF72",
        },
      ]
    : [];

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboard();
        setDashboard(data);

        const threatResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/threats`
        );

        if (!threatResponse.ok) {
          throw new Error("Failed to fetch threats");
        }

        const threatData = await threatResponse.json();

        const mappedThreats: Threat[] = threatData.threats.map(
          (item: any, index: number) => ({
            id: `T-${String(index + 1).padStart(3, "0")}`,
            type: item.category,
            location: `Track ${item.track_id}`,
            score: item.risk?.score ?? 0,
            level:
              item.risk?.level === "HIGH"
                ? "HIGH"
                : item.risk?.level === "MEDIUM"
                ? "MEDIUM"
                : "LOW",
            reason:
              item.anomaly?.level && item.anomaly.level !== "LOW"
                ? `${item.anomaly.level} anomaly`
                : "Risk assessment",
            trackId: String(item.track_id ?? "-"),
            timestamp: new Date().toLocaleTimeString(),
          })
        );

        setThreats(mappedThreats);
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ---- COLORS ----
  const colors = {
    bg: "#080D0C",
    surface: "#111A16",
    surfaceLighter: "#1A2A24",
    surfaceDark: "#0A120E",
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
    padding: "1rem",
    minHeight: "calc(100vh - 82px)",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.textPrimary,
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
    boxSizing: "border-box",
  };

  const commandHeaderStyle: React.CSSProperties = {
    marginBottom: "1.5rem",
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: "0.75rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "0.5rem",
  };

  const commandLeftStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    flex: "1 1 auto",
    minWidth: "200px",
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
  };

  const commandStatusStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontSize: "11px",
    color: colors.textSecondary,
    flexWrap: "wrap",
  };

  const statusDotStyle = (active: boolean): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: active ? colors.accentGreen : "#3A4A40",
    display: "inline-block",
    marginRight: "6px",
  });

  const commandRightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "11px",
    color: colors.textSecondary,
    flexWrap: "wrap",
  };

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
    padding: "0.6rem 0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    minWidth: 0,
  };

  // ---- MAIN GRID ----
  const mainGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "3fr 2fr",
    gap: "1rem",
    marginBottom: "1.5rem",
  };

  const panelStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "1rem",
    overflow: "hidden",
  };

  const panelHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "0.5rem",
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: "0.75rem",
    flexWrap: "wrap",
    gap: "0.25rem",
  };

  const panelTitleStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  };

  // ---- CRITICAL THREAT BANNER ----
  const criticalThreatStyle: React.CSSProperties = {
    background: `${colors.accentRed}15`,
    border: `2px solid ${colors.accentRed}`,
    padding: "0.75rem",
    marginBottom: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
  };

  const criticalThreatLeftStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    flex: "1 1 auto",
    minWidth: "150px",
  };

  const criticalThreatLabelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 700,
    color: colors.accentRed,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  const criticalThreatTitleStyle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 700,
    color: colors.textPrimary,
  };

  const criticalThreatSubStyle: React.CSSProperties = {
    fontSize: "11px",
    color: colors.textSecondary,
  };

  const criticalThreatScoreStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 700,
    color: colors.accentRed,
  };

  // ---- SURVEILLANCE FEED (Compact) ----
  const compactFeedStyle: React.CSSProperties = {
    position: "relative",
    background: colors.surfaceDark,
    borderRadius: "4px",
    height: "200px",
    overflow: "hidden",
    border: `1px solid ${colors.borderLight}`,
    width: "100%",
  };

  const feedSceneStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "radial-gradient(ellipse at center, #1A2A24 0%, #0A1210 100%)",
  };

  const groundStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    background: "linear-gradient(180deg, transparent, #0F1A16)",
    borderTop: `1px solid ${colors.borderLight}`,
  };

  const bboxStyle = (color: string, top: string, left: string): React.CSSProperties => ({
    position: "absolute",
    border: `2px solid ${color}`,
    background: `${color}15`,
    padding: "0.2rem 0.4rem",
    borderRadius: "2px",
    fontSize: "8px",
    fontWeight: 600,
    color: colors.textPrimary,
    top,
    left,
    minWidth: "70px",
  });

  const bboxLabelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  };

  // ---- THREAT LIST (Prioritized) ----
  const threatListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    maxHeight: "300px",
    overflowY: "auto",
    paddingRight: "4px",
  };

  const threatItemStyle = (level: "HIGH" | "MEDIUM" | "LOW"): React.CSSProperties => {
    let borderColor = colors.border;
    let bg = colors.surfaceLighter;
    if (level === "HIGH") {
      borderColor = colors.accentRed;
      bg = `${colors.accentRed}10`;
    } else if (level === "MEDIUM") {
      borderColor = colors.accentAmber;
      bg = `${colors.accentAmber}10`;
    } else {
      borderColor = colors.border;
      bg = colors.surfaceLighter;
    }
    return {
      padding: "0.4rem 0.6rem",
      borderLeft: `4px solid ${borderColor}`,
      background: bg,
      cursor: "pointer",
      transition: "background 0.15s",
    };
  };

  const threatLevelBadge = (level: "HIGH" | "MEDIUM" | "LOW"): React.CSSProperties => {
    let color = colors.textSecondary;
    if (level === "HIGH") {
      color = colors.accentRed;
    } else if (level === "MEDIUM") {
      color = colors.accentAmber;
    } else {
      color = colors.textSecondary;
    }
    return {
      fontSize: "8px",
      fontWeight: 700,
      color,
      letterSpacing: "0.3px",
    };
  };

  // ---- AI ASSESSMENT ----
  const aiRiskStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "0.15rem 0.6rem",
    fontSize: "10px",
    fontWeight: 700,
    background: colors.accentRed,
    color: colors.textPrimary,
    letterSpacing: "0.5px",
    marginBottom: "0.5rem",
  };

  const aiBreakdownStyle: React.CSSProperties = {
    background: colors.surfaceLighter,
    padding: "0.4rem 0.6rem",
    margin: "0.4rem 0",
    border: `1px solid ${colors.border}`,
  };

  const aiBreakdownRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    padding: "0.1rem 0",
    color: colors.textSecondary,
  };

  const aiSummaryStyle: React.CSSProperties = {
    fontSize: "12px",
    lineHeight: 1.5,
    color: colors.textSecondary,
    margin: "0.4rem 0",
    padding: "0.4rem",
    background: colors.surfaceLighter,
    border: `1px solid ${colors.border}`,
  };

  const reviewBadgeStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "0.1rem 0.5rem",
    fontSize: "8px",
    fontWeight: 600,
    color: colors.accentRed,
    border: `1px solid ${colors.accentRed}`,
    letterSpacing: "0.3px",
  };

  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      @keyframes pulse-critical {
        0%, 100% { box-shadow: 0 0 0 0 rgba(217, 83, 79, 0.4); }
        50% { box-shadow: 0 0 0 8px rgba(217, 83, 79, 0); }
      }
      @media (max-width: 1024px) {
        .dashboard-metrics {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        .dashboard-main-grid {
          grid-template-columns: 1fr !important;
        }
      }
      @media (max-width: 768px) {
        .dashboard-container {
          padding: 0.75rem !important;
        }
        .dashboard-metrics {
          grid-template-columns: 1fr 1fr !important;
          gap: 0.5rem !important;
        }
        .dashboard-main-grid {
          gap: 0.75rem !important;
        }
        .dashboard-command-subtitle {
          font-size: 17px !important;
        }
        .dashboard-command-status {
          font-size: 10px !important;
          gap: 0.75rem !important;
        }
        .dashboard-metric-card {
          padding: 0.5rem 0.6rem !important;
          gap: 0.4rem !important;
        }
        .dashboard-metric-icon {
          width: 28px !important;
          height: 28px !important;
        }
        .dashboard-metric-icon svg {
          width: 14px !important;
          height: 14px !important;
        }
        .dashboard-metric-value {
          font-size: 14px !important;
        }
        .dashboard-metric-label {
          font-size: 8px !important;
        }
        .dashboard-panel {
          padding: 0.75rem !important;
        }
        .dashboard-critical-threat {
          padding: 0.5rem !important;
        }
        .dashboard-critical-title {
          font-size: 13px !important;
        }
        .dashboard-critical-score {
          font-size: 20px !important;
        }
        .dashboard-feed {
          height: 160px !important;
        }
      }
      @media (max-width: 480px) {
        .dashboard-container {
          padding: 0.5rem !important;
        }
        .dashboard-metrics {
          grid-template-columns: 1fr !important;
        }
        .dashboard-command-header {
          flex-direction: column !important;
          align-items: flex-start !important;
        }
        .dashboard-command-subtitle {
          font-size: 15px !important;
        }
        .dashboard-command-right {
          margin-top: 0.25rem !important;
        }
        .dashboard-feed {
          height: 130px !important;
        }
        .dashboard-threat-list {
          max-height: 200px !important;
        }
        .dashboard-threat-item {
          padding: 0.3rem 0.5rem !important;
        }
        .dashboard-threat-item-type {
          font-size: 11px !important;
        }
        .dashboard-threat-item-score {
          font-size: 12px !important;
        }
        .dashboard-ai-score {
          font-size: 18px !important;
        }
        .dashboard-panel {
          padding: 0.5rem !important;
        }
        .dashboard-critical-sub {
          font-size: 10px !important;
        }
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
  const criticalThreat = threats.find((t) => t.level === "HIGH");

  return (
    <div style={containerStyle} className="dashboard-container">
      {loading && <p style={{ color: colors.textSecondary }}>Loading dashboard...</p>}
      {error && <p style={{ color: colors.accentRed }}>{error}</p>}

      {/* COMMAND HEADER */}
      <div style={commandHeaderStyle} className="dashboard-command-header">
        <div style={commandLeftStyle}>
          <div style={commandTitleStyle}>Command Centre</div>
          <div style={commandSubtitleStyle} className="dashboard-command-subtitle">
            Current Operational Situation
          </div>
          <div style={commandStatusStyle} className="dashboard-command-status">
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
        <div style={commandRightStyle} className="dashboard-command-right">
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Radio size={12} color={colors.accentGreen} />
            All Systems Online
          </span>
        </div>
      </div>

      {/* METRICS */}
      <div style={metricsGridStyle} className="dashboard-metrics">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} style={metricCardStyle} className="dashboard-metric-card">
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: colors.surfaceLighter,
                  border: `1px solid ${colors.border}`,
                }}
                className="dashboard-metric-icon"
              >
                <Icon size={16} color={metric.color} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: colors.textPrimary,
                    lineHeight: 1.2,
                  }}
                  className="dashboard-metric-value"
                >
                  {metric.value}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 500,
                    color: colors.textSecondary,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    wordBreak: "break-word",
                  }}
                  className="dashboard-metric-label"
                >
                  {metric.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN GRID */}
      <div style={mainGridStyle} className="dashboard-main-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {criticalThreat && (
            <div style={criticalThreatStyle} className="dashboard-critical-threat">
              <div style={criticalThreatLeftStyle}>
                <div style={criticalThreatLabelStyle}>
                  <AlertTriangle size={14} style={{ display: "inline", marginRight: "4px" }} />
                  HIGH THREAT DETECTED
                </div>
                <div style={criticalThreatTitleStyle} className="dashboard-critical-title">
                  {criticalThreat.type} • {criticalThreat.id}
                </div>
                <div style={criticalThreatSubStyle} className="dashboard-critical-sub">
                  {criticalThreat.location} • {criticalThreat.reason} • Track: {criticalThreat.trackId}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={criticalThreatScoreStyle} className="dashboard-critical-score">
                  {criticalThreat.score}/100
                </div>
                <div style={{ fontSize: "10px", color: colors.textSecondary }}>Threat Score</div>
              </div>
            </div>
          )}

          <div style={panelStyle} className="dashboard-panel">
            <div style={panelHeaderStyle}>
              <span style={panelTitleStyle}>
                <Eye size={14} style={{ display: "inline", marginRight: "6px" }} />
                Primary Feed • Sector B • Cam-04
              </span>
              <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
                14:32:18
              </span>
            </div>
            <div style={compactFeedStyle} className="dashboard-feed">
              <div style={feedSceneStyle}>
                <div style={groundStyle} />
                <div
                  style={{
                    ...bboxStyle(colors.accentRed, "35%", "25%"),
                    borderColor: colors.accentRed,
                    animation: "pulse-critical 2s infinite",
                  }}
                >
                  <div style={bboxLabelStyle}>
                    <span style={{ fontWeight: 700 }}>VEHICLE #04</span>
                    <span style={{ fontSize: "7px", color: colors.textSecondary }}>
                      94% • TRACK: T-001
                    </span>
                    <span style={{ fontSize: "7px", color: colors.accentRed }}>CRITICAL</span>
                  </div>
                </div>
                <div
                  style={{
                    ...bboxStyle(colors.accentGreen, "55%", "50%"),
                    borderColor: colors.accentGreen,
                  }}
                >
                  <div style={bboxLabelStyle}>
                    <span style={{ fontWeight: 700 }}>PERSON #12</span>
                    <span style={{ fontSize: "7px", color: colors.textSecondary }}>
                      91% • TRACK: T-002
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "9px",
                      color: colors.textSecondary,
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: colors.accentRed,
                        animation: "pulse-dot 1s infinite",
                      }}
                    />
                    REC
                  </div>
                  <div style={{ fontSize: "9px", color: colors.textSecondary }}>
                    OBJECTS: 02 • TRACKING: 02
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={panelStyle} className="dashboard-panel">
            <div style={panelHeaderStyle}>
              <span style={panelTitleStyle}>
                <AlertCircle size={14} style={{ display: "inline", marginRight: "6px" }} />
                Active Threats • Prioritized
              </span>
              <span style={{ fontSize: "10px", color: colors.textSecondary }}>
                {threats.length} threats
              </span>
            </div>
            <div style={threatListStyle} className="dashboard-threat-list">
              {threats.map((threat) => (
                <div key={threat.id} style={threatItemStyle(threat.level)} className="dashboard-threat-item">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={threatLevelBadge(threat.level)}>{threat.level}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: colors.textPrimary,
                          }}
                          className="dashboard-threat-item-type"
                        >
                          {threat.type} • {threat.id}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: colors.textSecondary,
                          marginTop: "2px",
                        }}
                      >
                        {threat.location} • {threat.reason}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color:
                            threat.level === "HIGH"
                              ? colors.accentRed
                              : threat.level === "MEDIUM"
                              ? colors.accentAmber
                              : colors.accentGreen,
                        }}
                        className="dashboard-threat-item-score"
                      >
                        {threat.score}/100
                      </div>
                      <div style={{ fontSize: "8px", color: colors.textSecondary }}>
                        {threat.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={panelStyle} className="dashboard-panel">
            <div style={panelHeaderStyle}>
              <span style={panelTitleStyle}>
                <Shield size={14} style={{ display: "inline", marginRight: "6px" }} />
                AI Situation Assessment
              </span>
              <span style={{ fontSize: "10px", color: colors.textSecondary }}>v2.1</span>
            </div>
            <div>
              <span style={aiRiskStyle}>OVERALL RISK: {aiAssessment.overallRisk}</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  margin: "0.25rem 0",
                }}
              >
                <span style={{ fontSize: "22px", fontWeight: 700 }} className="dashboard-ai-score">
                  {aiAssessment.score}
                </span>
                <span style={{ fontSize: "12px", color: colors.textSecondary }}>/ 100</span>
              </div>

              <div style={aiBreakdownStyle}>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginBottom: "0.25rem",
                  }}
                >
                  WHY WAS THIS FLAGGED?
                </div>
                {aiAssessment.breakdown.map((item, idx) => (
                  <div key={idx} style={aiBreakdownRowStyle}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>+{item.score}</span>
                  </div>
                ))}
                <div
                  style={{
                    ...aiBreakdownRowStyle,
                    borderTop: `1px solid ${colors.border}`,
                    paddingTop: "0.25rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>TOTAL</span>
                  <span style={{ fontWeight: 700, color: colors.textPrimary }}>
                    {aiAssessment.score}
                  </span>
                </div>
              </div>

              <div style={aiSummaryStyle}>"{aiAssessment.summary}"</div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "0.25rem",
                  flexWrap: "wrap",
                  gap: "0.25rem",
                }}
              >
                <span style={{ fontSize: "9px", color: colors.textSecondary }}>
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
    </div>
  );
};

export default Dashboard;