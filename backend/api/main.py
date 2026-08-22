# ============================================================
# SUDARSHANA-AI
# FASTAPI BACKEND
# ============================================================

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from pathlib import Path
import json
from datetime import datetime
import threading
import time
import signal
import sys

# ============================================================
# PATH CONFIGURATION
# ============================================================

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
OUTPUT_DIR = BACKEND_DIR / "runs" / "sudarshana"

DETECTION_FILE = OUTPUT_DIR / "detection_result.json"
TRACKING_FILE = OUTPUT_DIR / "tracking_result.json"
SUMMARY_FILE = OUTPUT_DIR / "situation_summary.json"
SURVEILLANCE_FILE = OUTPUT_DIR / "surveillance_result.json"
LIVE_STATUS_FILE = OUTPUT_DIR / "live_detection.json"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="SUDARSHANA-AI API",
    description="AI-powered defence situational awareness backend API.",
    version="1.0.0"
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ============================================================
# GLOBAL STATE FOR DETECTION CONTROL
# ============================================================

detection_running = False
detection_thread = None
detection_lock = threading.Lock()
camera_running = {}
camera_state = {}

# ============================================================
# HELPER
# ============================================================

def load_json(file_path: Path):
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Data not available: {file_path.name}"
        )

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON file: {file_path.name}"
        )

# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "system": "SUDARSHANA-AI",
        "message": "Defence Intelligence API is online.",
        "status": "operational",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health():
    return {
        "system": "SUDARSHANA-AI",
        "status": "operational",
        "processing": "local",
        "ai_pipeline": "available",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get("/api/status")
def status():
    return {
        "system": "SUDARSHANA-AI",
        "system_status": "OPERATIONAL",
        "processing": "LOCAL",
        "detection_data": DETECTION_FILE.exists(),
        "tracking_data": TRACKING_FILE.exists(),
        "summary_data": SUMMARY_FILE.exists(),
        "timestamp": datetime.now().isoformat()
    }

# ============================================================
# LIVE DETECTION STATUS
# ============================================================

@app.get("/api/live")
def live_detection():
    """Get real-time live detection status from all cameras."""
    try:
        if not LIVE_STATUS_FILE.exists():
            return {
                "system": "SUDARSHANA-AI",
                "updated_at": datetime.now().isoformat(),
                "no_object_timeout": 10,
                "cameras": {
                    "cam1": {
                        "camera": "cam1",
                        "source": "",
                        "object_present": False,
                        "last_detection": None,
                        "seconds_since_detection": None,
                        "visible": False,
                        "objects": [],
                        "frame": 0,
                        "fps": 0,
                        "video_time": 0,
                        "status": "IDLE"
                    },
                    "cam2": {
                        "camera": "cam2",
                        "source": "",
                        "object_present": False,
                        "last_detection": None,
                        "seconds_since_detection": None,
                        "visible": False,
                        "objects": [],
                        "frame": 0,
                        "fps": 0,
                        "video_time": 0,
                        "status": "IDLE"
                    }
                }
            }

        with open(LIVE_STATUS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)

    except Exception as error:
        print(f"Live detection error: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load live detection data: {str(error)}"
        )

# ============================================================
# DETECTIONS
# ============================================================

@app.get("/api/detections")
def detections():
    data = load_json(DETECTION_FILE)
    return data

# ============================================================
# TRACKING
# ============================================================

@app.get("/api/tracking")
def tracking():
    data = load_json(TRACKING_FILE)
    return data

# ============================================================
# SUMMARY
# ============================================================

@app.get("/api/summary")
def summary():
    data = load_json(SUMMARY_FILE)
    return data

# ============================================================
# THREATS
# ============================================================

@app.get("/api/threats")
def threats():
    data = load_json(SUMMARY_FILE)
    tracks = data.get("tracks", [])
    threat_events = []

    for track in tracks:
        risk = track.get("risk", {})
        threat_level = risk.get("level", "LOW")
        if threat_level in ["MEDIUM", "HIGH"]:
            threat_events.append({
                "track_id": track.get("track_id"),
                "category": track.get("category"),
                "class": track.get("class"),
                "confidence": track.get("confidence"),
                "anomaly": track.get("anomaly"),
                "risk": risk
            })

    return {
        "total_threats": len(threat_events),
        "threats": threat_events
    }

# ============================================================
# DASHBOARD OVERVIEW
# ============================================================

@app.get("/api/dashboard")
def dashboard():
    data = load_json(SUMMARY_FILE)
    tracks = data.get("tracks", [])

    persons = sum(1 for track in tracks if track.get("category") == "Person")
    vehicles = sum(1 for track in tracks if track.get("category") == "Vehicle")
    anomalies = sum(1 for track in tracks if track.get("anomaly", {}).get("level") in ["MEDIUM", "HIGH"])
    high_risk = sum(1 for track in tracks if track.get("risk", {}).get("level") == "HIGH")
    medium_risk = sum(1 for track in tracks if track.get("risk", {}).get("level") == "MEDIUM")

    return {
        "system": "SUDARSHANA-AI",
        "status": "OPERATIONAL",
        "objects_detected": len(tracks),
        "persons": persons,
        "vehicles": vehicles,
        "anomalies": anomalies,
        "active_threats": high_risk + medium_risk,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "summary": "Video surveillance analysis completed.",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================
# LIVE FRAME DETECTION
# ============================================================

@app.post("/api/live/detect")
async def live_frame_detection(
    file: UploadFile = File(...)
):
    try:
        from ai.detection.detect import detect_frame
        
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Empty frame received."
            )

        np_array = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid image frame."
            )

        detections = detect_frame(frame)

        return {
            "system": "SUDARSHANA-AI",
            "timestamp": datetime.now().isoformat(),
            "total_objects": len(detections),
            "detections": detections
        }

    except HTTPException:
        raise
    except Exception as error:
        print("Live detection error:", error)
        raise HTTPException(
            status_code=500,
            detail="Live frame detection failed."
        )

