// components/Surveillance/Surveillance.tsx
import React, { useState, useEffect, useRef } from "react";
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
  RefreshCw,
  AlertTriangle,
  Eye,
  Layers,
  Grid,
  Filter,
  Volume2,
  VolumeX,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface DetectedObject {
  id: string;
  type: "Vehicle" | "Person" | "Other";
  className: string;
  confidence: number;
  trackId: string;
  threat: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NORMAL";
  position: { x: number; y: number };
  bbox: { x1: number; y1: number; x2: number; y2: number };
  status: "ACTIVE" | "TRACKING" | "LOST";
}

interface LiveCamera {
  camera: string;
  source: string;
  object_present: boolean;
  last_detection: string | null;
  seconds_since_detection: number;
  visible: boolean;
  objects: {
    category: string;
    class: string;
    confidence: number;
    bounding_box: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  }[];
}

interface LiveDetectionResponse {
  system: string;
  updated_at: string;
  no_object_timeout: number;
  cameras: Record<string, LiveCamera>;
}

interface CameraFeed {
  id: string;
  name: string;
  sector: string;
  status: "ACTIVE" | "OFFLINE" | "RECORDING";
  resolution: string;
  fps: number;
  threatLevel?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NORMAL";
  videoSrc?: string;
  backendKey: string;
}

// ============================================================
// VIDEO IMPORTS
// ============================================================
import cam1Video from "../../../public/videos/cam1.mp4";
import cam2Video from "../../../public/videos/cam2.mp4";

// ============================================================
// MOCK DATA
// ============================================================
const cameras: CameraFeed[] = [
  {
    id: "CAM-01",
    name: "Sector A - East Gate",
    sector: "A",
    status: "ACTIVE",
    resolution: "1080p",
    fps: 30,
    threatLevel: "NORMAL",
    videoSrc: cam1Video,
    backendKey: "cam1",
  },
  {
    id: "CAM-02",
    name: "Sector B - Main Road",
    sector: "B",
    status: "ACTIVE",
    resolution: "4K",
    fps: 60,
    threatLevel: "NORMAL",
    videoSrc: cam2Video,
    backendKey: "cam2",
  },
];

