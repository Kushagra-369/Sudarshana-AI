from ultralytics import YOLO

model = YOLO("yolov8n.pt")

results = model(
    "backend/ai/detection/test.jpg",
    save=True
)

for result in results:
    for box in result.boxes:

        class_id = int(box.cls[0])
        class_name = model.names[class_id]

        if class_name == "person":
            category = "Person"

        elif class_name in [
            "car",
            "truck",
            "bus",
            "motorcycle",
            "bicycle"
        ]:
            category = "Vehicle"

        else:
            category = "Other"

        confidence = float(box.conf[0])

        print(
            f"Category: {category} | "
            f"YOLO Class: {class_name} | "
            f"Confidence: {confidence:.2f}"
        )