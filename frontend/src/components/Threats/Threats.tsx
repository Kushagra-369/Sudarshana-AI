// components/Threats.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  AlertCircle,
  Camera,
  Clock as ClockIcon,
  Maximize2,
  CheckCircle,
  Truck,
  User,
  Radio,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface DetectedObject {
  category: string;
  class: string;
  confidence: number;
  bounding_box: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface LiveCameraData {
  camera: string;
  source: string;
  object_present: boolean;
  last_detection: string | null;
  seconds_since_detection: number;
  visible: boolean;
  objects: DetectedObject[];
  frame: number;
  fps: number;
  video_time: number;
  status: string;
}

interface LiveDetectionResponse {
  system: string;
  updated_at: string;
  no_object_timeout: number;
  cameras: Record<string, LiveCameraData>;
}

interface Violation {
  id: string;
  zoneName: string;
  camera: string;
  objectType: string;
  confidence: number;
  timestamp: string;
  status: "ACTIVE" | "RESOLVED";
}

// ============================================================
// VIDEO IMPORTS
// ============================================================
import cam3Video from "../../../public/videos/cam3.mp4";
import cam4Video from "../../../public/videos/cam4.mp4";

// ============================================================
// COMPONENT
// ============================================================
const Threats: React.FC = () => {
  const [liveData, setLiveData] = useState<LiveDetectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("CAM-03");
  const [fullscreenCam, setFullscreenCam] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [videoSize, setVideoSize] = useState({ width: 1280, height: 720 });

  // Camera configuration for restricted zones
  const restrictedCameras = [
    {
      id: "CAM-03",
      name: "Perimeter East",
      zone: "Restricted Zone A",
      videoSrc: cam3Video,
      backendKey: "cam3",
      resolution: "1080p",
      fps: 25,
      restrictedPolygon: [
        { x: 0.2, y: 0.3 },
        { x: 0.5, y: 0.2 },
        { x: 0.7, y: 0.35 },
        { x: 0.6, y: 0.55 },
        { x: 0.3, y: 0.5 },
      ],
    },
    {
      id: "CAM-04",
      name: "North Restricted Zone",
      zone: "Restricted Zone B",
      videoSrc: cam4Video,
      backendKey: "cam4",
      resolution: "1080p",
      fps: 26,
      restrictedPolygon: [
        { x: 0.1, y: 0.1 },
        { x: 0.4, y: 0.05 },
        { x: 0.6, y: 0.15 },
        { x: 0.55, y: 0.4 },
        { x: 0.2, y: 0.35 },
      ],
    },
  ];

  // ---- Fetch live data ----
  useEffect(() => {
    let mounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchLiveData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/live");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: LiveDetectionResponse = await response.json();
        if (mounted) {
          setLiveData(data);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch live data:", err);
        if (mounted) {
          setError("Failed to connect to detection service");
          setLoading(false);
        }
      }
    };

    fetchLiveData();
    interval = setInterval(fetchLiveData, 500);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  // ---- Check for intrusions ----
  useEffect(() => {
    if (!liveData) return;

    const newViolations: Violation[] = [];

    restrictedCameras.forEach((cam) => {
      const liveCam = liveData.cameras[cam.backendKey];
      if (!liveCam?.objects) return;

      liveCam.objects.forEach((obj) => {
        // Check if object is inside restricted polygon
        const centerX = (obj.bounding_box.x1 + obj.bounding_box.x2) / 2 / videoSize.width;
        const centerY = (obj.bounding_box.y1 + obj.bounding_box.y2) / 2 / videoSize.height;
        // Simplified check - in production use point-in-polygon algorithm
        const isInside = isPointInPolygon(centerX, centerY, cam.restrictedPolygon);

        if (isInside) {
          newViolations.push({
            id: `VIO-${Date.now()}-${Math.random()}`,
            zoneName: cam.zone,
            camera: cam.id,
            objectType: obj.category === "Vehicle" ? "Vehicle" : "Person",
            confidence: Math.round(obj.confidence * 100),
            timestamp: new Date().toISOString(),
            status: "ACTIVE",
          });
        }
      });
    });

    if (newViolations.length > 0) {
      setViolations((prev) => [...newViolations, ...prev].slice(0, 20));
    }
  }, [liveData]);

  // ---- Point-in-polygon helper ----
  const isPointInPolygon = (x: number, y: number, polygon: { x: number; y: number }[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

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
    surfaceDark: "#0A120E",

  };

  // ---- STYLES ----
  const containerStyle: React.CSSProperties = {
    background: colors.bg,
    padding: "1.5rem",
    minHeight: "calc(100vh - 82px)",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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

  // ---- CAMERA FEED ----
  const cameraGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  };

  const feedContainerStyle: React.CSSProperties = {
    position: "relative",
    background: colors.surfaceDark || "#0A120E",
    borderRadius: "4px",
    overflow: "hidden",
    border: `1px solid ${colors.borderLight}`,
    transition: "all 0.3s ease",
  };

  const feedVideoStyle: React.CSSProperties = {
    width: "100%",
    height: "auto",
    aspectRatio: "16/9",
    objectFit: "cover",
    background: colors.surfaceDark || "#0A120E",
    display: "block",
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
    pointerEvents: "none",
  };

  const feedTopBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    pointerEvents: "auto",
  };

  const feedCameraInfoStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.7)",
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
  };

  const feedStatusStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(0,0,0,0.7)",
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    fontSize: "10px",
  };

  const feedBottomBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pointerEvents: "auto",
    background: "rgba(0,0,0,0.7)",
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    fontSize: "10px",
  };

  // ---- Bounding box overlay ----
  const bboxContainerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  };

  const bboxStyle = (
    color: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    confidence: number,
    label: string,
    isRestricted: boolean
  ): React.CSSProperties => {
    const top = (y1 / videoSize.height) * 100;
    const left = (x1 / videoSize.width) * 100;
    const width = ((x2 - x1) / videoSize.width) * 100;
    const height = ((y2 - y1) / videoSize.height) * 100;

    return {
      position: "absolute",
      top: `${top}%`,
      left: `${left}%`,
      width: `${width}%`,
      height: `${height}%`,
      border: `2px solid ${color}`,
      background: `${color}15`,
      pointerEvents: "auto",
      cursor: "pointer",
      boxShadow: isRestricted ? `0 0 20px ${color}66` : "none",
      animation: isRestricted ? "pulse-critical 1.5s infinite" : "none",
    };
  };

  const bboxLabelStyle: React.CSSProperties = {
    position: "absolute",
    top: "-20px",
    left: "0px",
    background: "rgba(0,0,0,0.8)",
    color: "#fff",
    padding: "1px 6px",
    borderRadius: "2px",
    fontSize: "9px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  // ---- Restricted zone overlay ----
  const restrictedZoneStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  };

  // ---- Violations table ----
  const violationsStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: "1rem",
    marginTop: "1.5rem",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "0.4rem 0.5rem",
    color: colors.textSecondary,
    borderBottom: `1px solid ${colors.border}`,
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.4rem 0.5rem",
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textPrimary,
  };

  // ============================================================
  // RENDER
  // ============================================================

  const activeViolations = violations.filter(v => v.status === "ACTIVE");
  const totalViolations = violations.length;

  // Calculate stats from live data
  const totalObjects = liveData
    ? Object.values(liveData.cameras).reduce(
      (sum, cam) => sum + (cam.objects?.length || 0),
      0
    )
    : 0;

  const activeZones = restrictedCameras.filter(
    (cam) => liveData?.cameras[cam.backendKey]?.visible
  ).length;

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>
            <Shield
              size={20}
              style={{ display: "inline", marginRight: "8px", color: colors.accentGreen }}
            />
            Restricted Zone Monitoring
          </div>
          <div style={headerSubtitleStyle}>
            Live surveillance and no-entry zone intrusion detection.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={statusBadgeStyle}>
            <Radio size={12} color={colors.accentGreen} />
            MONITORING ACTIVE
          </span>
        </div>
      </div>

      {/* STATS */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <span style={statValueStyle}>{restrictedCameras.length}</span>
          <span style={statLabelStyle}>Total Zones</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentGreen }}>
          <span style={{ ...statValueStyle, color: colors.accentGreen }}>{activeZones}</span>
          <span style={statLabelStyle}>Active Zones</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentRed }}>
          <span style={{ ...statValueStyle, color: colors.accentRed }}>{activeViolations.length}</span>
          <span style={statLabelStyle}>Active Intrusions</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentAmber }}>
          <span style={{ ...statValueStyle, color: colors.accentAmber }}>{totalViolations}</span>
          <span style={statLabelStyle}>Today's Violations</span>
        </div>
      </div>

      {/* CAMERA FEEDS */}
      <div style={cameraGridStyle}>
        {restrictedCameras.map((cam) => {
          const liveCam = liveData?.cameras?.[cam.backendKey];
          const isVisible = liveCam?.visible || false;
          const objects = liveCam?.objects || [];
          const fps = liveCam?.fps || cam.fps;
          const hasObjects = objects.length > 0;
          const hasIntrusion = hasObjects && objects.some((obj) => {
            const cx = (obj.bounding_box.x1 + obj.bounding_box.x2) / 2 / videoSize.width;
            const cy = (obj.bounding_box.y1 + obj.bounding_box.y2) / 2 / videoSize.height;
            return isPointInPolygon(cx, cy, cam.restrictedPolygon);
          });
          const isFullscreen = fullscreenCam === cam.id;

          return (
            <div
              key={cam.id}
              style={{
                ...feedContainerStyle,
                borderColor: hasIntrusion
                  ? colors.accentRed
                  : hasObjects
                    ? colors.accentAmber
                    : colors.borderLight,
                boxShadow: hasIntrusion ? `0 0 30px ${colors.accentRed}44` : "none",
                gridColumn: isFullscreen ? "1 / -1" : "auto",
              }}
            >
              <video
                ref={(el) => {
                  videoRefs.current[cam.id] = el;
                }}
                src={cam.videoSrc}
                style={feedVideoStyle}
                autoPlay
                muted
                loop
                playsInline
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;

                  setVideoSize({
                    width: video.videoWidth || 1280,
                    height: video.videoHeight || 720,
                  });
                }}
              />

              {/* Restricted Zone Overlay */}
              <div style={restrictedZoneStyle}>
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  viewBox={`0 0 ${videoSize.width} ${videoSize.height}`}
                >
                  <polygon
                    points={cam.restrictedPolygon
                      .map(
                        (p) =>
                          `${p.x * videoSize.width},${p.y * videoSize.height}`
                      )
                      .join(" ")}
                    fill="rgba(217, 83, 79, 0.15)"
                    stroke={colors.accentRed}
                    strokeWidth="2"
                    strokeDasharray="8,4"
                  />
                  <text
                    x={cam.restrictedPolygon[0].x * videoSize.width}
                    y={cam.restrictedPolygon[0].y * videoSize.height - 10}
                    fill={colors.accentRed}
                    fontSize="12"
                    fontWeight="bold"
                  >
                    RESTRICTED ZONE
                  </text>
                </svg>
              </div>

              {/* Bounding Boxes */}
              <div style={bboxContainerStyle}>
                {objects.map((obj, idx) => {
                  const cx = (obj.bounding_box.x1 + obj.bounding_box.x2) / 2 / videoSize.width;
                  const cy = (obj.bounding_box.y1 + obj.bounding_box.y2) / 2 / videoSize.height;
                  const isInside = isPointInPolygon(cx, cy, cam.restrictedPolygon);
                  const color = isInside ? colors.accentRed : colors.accentGreen;
                  const label = `${obj.category === "Vehicle" ? "🚗" : "👤"} ${obj.class} ${Math.round(obj.confidence * 100)}%`;

                  return (
                    <div
                      key={`bbox-${cam.id}-${idx}`}
                      style={bboxStyle(
                        color,
                        obj.bounding_box.x1,
                        obj.bounding_box.y1,
                        obj.bounding_box.x2,
                        obj.bounding_box.y2,
                        obj.confidence,
                        label,
                        isInside
                      )}
                    >
                      <div style={bboxLabelStyle}>
                        {label}
                        {isInside && (
                          <span
                            style={{
                              color: colors.accentRed,
                              marginLeft: "4px",
                              fontWeight: 700,
                            }}
                          >
                            ⚠ INTRUSION
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overlay UI */}
              <div style={feedOverlayStyle}>
                <div style={feedTopBarStyle}>
                  <div>
                    <div style={feedCameraInfoStyle}>
                      <Camera size={12} style={{ display: "inline", marginRight: "4px" }} />
                      {cam.id} • {cam.name}
                    </div>
                    <div
                      style={{
                        ...feedCameraInfoStyle,
                        marginTop: "4px",
                        fontSize: "10px",
                        fontWeight: 400,
                      }}
                    >
                      {cam.zone}
                    </div>
                  </div>
                  <div style={feedStatusStyle}>
                    {!isVisible ? (
                      <span style={{ color: colors.accentRed }}>● OFFLINE</span>
                    ) : hasIntrusion ? (
                      <span style={{ color: colors.accentRed, fontWeight: 700 }}>
                        ⚠ INTRUSION DETECTED
                      </span>
                    ) : hasObjects ? (
                      <span style={{ color: colors.accentAmber }}>● OBJECTS DETECTED</span>
                    ) : (
                      <span style={{ color: colors.accentGreen }}>● ZONE CLEAR</span>
                    )}
                  </div>
                </div>

                <div style={feedBottomBarStyle}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <span>
                      <span
                        style={{
                          display: "inline-block",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: isVisible ? colors.accentGreen : colors.accentRed,
                          marginRight: "4px",
                        }}
                      />
                      {isVisible ? "LIVE" : "OFFLINE"}
                    </span>
                    <span>FPS: {fps}</span>
                    <span>Objects: {objects.length}</span>
                    <span>
                      Status:{" "}
                      <span
                        style={{
                          color: hasIntrusion
                            ? colors.accentRed
                            : hasObjects
                              ? colors.accentAmber
                              : colors.accentGreen,
                          fontWeight: 600,
                        }}
                      >
                        {hasIntrusion
                          ? "⚠ INTRUSION"
                          : hasObjects
                            ? "DETECTING"
                            : "CLEAR"}
                      </span>
                    </span>
                  </div>
                  <button
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "4px",
                      padding: "0.2rem 0.5rem",
                      color: colors.textPrimary,
                      cursor: "pointer",
                      fontSize: "10px",
                      fontFamily: "inherit",
                    }}
                    onClick={() =>
                      setFullscreenCam(isFullscreen ? null : cam.id)
                    }
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE INTRUSIONS */}
      <div style={violationsStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
            paddingBottom: "0.5rem",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: colors.textSecondary,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            <AlertCircle
              size={14}
              style={{ display: "inline", marginRight: "6px", color: colors.accentRed }}
            />
            Active Intrusions
          </span>
          <span style={{ fontSize: "10px", color: colors.textSecondary }}>
            {activeViolations.length} active
          </span>
        </div>

        {activeViolations.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: colors.textSecondary,
              fontSize: "13px",
            }}
          >
            <CheckCircle
              size={32}
              style={{ marginBottom: "0.5rem", color: colors.accentGreen }}
            />
            No Active Intrusions
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>TIME</th>
                  <th style={thStyle}>ZONE</th>
                  <th style={thStyle}>CAMERA</th>
                  <th style={thStyle}>OBJECT</th>
                  <th style={thStyle}>CONFIDENCE</th>
                  <th style={thStyle}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {activeViolations
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((violation) => (
                    <tr key={violation.id}>
                      <td style={tdStyle}>
                        {new Date(violation.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            color: colors.accentRed,
                            fontWeight: 600,
                          }}
                        >
                          {violation.zoneName}
                        </span>
                      </td>
                      <td style={tdStyle}>{violation.camera}</td>
                      <td style={tdStyle}>
                        {violation.objectType === "Vehicle" ? (
                          <Truck size={14} style={{ display: "inline", marginRight: "4px" }} />
                        ) : (
                          <User size={14} style={{ display: "inline", marginRight: "4px" }} />
                        )}
                        {violation.objectType}
                      </td>
                      <td style={{ ...tdStyle, color: colors.accentGreen }}>
                        {violation.confidence}%
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 600,
                            color: colors.accentRed,
                            padding: "0.1rem 0.4rem",
                            borderRadius: "2px",
                            background: `${colors.accentRed}15`,
                          }}
                        >
                          {violation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KEYFRAMES */}
      <style>{`
        @keyframes pulse-critical {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217, 83, 79, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(217, 83, 79, 0); }
        }
      `}</style>
    </div>
  );
};

export default Threats;