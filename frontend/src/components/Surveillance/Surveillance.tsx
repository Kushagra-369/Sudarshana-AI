// components/Surveillance.tsx
import React, { useState } from "react";
import {
  Camera,
  Radio,
  Clock,
  Target,
  
  Activity,

  ChevronDown,
  Play,
  Pause,
  Maximize2,

  User,
  Truck,

  RefreshCw
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface DetectedObject {
  id: string;
  type: "Vehicle" | "Person" | "Other";
  confidence: number;
  trackId: string;
  threat: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NORMAL";
  position: { x: number; y: number };
  bbox: { top: string; left: string; width?: string; height?: string };
  status: "ACTIVE" | "TRACKING" | "LOST";
}

interface CameraFeed {
  id: string;
  name: string;
  sector: string;
  status: "ACTIVE" | "OFFLINE" | "RECORDING";
  resolution: string;
  fps: number;
}

// ============================================================
// MOCK DATA
// ============================================================
const cameras: CameraFeed[] = [
  { id: "CAM-01", name: "Sector A - East Gate", sector: "A", status: "ACTIVE", resolution: "1080p", fps: 30 },
  { id: "CAM-02", name: "Sector B - Main Road", sector: "B", status: "ACTIVE", resolution: "4K", fps: 60 },
  { id: "CAM-03", name: "Sector C - Checkpoint", sector: "C", status: "ACTIVE", resolution: "1080p", fps: 30 },
  { id: "CAM-04", name: "Sector D - Perimeter", sector: "D", status: "OFFLINE", resolution: "720p", fps: 15 },
];

const detectedObjects: DetectedObject[] = [
  {
    id: "OBJ-001",
    type: "Vehicle",
    confidence: 94,
    trackId: "TRK-001",
    threat: "HIGH",
    position: { x: 35, y: 42 },
    bbox: { top: "35%", left: "25%" },
    status: "TRACKING",
  },
  {
    id: "OBJ-002",
    type: "Person",
    confidence: 91,
    trackId: "TRK-002",
    threat: "NORMAL",
    position: { x: 55, y: 58 },
    bbox: { top: "55%", left: "50%" },
    status: "ACTIVE",
  },
  {
    id: "OBJ-003",
    type: "Vehicle",
    confidence: 78,
    trackId: "TRK-003",
    threat: "MEDIUM",
    position: { x: 72, y: 25 },
    bbox: { top: "20%", left: "70%" },
    status: "TRACKING",
  },
  {
    id: "OBJ-004",
    type: "Person",
    confidence: 65,
    trackId: "TRK-004",
    threat: "LOW",
    position: { x: 15, y: 70 },
    bbox: { top: "65%", left: "12%" },
    status: "LOST",
  },
];

// ============================================================
// COMPONENT
// ============================================================
const Surveillance: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<string>("CAM-02");
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

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

  const cameraSelectorStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "0.4rem 0.75rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
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
    height: "420px",
    overflow: "hidden",
    border: `1px solid ${colors.borderLight}`,
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
    height: "35%",
    background: "linear-gradient(180deg, transparent, #0F1A16)",
    borderTop: `1px solid ${colors.borderLight}`,
  };

  // Road
  const roadStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "25%",
    left: "5%",
    right: "5%",
    height: "6px",
    background: colors.borderLight,
    opacity: 0.5,
    borderRadius: "2px",
  };

  // Road markings
  const roadMarkingStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "25.3%",
    left: "10%",
    right: "10%",
    height: "1px",
    background: colors.textSecondary,
    opacity: 0.2,
    borderTop: `2px dashed ${colors.borderLight}`,
  };

  // Buildings/structures
  const structureStyle: React.CSSProperties = {
    position: "absolute",
    background: "rgba(26, 42, 36, 0.6)",
    border: `1px solid ${colors.borderLight}`,
    borderRadius: "2px",
  };

  // BBox style
  const bboxStyle = (color: string, top: string, left: string, width?: string, height?: string): React.CSSProperties => ({
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
    width: width || "auto",
    height: height || "auto",
    minWidth: "80px",
    backdropFilter: "blur(4px)",
    cursor: "pointer",
  });

  const bboxLabelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.3,
  };

  // Tracking line
  const trackLineStyle = (top: string, left: string, width: string, transform?: string): React.CSSProperties => ({
    position: "absolute",
    border: `1px dashed ${colors.accentAmber}`,
    opacity: 0.3,
    pointerEvents: "none",
    top,
    left,
    width,
    transform: transform || "none",
  });

  // Feed overlay
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
    pointerEvents: "none",
  };

  const feedTopBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "10px",
    color: colors.textSecondary,
    letterSpacing: "0.5px",
    pointerEvents: "auto",
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

  const feedBottomBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "9px",
    color: colors.textSecondary,
    pointerEvents: "auto",
  };

  const feedControlsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    pointerEvents: "auto",
  };

  const controlButtonStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.5)",
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    padding: "0.25rem 0.5rem",
    color: colors.textPrimary,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "10px",
    transition: "background 0.15s",
  };

  // ---- OBJECT LIST ----
  const objectListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const objectItemStyle = (threat: string): React.CSSProperties => {
    let borderColor = colors.border;
    if (threat === "CRITICAL") borderColor = colors.accentRed;
    else if (threat === "HIGH") borderColor = colors.accentOrange;
    else if (threat === "MEDIUM") borderColor = colors.accentAmber;
    else if (threat === "LOW") borderColor = colors.accentBlue;
    return {
      padding: "0.5rem 0.75rem",
      borderLeft: `3px solid ${borderColor}`,
      background: colors.surfaceLighter,
      cursor: "pointer",
      transition: "background 0.15s",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    };
  };

  const objectTypeIcon = (type: string): React.ReactNode => {
    if (type === "Vehicle") return <Truck size={14} />;
    if (type === "Person") return <User size={14} />;
    return <Target size={14} />;
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
    display: "flex",
    flexDirection: "column",
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
    return () => {document.head.removeChild(style)};
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>Surveillance</div>
          <div style={headerSubtitleStyle}>
            <Camera size={14} style={{ display: "inline", marginRight: "6px" }} />
            Real-time detection & tracking
          </div>
        </div>
        <div style={headerRightStyle}>
          <div style={cameraSelectorStyle}>
            <Radio size={14} color={colors.accentGreen} />
            <span>{selectedCamera}</span>
            <ChevronDown size={14} />
          </div>
          <div style={{ ...controlButtonStyle, background: "transparent" }}>
            <RefreshCw size={14} />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <span style={statValueStyle}>47</span>
          <span style={statLabelStyle}>Objects Detected</span>
        </div>
        <div style={statCardStyle}>
          <span style={statValueStyle}>12</span>
          <span style={statLabelStyle}>Active Tracks</span>
        </div>
        <div style={statCardStyle}>
          <span style={statValueStyle}>8</span>
          <span style={statLabelStyle}>Threats</span>
        </div>
        <div style={statCardStyle}>
          <span style={statValueStyle}>98%</span>
          <span style={statLabelStyle}>Detection Accuracy</span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={mainGridStyle}>
        {/* SURVEILLANCE FEED */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>
              <Camera size={14} style={{ display: "inline", marginRight: "6px" }} />
              Live Feed • {selectedCamera}
            </span>
            <span style={{ fontSize: "10px", color: colors.textSecondary }}>
              <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div style={feedContainerStyle}>
            <div style={feedSceneStyle}>
              {/* Terrain */}
              <div style={groundStyle} />
              <div style={roadStyle} />
              <div style={roadMarkingStyle} />

              {/* Structures */}
              <div style={{ ...structureStyle, top: "10%", left: "5%", width: "12%", height: "15%" }} />
              <div style={{ ...structureStyle, top: "8%", right: "8%", width: "10%", height: "12%" }} />
              <div style={{ ...structureStyle, bottom: "40%", left: "2%", width: "8%", height: "10%" }} />

              {/* Trees */}
              <div style={{ ...structureStyle, top: "15%", left: "20%", width: "3%", height: "8%", borderRadius: "50%" }} />
              <div style={{ ...structureStyle, top: "12%", right: "25%", width: "4%", height: "10%", borderRadius: "50%" }} />

              {/* BBox - Vehicle */}
              <div
                style={bboxStyle(colors.accentOrange, "35%", "25%", "120px", "60px")}
                onClick={() => setSelectedObject("OBJ-001")}
              >
                <div style={bboxLabelStyle}>
                  <span style={{ fontWeight: 700 }}>
                    {objectTypeIcon("Vehicle")} VEHICLE #04
                  </span>
                  <span style={{ fontSize: "8px", color: colors.textSecondary }}>94% • TRK-001</span>
                  <span style={{ fontSize: "8px", color: colors.accentOrange }}>THREAT: HIGH</span>
                </div>
              </div>

              {/* BBox - Person */}
              <div
                style={bboxStyle(colors.accentGreen, "55%", "50%", "100px", "50px")}
                onClick={() => setSelectedObject("OBJ-002")}
              >
                <div style={bboxLabelStyle}>
                  <span style={{ fontWeight: 700 }}>
                    {objectTypeIcon("Person")} PERSON #12
                  </span>
                  <span style={{ fontSize: "8px", color: colors.textSecondary }}>91% • TRK-002</span>
                  <span style={{ fontSize: "8px", color: colors.accentGreen }}>NORMAL</span>
                </div>
              </div>

              {/* BBox - Vehicle 2 */}
              <div
                style={bboxStyle(colors.accentAmber, "20%", "70%", "110px", "55px")}
                onClick={() => setSelectedObject("OBJ-003")}
              >
                <div style={bboxLabelStyle}>
                  <span style={{ fontWeight: 700 }}>
                    {objectTypeIcon("Vehicle")} VEHICLE #03
                  </span>
                  <span style={{ fontSize: "8px", color: colors.textSecondary }}>78% • TRK-003</span>
                  <span style={{ fontSize: "8px", color: colors.accentAmber }}>MEDIUM</span>
                </div>
              </div>

              {/* Tracking lines */}
              <div style={trackLineStyle("40%", "30%", "60px", "rotate(35deg)")} />
              <div style={trackLineStyle("60%", "52%", "40px", "rotate(-20deg)")} />
              <div style={trackLineStyle("25%", "75%", "50px", "rotate(45deg)")} />

              {/* Path prediction */}
              <div style={{ ...trackLineStyle("35%", "20%", "80px", "rotate(10deg)"), opacity: 0.15, border: `1px dotted ${colors.accentAmber}` }} />

              {/* Feed Overlay */}
              <div style={feedOverlayStyle}>
                <div style={feedTopBarStyle}>
                  <div style={feedRecStyle}>
                    <span style={recDotStyle} />
                    <span>REC</span>
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <span>SECTOR B</span>
                    <span>|</span>
                    <span>CAM-04</span>
                    <span>|</span>
                    <span>LOCAL FEED</span>
                  </div>
                </div>

                <div style={feedBottomBarStyle}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <span>OBJECTS: 04</span>
                    <span>•</span>
                    <span>TRACKING: 03</span>
                    <span>•</span>
                    <span>THREATS: 02</span>
                  </div>
                  <div style={feedControlsStyle}>
                    <button style={controlButtonStyle} onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button style={controlButtonStyle}>
                      <Maximize2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OBJECT LIST & DETAILS */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>
              <Target size={14} style={{ display: "inline", marginRight: "6px" }} />
              Detected Objects
            </span>
            <span style={{ fontSize: "10px", color: colors.textSecondary }}>
              <Activity size={12} style={{ display: "inline", marginRight: "4px" }} />
              {detectedObjects.length} active
            </span>
          </div>

          <div style={objectListStyle}>
            {detectedObjects.map((obj) => (
              <div
                key={obj.id}
                style={objectItemStyle(obj.threat)}
                onClick={() => setSelectedObject(obj.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {objectTypeIcon(obj.type)}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>
                      {obj.type} • {obj.id}
                    </div>
                    <div style={{ fontSize: "9px", color: colors.textSecondary }}>
                      Track: {obj.trackId} • {obj.status}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: colors.accentGreen }}>
                    {obj.confidence}%
                  </div>
                  <div style={{ fontSize: "8px", color: colors.textSecondary }}>
                    {obj.threat}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedObject && (
            <div style={{
              marginTop: "0.75rem",
              padding: "0.5rem 0.75rem",
              background: colors.surfaceLighter,
              border: `1px solid ${colors.border}`,
              borderRadius: "4px",
            }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: colors.textSecondary, marginBottom: "0.25rem" }}>
                OBJECT DETAILS
              </div>
              <div style={{ fontSize: "11px", color: colors.textPrimary }}>
                {detectedObjects.find(o => o.id === selectedObject)?.type} • {selectedObject}
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem", fontSize: "9px", color: colors.textSecondary }}>
                <span>Position: {detectedObjects.find(o => o.id === selectedObject)?.position.x}%, {detectedObjects.find(o => o.id === selectedObject)?.position.y}%</span>
                <span>Status: {detectedObjects.find(o => o.id === selectedObject)?.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CAMERA GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
        {cameras.map((cam) => (
          <div
            key={cam.id}
            style={{
              background: colors.surface,
              border: `1px solid ${cam.id === selectedCamera ? colors.accentGreen : colors.border}`,
              padding: "0.6rem",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onClick={() => setSelectedCamera(cam.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: colors.textPrimary }}>{cam.name}</span>
              <span style={{ fontSize: "8px", color: cam.status === "ACTIVE" ? colors.accentGreen : colors.accentRed }}>
                {cam.status}
              </span>
            </div>
            <div style={{ fontSize: "9px", color: colors.textSecondary }}>
              {cam.id} • {cam.resolution} • {cam.fps}fps
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Surveillance;