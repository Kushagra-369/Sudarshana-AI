// components/Analytics.tsx
import React, { useState } from "react";
import {

  BarChart,
  Activity,
  AlertTriangle,
  Target,

  Download,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface AnalyticsData {
  period: string;
  threats: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    trend: "up" | "down" | "stable";
    percentage: number;
  };
  anomalies: {
    total: number;
    detected: number;
    resolved: number;
    trend: "up" | "down" | "stable";
    percentage: number;
  };
  incidents: {
    total: number;
    active: number;
    underReview: number;
    resolved: number;
    trend: "up" | "down" | "stable";
    percentage: number;
  };
  activity: {
    hourly: number[];
    daily: number[];
    weekly: number[];
  };
  sectors: {
    name: string;
    threats: number;
    anomalies: number;
    incidents: number;
  }[];
  detection: {
    accuracy: number;
    objects: number;
    tracked: number;
    lost: number;
  };
}

// ============================================================
// MOCK DATA
// ============================================================
const mockAnalytics: AnalyticsData = {
  period: "Today",
  threats: {
    total: 8,
    critical: 2,
    high: 3,
    medium: 2,
    low: 1,
    trend: "up",
    percentage: 12,
  },
  anomalies: {
    total: 12,
    detected: 8,
    resolved: 4,
    trend: "up",
    percentage: 8,
  },
  incidents: {
    total: 5,
    active: 3,
    underReview: 1,
    resolved: 1,
    trend: "up",
    percentage: 5,
  },
  activity: {
    hourly: [12, 18, 24, 30, 28, 35, 42, 48, 45, 52, 58, 62, 55, 48, 42, 38, 45, 50, 48, 42, 35, 28, 22, 15],
    daily: [120, 145, 132, 168, 156, 142, 138],
    weekly: [180, 210, 195, 225, 208, 192, 185],
  },
  sectors: [
    { name: "Sector A", threats: 3, anomalies: 2, incidents: 1 },
    { name: "Sector B", threats: 5, anomalies: 4, incidents: 2 },
    { name: "Sector C", threats: 2, anomalies: 3, incidents: 1 },
    { name: "Sector D", threats: 1, anomalies: 2, incidents: 1 },
  ],
  detection: {
    accuracy: 94,
    objects: 47,
    tracked: 38,
    lost: 9,
  },
};

