# ============================================================
# SUDARSHANA-AI
# SITUATION SUMMARY MODULE
# ============================================================

import json
from pathlib import Path


# ============================================================
# PATH CONFIGURATION
# ============================================================

CURRENT_DIR = Path(
    __file__
).resolve().parent

# backend/
BACKEND_DIR = CURRENT_DIR.parent.parent

# Output directory
OUTPUT_DIR = (
    BACKEND_DIR
    / "runs"
    / "sudarshana"
)


INPUT_FILE = (
    OUTPUT_DIR
    / "tracking_result.json"
)

OUTPUT_FILE = (
    OUTPUT_DIR
    / "situation_summary.json"
)


# ============================================================
# CHECK INPUT
# ============================================================

if not INPUT_FILE.exists():

    raise FileNotFoundError(
        f"Tracking result not found: {INPUT_FILE}"
    )


# ============================================================
# LOAD TRACKING DATA
# ============================================================

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)


detections = data.get(
    "detections",
    []
)


# ============================================================
# STATISTICS
# ============================================================

total_objects = len(
    detections
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


high_risk = [
    detection
    for detection in detections
    if detection.get("risk", {}).get("level")
    == "HIGH"
]


medium_risk = [
    detection
    for detection in detections
    if detection.get("risk", {}).get("level")
    == "MEDIUM"
]


low_risk = [
    detection
    for detection in detections
    if detection.get("risk", {}).get("level")
    == "LOW"
]


# ============================================================
# ANOMALY STATISTICS
# ============================================================

high_anomaly = [
    detection
    for detection in detections
    if detection.get("anomaly", {}).get("level")
    == "HIGH"
]


medium_anomaly = [
    detection
    for detection in detections
    if detection.get("anomaly", {}).get("level")
    == "MEDIUM"
]


low_anomaly = [
    detection
    for detection in detections
    if detection.get("anomaly", {}).get("level")
    == "LOW"
]


# ============================================================
# OVERALL STATUS
# ============================================================

if len(high_risk) > 0:

    overall_status = "HIGH"

elif len(medium_risk) > 0:

    overall_status = "MEDIUM"

else:

    overall_status = "LOW"


# ============================================================
# SITUATION SUMMARY
# ============================================================

summary_text = (
    f"SUDARSHANA-AI detected "
    f"{total_objects} object(s). "
    f"{persons} person(s) and "
    f"{vehicles} vehicle(s) were identified. "
    f"Overall assessed risk level is "
    f"{overall_status}. "
    f"Anomaly analysis identified "
    f"{len(high_anomaly)} high, "
    f"{len(medium_anomaly)} medium, and "
    f"{len(low_anomaly)} low anomaly event(s)."
)


# ============================================================
# FINAL SUMMARY OBJECT
# ============================================================

summary = {

    "system":
        "SUDARSHANA-AI",

    "overall_status":
        overall_status,

    "statistics": {

        "total_objects":
            total_objects,

        "persons":
            persons,

        "vehicles":
            vehicles,

        "risk": {

            "high":
                len(high_risk),

            "medium":
                len(medium_risk),

            "low":
                len(low_risk)
        },

        "anomaly": {

            "high":
                len(high_anomaly),

            "medium":
                len(medium_anomaly),

            "low":
                len(low_anomaly)
        }
    },

    "summary":
        summary_text,

    "high_risk_events":
        high_risk
}


# ============================================================
# SAVE
# ============================================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        summary,
        file,
        indent=4
    )


# ============================================================
# TERMINAL OUTPUT
# ============================================================

print()

print("=" * 60)

print(
    "        SITUATION SUMMARY"
)

print("=" * 60)

print()

print(
    summary_text
)

print()

print(
    f"Overall Risk : {overall_status}"
)

print(
    f"High Risk    : {len(high_risk)}"
)

print(
    f"Medium Risk  : {len(medium_risk)}"
)

print(
    f"Low Risk     : {len(low_risk)}"
)

print()

print(
    f"Summary JSON : {OUTPUT_FILE}"
)

print()

print("=" * 60)

print(
    "        SUMMARY COMPLETE"
)

print("=" * 60)