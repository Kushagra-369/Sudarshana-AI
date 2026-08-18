from ultralytics import YOLO
from pathlib import Path
import json
import cv2


# ============================================================
# SUDARSHANA-AI | OBJECT DETECTION
# ============================================================

# Current file:
# backend/ai/detection/detect.py

CURRENT_DIR = Path(__file__).resolve().parent

IMAGE_PATH = CURRENT_DIR / "test.jpg"

PROJECT_DIR = CURRENT_DIR.parent.parent.parent

OUTPUT_DIR = PROJECT_DIR / "backend" / "runs" / "sudarshana"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

MODEL_PATH = PROJECT_DIR / "yolov8n.pt"


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
# CHECK INPUT
# ============================================================

if not IMAGE_PATH.exists():

    print()
    print("ERROR: Input image not found!")
    print()
    print(
        f"Expected image location:"
    )
    print(
        IMAGE_PATH
    )
    print()

    raise FileNotFoundError(
        f"Please put test.jpg inside: {CURRENT_DIR}"
    )


# ============================================================
# LOAD MODEL
# ============================================================

print()
print("Loading YOLO model...")

model = YOLO(
    str(MODEL_PATH)
)


# ============================================================
# DETECTION
# ============================================================

print(
    f"Running detection on: {IMAGE_PATH}"
)

results = model(
    str(IMAGE_PATH),
    conf=0.40,
    save=False
)


detections = []


# ============================================================
# PROCESS RESULTS
# ============================================================

for result in results:

    annotated_image = result.plot()

    output_image = (
        OUTPUT_DIR
        / "detection_result.jpg"
    )

    cv2.imwrite(
        str(output_image),
        annotated_image
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


        x1, y1, x2, y2 = map(
            int,
            box.xyxy[0].tolist()
        )


        category = get_category(
            class_name
        )


        detections.append({

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
            }
        })


# ============================================================
# SAVE JSON
# ============================================================

output_json = (
    OUTPUT_DIR
    / "detection_result.json"
)


result_data = {

    "system":
        "SUDARSHANA-AI",

    "model":
        "YOLOv8n",

    "input":
        str(IMAGE_PATH),

    "total_objects":
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
        result_data,
        file,
        indent=4
    )


# ============================================================
# TERMINAL OUTPUT
# ============================================================

print()
print("=" * 60)

print(
    "        SUDARSHANA-AI"
)

print(
    "        OBJECT DETECTION"
)

print("=" * 60)

print(
    f"Objects detected : {len(detections)}"
)

print(
    f"Input image      : {IMAGE_PATH}"
)

print(
    f"Annotated image  : {output_image}"
)

print(
    f"JSON result      : {output_json}"
)

print("=" * 60)


for detection in detections:

    print(
        f"{detection['category']} | "
        f"{detection['class']} | "
        f"Confidence: "
        f"{detection['confidence']}"
    )

print()