// ============================================================
// COMPONENT
// ============================================================
const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("today");

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

  const headerRightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  const periodSelectStyle: React.CSSProperties = {
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

  // ---- STATS GRID ----
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
    fontSize: "22px",
    fontWeight: 700,
    color: colors.textPrimary,
    lineHeight: 1.2,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: "9px",
    fontWeight: 500,
    color: colors.textSecondary,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  const statTrendStyle = (trend: "up" | "down" | "stable", percentage: number): React.CSSProperties => {
    const color = trend === "up" ? colors.accentRed : trend === "down" ? colors.accentGreen : colors.textSecondary;
    return {
      fontSize: "10px",
      fontWeight: 600,
      color,
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
    };
  };

  // ---- CHART CONTAINERS ----
  const chartGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "1rem",
    marginBottom: "1.5rem",
  };

  const chartPanelStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "1rem",
  };

  const chartTitleStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    marginBottom: "0.75rem",
  };

  // ---- BAR CHART ----
  const barContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-end",
    height: "120px",
    gap: "4px",
  };

  const barStyle = (height: number, color: string): React.CSSProperties => ({
    flex: 1,
    height: `${height}%`,
    background: color,
    borderRadius: "2px",
    minHeight: "4px",
    transition: "height 0.3s",
    opacity: 0.8,
  });

  // ---- SECTOR CHART ----
  const sectorRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.4rem 0",
    borderBottom: `1px solid ${colors.border}`,
    fontSize: "12px",
  };

  const sectorBarStyle = (value: number, max: number, color: string): React.CSSProperties => ({
    width: `${(value / max) * 100}%`,
    height: "6px",
    background: color,
    borderRadius: "2px",
    marginTop: "2px",
  });

  // ---- DETECTION METRICS ----
  const metricRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.3rem 0",
    fontSize: "12px",
    borderBottom: `1px solid ${colors.border}`,
  };

  // ============================================================
  // RENDER
  // ============================================================
  const data = mockAnalytics;

  const getMaxActivity = () => {
    return Math.max(...data.activity.hourly);
  };

  const getColorForValue = (value: number, max: number) => {
    const ratio = value / max;
    if (ratio > 0.8) return colors.accentRed;
    if (ratio > 0.6) return colors.accentOrange;
    if (ratio > 0.4) return colors.accentAmber;
    return colors.accentGreen;
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>Analytics</div>
          <div style={headerSubtitleStyle}>
            <BarChart size={14} style={{ display: "inline", marginRight: "6px" }} />
            Threat, anomaly & activity analysis
          </div>
        </div>
        <div style={headerRightStyle}>
          <select style={periodSelectStyle} value={period} onChange={(e) => setPeriod(e.target.value as any)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button style={{ ...periodSelectStyle, display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{data.threats.total}</div>
          <div style={statLabelStyle}>Total Threats</div>
          <div style={statTrendStyle(data.threats.trend, data.threats.percentage)}>
            {data.threats.trend === "up" ? <ArrowUp size={12} /> : 
             data.threats.trend === "down" ? <ArrowDown size={12} /> : <Minus size={12} />}
            {data.threats.percentage}%
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{data.anomalies.total}</div>
          <div style={statLabelStyle}>Anomalies</div>
          <div style={statTrendStyle(data.anomalies.trend, data.anomalies.percentage)}>
            {data.anomalies.trend === "up" ? <ArrowUp size={12} /> : 
             data.anomalies.trend === "down" ? <ArrowDown size={12} /> : <Minus size={12} />}
            {data.anomalies.percentage}%
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{data.incidents.total}</div>
          <div style={statLabelStyle}>Incidents</div>
          <div style={statTrendStyle(data.incidents.trend, data.incidents.percentage)}>
            {data.incidents.trend === "up" ? <ArrowUp size={12} /> : 
             data.incidents.trend === "down" ? <ArrowDown size={12} /> : <Minus size={12} />}
            {data.incidents.percentage}%
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{data.detection.accuracy}%</div>
          <div style={statLabelStyle}>Detection Accuracy</div>
          <div style={{ fontSize: "10px", color: colors.accentGreen }}>
            <Activity size={12} style={{ display: "inline", marginRight: "4px" }} />
            {data.detection.objects} objects tracked          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div style={chartGridStyle}>
        {/* Activity Chart */}
        <div style={chartPanelStyle}>
          <div style={chartTitleStyle}>Activity Pattern</div>
          <div style={barContainerStyle}>
            {data.activity.hourly.map((value, index) => {
              const max = getMaxActivity();
              const height = (value / max) * 100;
              const color = getColorForValue(value, max);
              return (
                <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={barStyle(height, color)} />
                  {index % 4 === 0 && (
                    <span style={{ fontSize: "7px", color: colors.textSecondary, marginTop: "4px" }}>
                      {index}h
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Distribution */}
        <div style={chartPanelStyle}>
          <div style={chartTitleStyle}>Sector Activity</div>
          {data.sectors.map((sector) => {
            const max = Math.max(...data.sectors.map(s => s.threats + s.anomalies));
            const total = sector.threats + sector.anomalies + sector.incidents;
            return (
              <div key={sector.name} style={sectorRowStyle}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{sector.name}</span>
                  <div style={sectorBarStyle(total, max, colors.accentRed)} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", fontSize: "10px", color: colors.textSecondary }}>
                  <span style={{ color: colors.accentRed }}>T:{sector.threats}</span>
                  <span style={{ color: colors.accentAmber }}>A:{sector.anomalies}</span>
                  <span style={{ color: colors.accentBlue }}>I:{sector.incidents}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Threat Breakdown */}
        <div style={chartPanelStyle}>
          <div style={chartTitleStyle}>
            <AlertTriangle size={14} style={{ display: "inline", marginRight: "6px" }} />
            Threat Breakdown
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div style={{ padding: "0.5rem", background: colors.surfaceLighter, border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: colors.accentRed }}>{data.threats.critical}</div>
              <div style={{ fontSize: "9px", color: colors.textSecondary }}>Critical</div>
            </div>
            <div style={{ padding: "0.5rem", background: colors.surfaceLighter, border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: colors.accentOrange }}>{data.threats.high}</div>
              <div style={{ fontSize: "9px", color: colors.textSecondary }}>High</div>
            </div>
            <div style={{ padding: "0.5rem", background: colors.surfaceLighter, border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: colors.accentAmber }}>{data.threats.medium}</div>
              <div style={{ fontSize: "9px", color: colors.textSecondary }}>Medium</div>
            </div>
            <div style={{ padding: "0.5rem", background: colors.surfaceLighter, border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: colors.accentGreen }}>{data.threats.low}</div>
              <div style={{ fontSize: "9px", color: colors.textSecondary }}>Low</div>
            </div>
          </div>
        </div>

        {/* Detection Metrics */}
        <div style={chartPanelStyle}>
          <div style={chartTitleStyle}>
            <Target size={14} style={{ display: "inline", marginRight: "6px" }} />
            Detection Performance
          </div>
          <div style={metricRowStyle}>
            <span>Detection Accuracy</span>
            <span style={{ fontWeight: 600, color: colors.accentGreen }}>{data.detection.accuracy}%</span>
          </div>
          <div style={metricRowStyle}>
            <span>Objects Detected</span>
            <span style={{ fontWeight: 600, color: colors.textPrimary }}>{data.detection.objects}</span>
          </div>
          <div style={metricRowStyle}>
            <span>Objects Tracked</span>
            <span style={{ fontWeight: 600, color: colors.accentBlue }}>{data.detection.tracked}</span>
          </div>
          <div style={metricRowStyle}>
            <span>Tracking Lost</span>
            <span style={{ fontWeight: 600, color: colors.accentRed }}>{data.detection.lost}</span>
          </div>
          <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: colors.surfaceLighter, border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: "10px", color: colors.textSecondary, marginBottom: "0.25rem" }}>Tracking Efficiency</div>
            <div style={{ height: "4px", background: colors.border, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${(data.detection.tracked / data.detection.objects) * 100}%`, height: "100%", background: colors.accentGreen }} />
            </div>
            <div style={{ fontSize: "10px", color: colors.textSecondary, marginTop: "0.25rem" }}>
              {Math.round((data.detection.tracked / data.detection.objects) * 100)}% tracking rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;