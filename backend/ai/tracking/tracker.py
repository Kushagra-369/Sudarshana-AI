from ultralytics import YOLO
from pathlib import Path
import json
import cv2
import sys


# Allow imports from backend/ai
AI_DIR = Path(__file__).resolve().parent.parent

sys.path.append(str(AI_DIR))

from anomaly.anomaly import (
    calculate_movement_anomaly,
    classify_anomaly
)

from scoring.scorer import (
    calculate_risk_score
)


MODEL_PATH = "yolov8n.pt"

INPUT_SOURCE = (
    "backend/ai/detection/test.jpg"
)

OUTPUT_DIR = Path(
    "backend/runs/sudarshana"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


model = YOLO(
    MODEL_PATH
)


# --------------------------------
# CLASSIFICATION
# --------------------------------

def get_category(class_name):

    if class_name == "person":
        return "Person"

    if class_name in [
        "car",
        "truck",
        "bus",
        "motorcycle",
        "bicycle"
    ]:
        return "Vehicle"

    return "Other"


# --------------------------------
# TRACK
# --------------------------------

results = model.track(
    source=INPUT_SOURCE,
    persist=True,
    conf=0.40,
    tracker="bytetrack.yaml",
    save=False
)


detections = []

previous_positions = {}


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

        class_id = int(
            box.cls[0]
        )

        class_name = model.names[
            class_id
        ]

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


        detection = {

            "track_id": track_id,

            "category": category,

            "class": class_name,

            "confidence": round(
                confidence,
                3
            ),

            "position": {

                "x": center_x,

                "y": center_y
            },

            "bounding_box": {

                "x1": x1,

                "y1": y1,

                "x2": x2,

                "y2": y2
            },

            "anomaly": {

                "score": anomaly_score,

                "level": anomaly_level
            },

            "risk": risk
        }


        detections.append(
            detection
        )


# --------------------------------
# SAVE JSON
# --------------------------------

output_json = (
    OUTPUT_DIR
    / "tracking_result.json"
)


with open(
    output_json,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        {
            "system":
                "SUDARSHANA-AI",

            "total_detections":
                len(detections),

            "detections":
                detections
        },

        file,

        indent=4
    )


# --------------------------------
# TERMINAL
# --------------------------------

print()
print(
    "======================================"
)

print(
    "          SUDARSHANA-AI"
)

print(
    "     AI DETECTION + TRACKING"
)

print(
    "======================================"
)

print(
    f"Detections : {len(detections)}"
)

print(
    f"Image      : {output_image}"
)

print(
    f"JSON       : {output_json}"
)

print(
    "======================================"
)


for item in detections:

    print(
        f"ID={item['track_id']} | "
        f"{item['category']} | "
        f"{item['class']} | "
        f"Confidence={item['confidence']} | "
        f"Anomaly={item['anomaly']['level']} | "
        f"Risk={item['risk']['score']} "
        f"({item['risk']['level']})"
    )