from ultralytics import YOLO
from pathlib import Path
import json
import cv2


MODEL_PATH = "yolov8n.pt"

IMAGE_PATH = (
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


results = model(
    IMAGE_PATH,
    conf=0.40,
    save=False
)


detections = []


for result in results:

    annotated = result.plot()

    output_image = (
        OUTPUT_DIR
        / "detection_result.jpg"
    )

    cv2.imwrite(
        str(output_image),
        annotated
    )


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


output_json = (
    OUTPUT_DIR
    / "detection_result.json"
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

            "total_objects":
                len(detections),

            "detections":
                detections
        },

        file,

        indent=4
    )


print()
print(
    "======================================"
)

print(
    "          SUDARSHANA-AI"
)

print(
    "          OBJECT DETECTION"
)

print(
    "======================================"
)

print(
    f"Objects : {len(detections)}"
)

for detection in detections:

    print(
        f"{detection['category']} | "
        f"{detection['class']} | "
        f"{detection['confidence']}"
    )

print(
    f"\nImage : {output_image}"
)

print(
    f"JSON  : {output_json}"
)

print(
    "======================================"
)