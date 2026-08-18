# ============================================================
# SUDARSHANA-AI
# OBJECT TRACKING MODULE
# ============================================================

from ultralytics import YOLO

from pathlib import Path

import json
import cv2
import sys


# ============================================================
# PATH CONFIGURATION
# ============================================================

CURRENT_DIR = Path(
    __file__
).resolve().parent

# backend/ai/
AI_DIR = CURRENT_DIR.parent

# backend/
BACKEND_DIR = AI_DIR.parent

# Sudarshana-AI/
PROJECT_ROOT = BACKEND_DIR.parent


# ============================================================
# IMPORT AI MODULES
# ============================================================

sys.path.insert(
    0,
    str(AI_DIR)
)


from anomaly.anomaly import (
    calculate_movement_anomaly,
    classify_anomaly
)

from scoring.scorer import (
    calculate_risk_score
)


# ============================================================
# FILES
# ============================================================

MODEL_PATH = (
    PROJECT_ROOT
    / "yolov8n.pt"
)

INPUT_SOURCE = (
    AI_DIR
    / "detection"
    / "test.jpg"
)

OUTPUT_DIR = (
    BACKEND_DIR
    / "runs"
    / "sudarshana"
)


OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# CHECK MODEL
# ============================================================

if not MODEL_PATH.exists():

    raise FileNotFoundError(
        f"YOLO model not found: {MODEL_PATH}"
    )


# ============================================================
# CHECK INPUT
# ============================================================

if not INPUT_SOURCE.exists():

    raise FileNotFoundError(
        f"Input file not found: {INPUT_SOURCE}"
    )


# ============================================================
# CATEGORY
# ============================================================

def get_category(class_name):

    if class_name == "person":

        return "Person"

    elif class_name in [
        "car",
        "truck",
        "bus",
        "motorcycle",
        "bicycle"
    ]:

        return "Vehicle"

    return "Other"


# ============================================================
# LOAD MODEL
# ============================================================

print()

print(
    "Loading YOLO tracking model..."
)

model = YOLO(
    str(MODEL_PATH)
)


# ============================================================
# TRACKING
# ============================================================

print()

print(
    f"Tracking input: {INPUT_SOURCE}"
)


results = model.track(

    source=str(
        INPUT_SOURCE
    ),

    persist=True,

    conf=0.40,

    tracker="bytetrack.yaml",

    save=False
)


# ============================================================
# STORAGE
# ============================================================

detections = []

previous_positions = {}


# ============================================================
# PROCESS RESULTS
# ============================================================

for result in results:

    annotated_frame = result.plot()

    output_image = (
        OUTPUT_DIR
        / "tracking_result.jpg"
    )

    cv2.imwrite(
        str(output_image),
        annotated_frame
    )


    if result.boxes is None:

        continue


    for box in result.boxes:

        # --------------------------------
        # CLASS
        # --------------------------------

        class_id = int(
            box.cls[0]
        )

        class_name = model.names[
            class_id
        ]


        # --------------------------------
        # CONFIDENCE
        # --------------------------------

        confidence = float(
            box.conf[0]
        )


        # --------------------------------
        # TRACK ID
        # --------------------------------

        if box.id is not None:

            track_id = int(
                box.id[0]
            )

        else:

            track_id = -1


        # --------------------------------
        # BOUNDING BOX
        # --------------------------------

        x1, y1, x2, y2 = map(
            int,
            box.xyxy[0].tolist()
        )


        # --------------------------------
        # CENTER
        # --------------------------------

        center_x = int(
            (x1 + x2) / 2
        )

        center_y = int(
            (y1 + y2) / 2
        )


        current_position = (
            center_x,
            center_y
        )


        # --------------------------------
        # PREVIOUS POSITION
        # --------------------------------

        previous_position = (
            previous_positions.get(
                track_id
            )
        )


        # --------------------------------
        # ANOMALY
        # --------------------------------

        anomaly_score = (
            calculate_movement_anomaly(
                previous_position,
                current_position
            )
        )


        anomaly_level = (
            classify_anomaly(
                anomaly_score
            )
        )


        previous_positions[
            track_id
        ] = current_position


        # --------------------------------
        # CATEGORY
        # --------------------------------

        category = get_category(
            class_name
        )


        # --------------------------------
        # RISK
        # --------------------------------

        risk = calculate_risk_score(

            category=category,

            confidence=confidence,

            anomaly_score=anomaly_score
        )


        # --------------------------------
        # DETECTION OBJECT
        # --------------------------------

        detection = {

            "track_id":
                track_id,

            "category":
                category,

            "class":
                class_name,

            "confidence":
                round(
                    confidence,
                    3
                ),

            "position": {

                "x":
                    center_x,

                "y":
                    center_y
            },

            "bounding_box": {

                "x1":
                    x1,

                "y1":
                    y1,

                "x2":
                    x2,

                "y2":
                    y2
            },

            "anomaly": {

                "score":
                    anomaly_score,

                "level":
                    anomaly_level
            },

            "risk":
                risk
        }


        detections.append(
            detection
        )


# ============================================================
# SAVE JSON
# ============================================================

output_json = (
    OUTPUT_DIR
    / "tracking_result.json"
)


tracking_data = {

    "system":
        "SUDARSHANA-AI",

    "model":
        "YOLOv8n + ByteTrack",

    "input":
        str(INPUT_SOURCE),

    "total_detections":
        len(detections),

    "detections":
        detections
}


with open(
    output_json,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        tracking_data,
        file,
        indent=4
    )


# ============================================================
# OUTPUT
# ============================================================

print()

print("=" * 60)

print(
    "        TRACKING COMPLETE"
)

print("=" * 60)

print(
    f"Objects tracked : "
    f"{len(detections)}"
)

print(
    f"Annotated image : "
    f"{output_image}"
)

print(
    f"JSON result     : "
    f"{output_json}"
)

print("=" * 60)


print()

for item in detections:

    print(

        f"ID={item['track_id']} | "

        f"{item['category']} | "

        f"{item['class']} | "

        f"Confidence="
        f"{item['confidence']} | "

        f"Anomaly="
        f"{item['anomaly']['level']} | "

        f"Risk="
        f"{item['risk']['score']} "
        f"({item['risk']['level']})"

    )


print()