// ============================================================
// COMPONENT
// ============================================================
const Surveillance: React.FC = () => {
  const [liveData, setLiveData] = useState<LiveDetectionResponse | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);
  const [liveError, setLiveError] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>("CAM-02");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterThreat, setFilterThreat] = useState<string>("ALL");
  const [videoError, setVideoError] = useState<boolean>(false);
  const [detectionStatus, setDetectionStatus] = useState<"idle" | "starting" | "running" | "stopping">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSize, setVideoSize] = useState({
    width: 1920,
    height: 1080,
  });

  // ---- Control Detection Engine ----
  const startDetection = async () => {
    try {
      setDetectionStatus("starting");
      const response = await fetch("http://localhost:8000/api/detection/start", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Detection started:", data);
        setDetectionStatus("running");
      } else {
        console.error("Failed to start detection");
        setDetectionStatus("idle");
      }
    } catch (error) {
      console.error("Error starting detection:", error);
      setDetectionStatus("idle");
    }
  };

  const stopDetection = async () => {
    try {
      setDetectionStatus("stopping");
      const response = await fetch("http://localhost:8000/api/detection/stop", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Detection stopped:", data);
        setDetectionStatus("idle");
      } else {
        console.error("Failed to stop detection");
        setDetectionStatus("running");
      }
    } catch (error) {
      console.error("Error stopping detection:", error);
      setDetectionStatus("running");
    }
  };

  // ---- Handle Play/Pause ----
  const togglePlay = async () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (videoRef.current) {
      if (newPlayingState) {
        await videoRef.current.play();
        // Start detection when video plays
        await startDetection();
      } else {
        videoRef.current.pause();
        // Stop detection when video pauses
        await stopDetection();
      }
    }
  };

  // ---- Initial video load ----
  useEffect(() => {
    // Auto-start detection when component mounts and video is playing
    if (isPlaying && videoRef.current) {
      startDetection();
    }

    return () => {
      // Cleanup: stop detection when component unmounts
      stopDetection();
    };
  }, []);

  // ---- Fetch Live Detection Data ----
  useEffect(() => {
    let mounted = true;

    const fetchLiveDetection = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/live");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: LiveDetectionResponse = await response.json();

        if (mounted) {
          setLiveData(data);
          setLoadingLive(false);
          setLiveError(false);
        }
      } catch (error) {
        console.error("Failed to fetch live detection:", error);

        if (mounted) {
          setLoadingLive(false);
          setLiveError(true);
        }
      }
    };

    fetchLiveDetection();

    let interval: ReturnType<typeof setInterval> | null = null;

    // Only poll when detection is running
    if (detectionStatus === "running") {
      interval = setInterval(fetchLiveDetection, 500);
    }

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [detectionStatus]);

  // ---- Video play/pause sync with detection ----
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, selectedCamera]);

  // ---- Camera change ----
  useEffect(() => {
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [selectedCamera]);

  const handleVideoError = () => {
    setVideoError(true);
    console.error(`Failed to load video for camera: ${selectedCamera}`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // ---- Get selected camera ----
  const selectedCam = cameras.find((c) => c.id === selectedCamera);
  const selectedCamKey = selectedCam?.backendKey || "cam1";
  const selectedLiveCamera = liveData?.cameras?.[selectedCamKey];

  // ---- Convert backend objects to frontend format ----
  const detectedObjects: DetectedObject[] =
    selectedLiveCamera?.objects?.map((obj, index) => ({
      id: `${selectedCamera}-${index + 1}`,
      type:
        obj.category === "Vehicle"
          ? "Vehicle"
          : obj.category === "Person"
            ? "Person"
            : "Other",
      className: obj.class,
      confidence: Math.round(obj.confidence * 100),
      trackId: `${selectedCamera}-${index + 1}`,
      threat: "NORMAL",
      position: {
        x:
          ((obj.bounding_box.x1 + obj.bounding_box.x2) / 2 / videoSize.width) *
          100,
        y:
          ((obj.bounding_box.y1 + obj.bounding_box.y2) / 2 / videoSize.height) *
          100,
      },
      bbox: obj.bounding_box,
      status: "ACTIVE",
    })) || [];

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

  const threatColors = {
    CRITICAL: colors.accentRed,
    HIGH: colors.accentOrange,
    MEDIUM: colors.accentAmber,
    LOW: colors.accentBlue,
    NORMAL: colors.accentGreen,
  };

  // ---- STYLES (same as before) ----
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
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
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

  const viewToggleStyle = (active: boolean): React.CSSProperties => ({
    background: active ? colors.surfaceLighter : "transparent",
    border: `1px solid ${active ? colors.accentGreen : colors.border}`,
    borderRadius: "4px",
    padding: "0.3rem 0.6rem",
    color: active ? colors.textPrimary : colors.textSecondary,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontSize: "11px",
    fontFamily: "inherit",
    transition: "all 0.15s",
  });

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

  // ---- MAIN GRID ----
  const mainGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2.5fr 1.5fr",
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
    fontSize: "10px",
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  };

  // ---- SURVEILLANCE FEED ----
  const feedContainerStyle: React.CSSProperties = {
    position: "relative",
    background: colors.surfaceDark,
    borderRadius: "4px",
    height: "450px",
    overflow: "hidden",
    border: `1px solid ${colors.borderLight}`,
  };

  const videoStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    background: colors.surfaceDark,
  };

  const videoErrorStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: colors.surfaceDark,
    color: colors.textSecondary,
    gap: "0.5rem",
  };

  const feedSceneStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
  };

  const groundStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
    background: "linear-gradient(180deg, transparent, #0F1A16)",
    borderTop: `1px solid ${colors.borderLight}`,
    pointerEvents: "none",
  };

  const roadStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "25%",
    left: "5%",
    right: "5%",
    height: "6px",
    background: colors.borderLight,
    opacity: 0.5,
    borderRadius: "2px",
    pointerEvents: "none",
  };

  const roadMarkingStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "25.3%",
    left: "10%",
    right: "10%",
    height: "1px",
    background: colors.textSecondary,
    opacity: 0.2,
    borderTop: `2px dashed ${colors.borderLight}`,
    pointerEvents: "none",
  };

  const structureStyle: React.CSSProperties = {
    position: "absolute",
    background: "rgba(26, 42, 36, 0.6)",
    border: `1px solid ${colors.borderLight}`,
    borderRadius: "2px",
    pointerEvents: "none",
  };

  const bboxStyle = (
    color: string,
    top: string,
    left: string,
    width?: string,
    height?: string
  ): React.CSSProperties => ({
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
    boxShadow: color === colors.accentRed ? `0 0 20px ${color}44` : "none",
    pointerEvents: "auto",
  });

  const bboxLabelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.3,
  };

  const trackLineStyle = (
    top: string,
    left: string,
    width: string,
    transform?: string
  ): React.CSSProperties => ({
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
    background: detectionStatus === "running" ? colors.accentRed : colors.textSecondary,
    animation: detectionStatus === "running" ? "pulse-dot 1s infinite" : "none",
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
    fontFamily: "inherit",
  };

  // ---- OBJECT LIST ----
  const objectListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    maxHeight: "380px",
    overflowY: "auto",
  };

  const objectItemStyle = (threat: string): React.CSSProperties => {
    let borderColor = colors.border;
    let bg = colors.surfaceLighter;
    if (threat === "CRITICAL") {
      borderColor = colors.accentRed;
      bg = `${colors.accentRed}10`;
    } else if (threat === "HIGH") {
      borderColor = colors.accentOrange;
      bg = `${colors.accentOrange}10`;
    } else if (threat === "MEDIUM") {
      borderColor = colors.accentAmber;
      bg = `${colors.accentAmber}10`;
    }
    return {
      padding: "0.4rem 0.75rem",
      borderLeft: `3px solid ${borderColor}`,
      background: bg,
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

  const objectThreatBadge = (threat: string): React.CSSProperties => {
    const color = threatColors[threat as keyof typeof threatColors] || colors.textSecondary;
    return {
      fontSize: "8px",
      fontWeight: 700,
      color,
      padding: "0.1rem 0.4rem",
      border: `1px solid ${color}44`,
      borderRadius: "2px",
    };
  };

  // ---- CAMERA GRID ----
  const cameraGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem",
  };

  const cameraCardStyle = (
    isSelected: boolean,
    status: string,
    threatLevel?: string
  ): React.CSSProperties => {
    let borderColor = colors.border;
    if (isSelected) borderColor = colors.accentGreen;
    else if (threatLevel === "CRITICAL") borderColor = colors.accentRed;
    else if (threatLevel === "HIGH") borderColor = colors.accentOrange;
    else if (threatLevel === "MEDIUM") borderColor = colors.accentAmber;
    return {
      background: colors.surface,
      border: `2px solid ${borderColor}`,
      padding: "0.6rem",
      cursor: "pointer",
      transition: "all 0.15s",
      opacity: status === "OFFLINE" ? 0.5 : 1,
    };
  };

  const cameraThreatIndicator = (threatLevel?: string): React.CSSProperties => {
    const color = threatLevel ? threatColors[threatLevel as keyof typeof threatColors] : colors.textSecondary;
    return {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: color,
      display: "inline-block",
      marginLeft: "0.25rem",
      boxShadow: threatLevel === "CRITICAL" ? `0 0 12px ${color}` : "none",
    };
  };

  // ---- FILTERS ----
  const filterBarStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.75rem",
    flexWrap: "wrap",
  };

  const filterSelectStyle: React.CSSProperties = {
    background: colors.surfaceLighter,
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "10px",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
  };

  // ---- KEYFRAMES ----
  useEffect(() => {
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
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  const filteredObjects = detectedObjects.filter((obj) => {
    if (filterThreat === "ALL") return true;
    return obj.threat === filterThreat;
  });

  const criticalCount = detectedObjects.filter((o) => o.threat === "CRITICAL").length;
  const highCount = detectedObjects.filter((o) => o.threat === "HIGH").length;
  const activeCount = detectedObjects.filter((o) => o.status === "ACTIVE" || o.status === "TRACKING").length;

  const hasDetections = detectedObjects.length > 0;
  const isObjectPresent = selectedLiveCamera?.object_present || false;

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <div style={headerTitleStyle}>
            <Camera size={20} color={colors.accentGreen} />
            Surveillance
            {selectedCam?.threatLevel === "CRITICAL" && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: colors.accentRed,
                  background: `${colors.accentRed}15`,
                  padding: "0.1rem 0.6rem",
                  borderRadius: "12px",
                  marginLeft: "0.5rem",
                }}
              >
                <AlertTriangle size={12} style={{ display: "inline", marginRight: "4px" }} />
                CRITICAL
              </span>
            )}
          </div>
          <div style={headerSubtitleStyle}>
            Real-time detection & tracking • {detectedObjects.length} objects detected
            {detectionStatus === "running" && (
              <span
                style={{
                  marginLeft: "0.5rem",
                  color: colors.accentGreen,
                  fontWeight: 600,
                }}
              >
                ● DETECTION ACTIVE
              </span>
            )}
            {detectionStatus === "idle" && (
              <span
                style={{
                  marginLeft: "0.5rem",
                  color: colors.textSecondary,
                  fontWeight: 600,
                }}
              >
                ● DETECTION PAUSED
              </span>
            )}
          </div>
        </div>
        <div style={headerRightStyle}>
          <span
            style={{
              fontSize: "9px",
              color: loadingLive
                ? colors.accentAmber
                : liveError
                  ? colors.accentRed
                  : detectionStatus === "running"
                    ? colors.accentGreen
                    : colors.textSecondary,
              marginLeft: "0.75rem",
              fontWeight: 600,
            }}
          >
            ●{" "}
            {loadingLive
              ? "CONNECTING"
              : liveError
                ? "OFFLINE"
                : detectionStatus === "running"
                  ? "LIVE DATA"
                  : "PAUSED"}
          </span>
          <div style={cameraSelectorStyle}>
            <Radio
              size={14}
              color={
                selectedCam?.status === "ACTIVE"
                  ? colors.accentGreen
                  : selectedCam?.status === "RECORDING"
                    ? colors.accentAmber
                    : colors.accentRed
              }
            />
            <span>{selectedCamera}</span>
            <ChevronDown size={14} />
          </div>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              style={viewToggleStyle(viewMode === "grid")}
              onClick={() => setViewMode("grid")}
            >
              <Grid size={14} />
            </button>
            <button
              style={viewToggleStyle(viewMode === "list")}
              onClick={() => setViewMode("list")}
            >
              <Layers size={14} />
            </button>
          </div>
          <div style={{ ...controlButtonStyle, background: "transparent" }}>
            <RefreshCw size={14} />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <span style={statValueStyle}>{detectedObjects.length}</span>
          <span style={statLabelStyle}>Objects Detected</span>
        </div>
        <div style={statCardStyle}>
          <span style={statValueStyle}>{activeCount}</span>
          <span style={statLabelStyle}>Active Tracks</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentRed }}>
          <span style={{ ...statValueStyle, color: colors.accentRed }}>{criticalCount}</span>
          <span style={statLabelStyle}>Critical Threats</span>
        </div>
        <div style={{ ...statCardStyle, borderColor: colors.accentOrange }}>
          <span style={{ ...statValueStyle, color: colors.accentOrange }}>{highCount}</span>
          <span style={statLabelStyle}>High Threats</span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={mainGridStyle}>
        {/* SURVEILLANCE FEED */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span style={panelTitleStyle}>
              <Eye size={14} style={{ display: "inline", marginRight: "6px" }} />
              Live Feed • {selectedCamera} • {selectedCam?.name}
            </span>
            <span style={{ fontSize: "10px", color: colors.textSecondary }}>
              <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div style={feedContainerStyle}>
            <div style={feedSceneStyle}>
              {/* Video Feed */}
              {selectedCam?.videoSrc && !videoError ? (
                <video
                  ref={videoRef}
                  src={selectedCam.videoSrc}
                  style={videoStyle}
                  autoPlay={isPlaying}
                  muted={isMuted}
                  loop
                  playsInline
                  onError={handleVideoError}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    setVideoSize({
                      width: video.videoWidth,
                      height: video.videoHeight,
                    });
                  }}
                />
              ) : (
                <div style={videoErrorStyle}>
                  <Camera size={48} opacity={0.3} />
                  <span>{videoError ? "Video unavailable" : "No video feed"}</span>
                  <span style={{ fontSize: "11px" }}>Camera: {selectedCamera}</span>
                </div>
              )}

              {/* Terrain overlay (semi-transparent) */}
              <div style={groundStyle} />
              <div style={roadStyle} />
              <div style={roadMarkingStyle} />

              <div style={{ ...structureStyle, top: "10%", left: "5%", width: "12%", height: "15%" }} />
              <div style={{ ...structureStyle, top: "8%", right: "8%", width: "10%", height: "12%" }} />
              <div style={{ ...structureStyle, bottom: "40%", left: "2%", width: "8%", height: "10%" }} />
              <div style={{ ...structureStyle, top: "15%", left: "20%", width: "3%", height: "8%", borderRadius: "50%" }} />
              <div style={{ ...structureStyle, top: "12%", right: "25%", width: "4%", height: "10%", borderRadius: "50%" }} />

              {/* Detected Objects - Bounding Boxes */}
              {detectedObjects.map((obj) => {
                let color = colors.accentGreen;
                if (obj.threat === "CRITICAL") color = colors.accentRed;
                else if (obj.threat === "HIGH") color = colors.accentOrange;
                else if (obj.threat === "MEDIUM") color = colors.accentAmber;
                else if (obj.threat === "LOW") color = colors.accentBlue;

                const isCritical = obj.threat === "CRITICAL";
                const topPercent = (obj.bbox.y1 / videoSize.height) * 100;
                const leftPercent = (obj.bbox.x1 / videoSize.width) * 100;
                const widthPercent = ((obj.bbox.x2 - obj.bbox.x1) / videoSize.width) * 100;
                const heightPercent = ((obj.bbox.y2 - obj.bbox.y1) / videoSize.height) * 100;

                return (
                  <div
                    key={obj.id}
                    style={{
                      ...bboxStyle(
                        color,
                        `${topPercent}%`,
                        `${leftPercent}%`,
                        `${widthPercent}%`,
                        `${heightPercent}%`
                      ),
                      borderColor: color,
                      animation: isCritical ? "pulse-critical 2s infinite" : "none",
                      minWidth: "60px",
                    }}
                    onClick={() => setSelectedObject(obj.id)}
                  >
                    <div style={bboxLabelStyle}>
                      <span style={{ fontWeight: 700 }}>
                        {objectTypeIcon(obj.type)} {obj.type} ({obj.className})
                      </span>
                      <span style={{ fontSize: "8px", color: colors.textSecondary }}>
                        {obj.confidence}% • ID: {obj.id}
                      </span>
                      {isCritical && (
                        <span style={{ fontSize: "8px", color: colors.accentRed, fontWeight: 700 }}>
                          CRITICAL THREAT
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Tracking lines */}
              {detectedObjects.map((obj) => {
                const topPercent = (obj.bbox.y1 / videoSize.height) * 100 + 5;
                const leftPercent = (obj.bbox.x1 / videoSize.width) * 100 + 10;
                let borderColor = colors.accentAmber;
                if (obj.threat === "CRITICAL") borderColor = colors.accentRed;
                else if (obj.threat === "HIGH") borderColor = colors.accentOrange;

                return (
                  <div
                    key={`track-${obj.id}`}
                    style={{
                      ...trackLineStyle(
                        `${topPercent}%`,
                        `${leftPercent}%`,
                        "60px",
                        "rotate(35deg)"
                      ),
                      borderColor: borderColor,
                      opacity: obj.threat === "CRITICAL" ? 0.6 : 0.3,
                    }}
                  />
                );
              })}

              {/* Feed Overlay */}
              <div style={feedOverlayStyle}>
                <div style={feedTopBarStyle}>
                  <div style={feedRecStyle}>
                    <span style={recDotStyle} />
                    <span>REC</span>
                    {detectionStatus === "running" && (
                      <span
                        style={{
                          color: colors.accentGreen,
                          fontWeight: 700,
                          fontSize: "9px",
                          marginLeft: "0.5rem",
                        }}
                      >
                        ● DETECTING
                      </span>
                    )}
                    {detectionStatus === "idle" && (
                      <span
                        style={{
                          color: colors.textSecondary,
                          fontWeight: 700,
                          fontSize: "9px",
                          marginLeft: "0.5rem",
                        }}
                      >
                        ● PAUSED
                      </span>
                    )}
                    {selectedCam?.threatLevel === "CRITICAL" && (
                      <span
                        style={{
                          color: colors.accentRed,
                          fontWeight: 700,
                          fontSize: "9px",
                          marginLeft: "0.5rem",
                        }}
                      >
                        ⚠ CRITICAL
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <span>SECTOR {selectedCam?.sector}</span>
                    <span>|</span>
                    <span>{selectedCamera}</span>
                    <span>|</span>
                    <span>
                      {selectedCam?.status === "ACTIVE"
                        ? "LIVE"
                        : selectedCam?.status === "RECORDING"
                          ? "RECORDING"
                          : "OFFLINE"}
                    </span>
                  </div>
                </div>

                <div style={feedBottomBarStyle}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <span>OBJECTS: {detectedObjects.length}</span>
                    <span>•</span>
                    <span>TRACKING: {detectedObjects.filter((o) => o.status === "TRACKING").length}</span>
                    <span>•</span>
                    <span>
                      THREATS: {detectedObjects.filter((o) => o.threat !== "NORMAL").length}
                    </span>
                    {selectedLiveCamera?.seconds_since_detection !== undefined && detectionStatus === "running" && (
                      <span>
                        • Last detection: {selectedLiveCamera.seconds_since_detection}s ago
                      </span>
                    )}
                  </div>
                  <div style={feedControlsStyle}>
                    <button
                      style={controlButtonStyle}
                      onClick={toggleMute}
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <button
                      style={controlButtonStyle}
                      onClick={togglePlay}
                    >
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
              Detected Objects • Prioritized
            </span>
            <span style={{ fontSize: "10px", color: colors.textSecondary }}>
              <Activity size={12} style={{ display: "inline", marginRight: "4px" }} />
              {detectedObjects.length} active
            </span>
          </div>

          {/* Filters */}
          <div style={filterBarStyle}>
            <select
              style={filterSelectStyle}
              value={filterThreat}
              onChange={(e) => setFilterThreat(e.target.value)}
            >
              <option value="ALL">All Threats</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
            </select>
            <span style={{ fontSize: "9px", color: colors.textSecondary }}>
              <Filter size={10} style={{ display: "inline", marginRight: "4px" }} />
              {filteredObjects.length} results
            </span>
          </div>

          <div style={objectListStyle}>
            {filteredObjects
              .sort((a, b) => {
                const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, NORMAL: 4 };
                return (order[a.threat] || 5) - (order[b.threat] || 5);
              })
              .map((obj) => (
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
                        {obj.className} • {obj.trackId} • {obj.status}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color:
                          obj.threat === "CRITICAL"
                            ? colors.accentRed
                            : obj.threat === "HIGH"
                              ? colors.accentOrange
                              : obj.threat === "MEDIUM"
                                ? colors.accentAmber
                                : colors.accentGreen,
                      }}
                    >
                      {obj.confidence}%
                    </div>
                    <div style={objectThreatBadge(obj.threat)}>{obj.threat}</div>
                  </div>
                </div>
              ))}
          </div>

          {selectedObject && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.5rem 0.75rem",
                background: colors.surfaceLighter,
                border: `1px solid ${colors.border}`,
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginBottom: "0.25rem",
                }}
              >
                OBJECT DETAILS
              </div>
              <div style={{ fontSize: "11px", color: colors.textPrimary }}>
                {detectedObjects.find((o) => o.id === selectedObject)?.type} •{" "}
                {selectedObject}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "0.25rem",
                  fontSize: "9px",
                  color: colors.textSecondary,
                }}
              >
                <span>
                  Class: {detectedObjects.find((o) => o.id === selectedObject)?.className}
                </span>
                <span>
                  Confidence: {detectedObjects.find((o) => o.id === selectedObject)?.confidence}%
                </span>
                <span>
                  Status: {detectedObjects.find((o) => o.id === selectedObject)?.status}
                </span>
                <span>
                  Threat: {detectedObjects.find((o) => o.id === selectedObject)?.threat}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CAMERA GRID */}
      <div style={{ marginTop: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: colors.textSecondary,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            <Camera size={14} style={{ display: "inline", marginRight: "6px" }} />
            Camera Grid • {cameras.length} feeds
          </span>
          <span style={{ fontSize: "10px", color: colors.textSecondary }}>
            <span style={{ color: colors.accentGreen }}>● Active</span>{" "}
            <span style={{ color: colors.accentRed, marginLeft: "0.5rem" }}>
              ● Detection
            </span>
          </span>
        </div>
        <div style={cameraGridStyle}>
          {cameras.map((cam) => {
            const backendKey = cam.backendKey;
            const liveCam = liveData?.cameras?.[backendKey];
            const hasObjects = liveCam?.object_present || false;
            const isVisible = liveCam?.visible !== false;

            return (
              <div
                key={cam.id}
                style={cameraCardStyle(
                  selectedCamera === cam.id,
                  cam.status,
                  hasObjects ? "CRITICAL" : undefined
                )}
                onClick={() => setSelectedCamera(cam.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: colors.textPrimary,
                    }}
                  >
                    {cam.name}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span
                      style={{
                        fontSize: "8px",
                        color: hasObjects
                          ? colors.accentRed
                          : detectionStatus === "idle"
                            ? colors.textSecondary
                            : liveData && !isVisible
                              ? colors.accentRed
                              : cam.status === "ACTIVE"
                                ? colors.accentGreen
                                : cam.status === "RECORDING"
                                  ? colors.accentAmber
                                  : colors.accentRed,
                      }}
                    >
                      {hasObjects ? "DETECTING" : detectionStatus === "idle" ? "PAUSED" : cam.status}
                    </span>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: hasObjects
                          ? colors.accentRed
                          : detectionStatus === "idle"
                            ? colors.textSecondary
                            : liveData && !isVisible
                              ? colors.accentRed
                              : colors.accentGreen,
                        display: "inline-block",
                        boxShadow: hasObjects ? `0 0 12px ${colors.accentRed}` : "none",
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: "9px", color: colors.textSecondary }}>
                  {cam.id} • {cam.resolution} • {cam.fps}fps
                </div>
                {hasObjects && detectionStatus === "running" && (
                  <div
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      color: colors.accentRed,
                      marginTop: "2px",
                    }}
                  >
                    ● {liveCam?.objects?.length || 0} OBJECTS DETECTED
                  </div>
                )}
                {detectionStatus === "idle" && (
                  <div
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      color: colors.textSecondary,
                      marginTop: "2px",
                    }}
                  >
                    ● DETECTION PAUSED
                  </div>
                )}
                {liveData && !isVisible && detectionStatus === "running" && (
                  <div
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      color: colors.accentRed,
                      marginTop: "2px",
                    }}
                  >
                    OFFLINE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Surveillance;