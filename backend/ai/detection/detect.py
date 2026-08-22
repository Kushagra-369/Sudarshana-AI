from ultralytics import YOLO
from pathlib import Path


# ============================================================
# SUDARSHANA-AI | OBJECT DETECTION ENGINE
# ============================================================

# Current file:
# backend/ai/detection/detect.py

CURRENT_DIR = Path(__file__).resolve().parent

PROJECT_DIR = (
    CURRENT_DIR.parent.parent.parent
)

MODEL_PATH = PROJECT_DIR / "yolov8n.pt"


# ============================================================
# LOAD MODEL ONCE
# ============================================================

print("Loading YOLO model...")

model = YOLO(
    str(MODEL_PATH)
)

print("YOLO model loaded.")


# ============================================================
# CATEGORY
# ============================================================

def get_category(class_name: str) -> str:

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


# ============================================================
# DETECT ONE FRAME
# ============================================================

def detect_frame(frame):

    """
    Run YOLO detection on a single OpenCV frame.

    Parameters:
        frame:
            OpenCV BGR image / numpy array

    Returns:
        List of detected objects
    """

    results = model(
        frame,
        conf=0.20,
        imgsz=1280,
        verbose=False
    )

    result = results[0]

    detections = []


    # ========================================================
    # NO DETECTIONS
    # ========================================================

    if result.boxes is None:

        return detections


    # ========================================================
    # PROCESS DETECTIONS
    # ========================================================

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
            float,
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


    return detections