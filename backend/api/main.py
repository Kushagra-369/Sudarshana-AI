# ============================================================
# SUDARSHANA-AI
# FASTAPI BACKEND
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
import json
from datetime import datetime


# ============================================================
# PATH CONFIGURATION
# ============================================================

CURRENT_DIR = Path(
    __file__
).resolve().parent

# backend/
BACKEND_DIR = CURRENT_DIR.parent

# backend/runs/sudarshana/
OUTPUT_DIR = (
    BACKEND_DIR
    / "runs"
    / "sudarshana"
)


DETECTION_FILE = (
    OUTPUT_DIR
    / "detection_result.json"
)

TRACKING_FILE = (
    OUTPUT_DIR
    / "tracking_result.json"
)

SUMMARY_FILE = (
    OUTPUT_DIR
    / "situation_summary.json"
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(

    title="SUDARSHANA-AI API",

    description=(
        "AI-powered defence situational "
        "awareness backend API."
    ),

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
        "http://127.0.0.1:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ============================================================
# HELPER
# ============================================================

def load_json(file_path: Path):

    if not file_path.exists():

        raise HTTPException(

            status_code=404,

            detail=(
                f"Data not available: "
                f"{file_path.name}"
            )
        )


    try:

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except json.JSONDecodeError:

        raise HTTPException(

            status_code=500,

            detail=(
                f"Invalid JSON file: "
                f"{file_path.name}"
            )
        )


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {

        "system":
            "SUDARSHANA-AI",

        "message":
            "Defence Intelligence API is online.",

        "status":
            "operational",

        "timestamp":
            datetime.now().isoformat()
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health():

    return {

        "system":
            "SUDARSHANA-AI",

        "status":
            "operational",

        "processing":
            "local",

        "ai_pipeline":
            "available",

        "timestamp":
            datetime.now().isoformat()
    }


# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get("/api/status")
def status():

    return {

        "system":
            "SUDARSHANA-AI",

        "system_status":
            "OPERATIONAL",

        "processing":
            "LOCAL",

        "detection_data":
            DETECTION_FILE.exists(),

        "tracking_data":
            TRACKING_FILE.exists(),

        "summary_data":
            SUMMARY_FILE.exists(),

        "timestamp":
            datetime.now().isoformat()
    }


# ============================================================
# DETECTIONS
# ============================================================

@app.get("/api/detections")
def detections():

    data = load_json(
        DETECTION_FILE
    )

    return data


# ============================================================
# TRACKING
# ============================================================

@app.get("/api/tracking")
def tracking():

    data = load_json(
        TRACKING_FILE
    )

    return data


# ============================================================
# SUMMARY
# ============================================================

@app.get("/api/summary")
def summary():

    data = load_json(
        SUMMARY_FILE
    )

    return data


# ============================================================
# THREATS
# ============================================================

@app.get("/api/threats")
def threats():

    data = load_json(
        TRACKING_FILE
    )

    detections = data.get(
        "detections",
        []
    )


    threat_events = []

    for detection in detections:

        risk = detection.get(
            "risk",
            {}
        )

        threat_level = risk.get(
            "level",
            "LOW"
        )


        if threat_level in [
            "MEDIUM",
            "HIGH"
        ]:

            threat_events.append(

                {
                    "track_id":
                        detection.get(
                            "track_id"
                        ),

                    "category":
                        detection.get(
                            "category"
                        ),

                    "class":
                        detection.get(
                            "class"
                        ),

                    "confidence":
                        detection.get(
                            "confidence"
                        ),

                    "anomaly":
                        detection.get(
                            "anomaly"
                        ),

                    "risk":
                        risk
                }
            )


    return {

        "total_threats":
            len(threat_events),

        "threats":
            threat_events
    }


# ============================================================
# DASHBOARD OVERVIEW
# ============================================================

@app.get("/api/dashboard")
def dashboard():

    detection_data = load_json(
        DETECTION_FILE
    )

    tracking_data = load_json(
        TRACKING_FILE
    )

    summary_data = load_json(
        SUMMARY_FILE
    )


    detections = tracking_data.get(
        "detections",
        []
    )


    persons = sum(

        1

        for detection in detections

        if detection.get("category")
        == "Person"
    )


    vehicles = sum(

        1

        for detection in detections

        if detection.get("category")
        == "Vehicle"
    )


    anomalies = sum(

        1

        for detection in detections

        if detection.get(
            "anomaly",
            {}
        ).get("level")

        in [
            "MEDIUM",
            "HIGH"
        ]
    )


    high_risk = sum(

        1

        for detection in detections

        if detection.get(
            "risk",
            {}
        ).get("level")
        == "HIGH"
    )


    medium_risk = sum(

        1

        for detection in detections

        if detection.get(
            "risk",
            {}
        ).get("level")
        == "MEDIUM"
    )


    return {

        "system":
            "SUDARSHANA-AI",

        "status":
            summary_data.get(
                "overall_status",
                "UNKNOWN"
            ),

        "objects_detected":
            len(detections),

        "persons":
            persons,

        "vehicles":
            vehicles,

        "anomalies":
            anomalies,

        "active_threats":
            high_risk + medium_risk,

        "high_risk":
            high_risk,

        "medium_risk":
            medium_risk,

        "summary":
            summary_data.get(
                "summary",
                ""
            ),

        "timestamp":
            datetime.now().isoformat()
    }