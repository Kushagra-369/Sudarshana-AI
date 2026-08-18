from ultralytics import YOLO
import json
from pathlib import Path
from datetime import datetime


# =========================
# CONFIG
# =========================

MODEL_PATH = "yolov8n.pt"
IMAGE_PATH = "backend/ai/detection/test.jpg"

OUTPUT_DIR = Path("runs/sudarshana")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

model = YOLO(MODEL_PATH)


# =========================
# RUN DETECTION
# =========================

results = model(
    IMAGE_PATH,
    conf=0.40,
    save=False
)


detections = []

person_count = 0
vehicle_count = 0
other_count = 0


# =========================
# PROCESS RESULTS
# =========================

for result in results:

    # Save annotated image
    annotated_image = result.plot()

    output_image = OUTPUT_DIR / "annotated.jpg"

    import cv2
    cv2.imwrite(str(output_image), annotated_image)


    for box in result.boxes:

        class_id = int(box.cls[0])
        class_name = model.names[class_id]

        confidence = float(box.conf[0])

        # Bounding box
        x1, y1, x2, y2 = map(
            int,
            box.xyxy[0].tolist()
        )


        # =========================
        # CATEGORY CLASSIFICATION
        # =========================

        if class_name == "person":

            category = "Person"
            person_count += 1

        elif class_name in [
            "car",
            "truck",
            "bus",
            "motorcycle",
            "bicycle"
        ]:

            category = "Vehicle"
            vehicle_count += 1

        else:

            category = "Other"
            other_count += 1


        # =========================
        # THREAT SCORE
        # =========================

        threat_score = calculate_threat_score(
            category,
            confidence
        )


        # =========================
        # DETECTION OBJECT
        # =========================

        detection = {

            "category": category,

            "class": class_name,

            "confidence": round(
                confidence,
                3
            ),

            "bounding_box": {

                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2
            },

            "threat_score": threat_score,

            "timestamp":
                datetime.utcnow().isoformat()
        }


        detections.append(detection)


# =========================
# SUMMARY
# =========================

summary = {

    "total_objects":
        len(detections),

    "persons":
        person_count,

    "vehicles":
        vehicle_count,

    "other":
        other_count,

    "detections":
        detections,

    "annotated_image":
        str(output_image)
}


# =========================
# SAVE JSON
# =========================

json_path = OUTPUT_DIR / "detections.json"

with open(
    json_path,
    "w"
) as f:

    json.dump(
        summary,
        f,
        indent=4
    )


# =========================
# TERMINAL OUTPUT
# =========================

print("\n================================")
print("       SUDARSHANA-AI")
print("================================")

print(
    f"Total Objects : {len(detections)}"
)

print(
    f"Persons       : {person_count}"
)

print(
    f"Vehicles      : {vehicle_count}"
)

print(
    f"Other         : {other_count}"
)

print(
    f"\nAnnotated Image: {output_image}"
)

print(
    f"Detection JSON : {json_path}"
)

print("================================\n")


for detection in detections:

    print(
        f"{detection['category']} | "
        f"{detection['class']} | "
        f"Confidence: "
        f"{detection['confidence']} | "
        f"Threat: "
        f"{detection['threat_score']}"
    )


# =========================
# THREAT SCORE FUNCTION
# =========================

def calculate_threat_score(
    category,
    confidence
):

    score = 0


    # Object importance
    if category == "Person":

        score += 40

    elif category == "Vehicle":

        score += 30

    else:

        score += 10


    # Detection confidence
    score += int(
        confidence * 40
    )


    return min(
        score,
        100
    )