# ============================================================
# CONTROL DETECTION ENGINE
# ============================================================

def run_detection_engine():
    """Run the detection engine in a separate thread"""
    global detection_running
    
    try:
        import importlib
        import sys
        
        # Add the backend directory to path if needed
        backend_path = str(BACKEND_DIR)
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)
        
        # Import the live_detection module
        live_detection_module = importlib.import_module("ai.detection.live_detection")
        
        print("Detection engine starting...")
        
        # Start all cameras
        if hasattr(live_detection_module, 'start_all_cameras'):
            live_detection_module.start_all_cameras()
        else:
            # Fallback: start each camera individually
            for camera_name in live_detection_module.CAMERAS:
                if hasattr(live_detection_module, 'start_camera'):
                    live_detection_module.start_camera(camera_name)
        
        # Keep the thread alive
        while detection_running:
            time.sleep(1)
            
        print("Detection engine stopped.")
        
    except Exception as e:
        print(f"Detection engine error: {e}")
        import traceback
        traceback.print_exc()
        detection_running = False

@app.post("/api/detection/start")
def start_detection():
    """Start the detection engine for all cameras"""
    global detection_running, detection_thread
    
    with detection_lock:
        if detection_running:
            return {
                "status": "already_running",
                "message": "Detection engine is already running"
            }
        
        try:
            # Check if live_detection module exists
            import importlib
            try:
                live_detection_module = importlib.import_module("ai.detection.live_detection")
            except ImportError:
                return {
                    "status": "error",
                    "message": "Live detection module not found. Please ensure ai/detection/live_detection.py exists."
                }
            
            # Start detection in a separate thread
            detection_running = True
            
            detection_thread = threading.Thread(
                target=run_detection_engine,
                daemon=True
            )
            detection_thread.start()
            
            return {
                "status": "started",
                "message": "Detection engine started successfully"
            }
            
        except Exception as error:
            detection_running = False
            print(f"Failed to start detection: {error}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to start detection: {str(error)}"
            )

@app.post("/api/detection/stop")
def stop_detection():
    """Stop the detection engine"""
    global detection_running
    
    with detection_lock:
        if not detection_running:
            return {
                "status": "not_running",
                "message": "Detection engine is not running"
            }
        
        try:
            # Stop the detection engine
            detection_running = False
            
            # Import and stop all cameras
            import importlib
            try:
                live_detection_module = importlib.import_module("ai.detection.live_detection")
                
                if hasattr(live_detection_module, 'stop_all_cameras'):
                    live_detection_module.stop_all_cameras()
                else:
                    # Fallback: stop each camera individually
                    for camera_name in getattr(live_detection_module, 'CAMERAS', {}):
                        if hasattr(live_detection_module, 'stop_camera'):
                            live_detection_module.stop_camera(camera_name)
            except ImportError:
                pass
            
            return {
                "status": "stopped",
                "message": "Detection engine stopped successfully"
            }
            
        except Exception as error:
            print(f"Failed to stop detection: {error}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to stop detection: {str(error)}"
            )

@app.get("/api/detection/status")
def detection_status():
    """Get current detection engine status"""
    try:
        import importlib
        try:
            live_detection_module = importlib.import_module("ai.detection.live_detection")
            camera_state = getattr(live_detection_module, 'camera_state', {})
            camera_running = getattr(live_detection_module, 'camera_running', {})
        except ImportError:
            camera_state = {}
            camera_running = {}
        
        return {
            "running": detection_running,
            "cameras": {
                "cam1": {
                    "running": camera_running.get("cam1", False),
                    "visible": camera_state.get("cam1", {}).get("visible", False),
                    "objects": len(camera_state.get("cam1", {}).get("objects", []))
                },
                "cam2": {
                    "running": camera_running.get("cam2", False),
                    "visible": camera_state.get("cam2", {}).get("visible", False),
                    "objects": len(camera_state.get("cam2", {}).get("objects", []))
                }
            }
        }
    except Exception as error:
        return {
            "running": detection_running,
            "error": str(error)
        }

# ============================================================
# SHUTDOWN HANDLER
# ============================================================

@app.on_event("shutdown")
def shutdown_event():
    """Clean up on server shutdown"""
    global detection_running
    print("Shutting down detection engine...")
    detection_running = False
    
    try:
        import importlib
        try:
            live_detection_module = importlib.import_module("ai.detection.live_detection")
            if hasattr(live_detection_module, 'stop_all_cameras'):
                live_detection_module.stop_all_cameras()
        except ImportError:
            pass
    except Exception as e:
        print(f"Error during shutdown: {e}")