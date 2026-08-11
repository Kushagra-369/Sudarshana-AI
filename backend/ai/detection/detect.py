from ultralytics import YOLO

model = YOLO("yolov8n.pt")

results = model(
    "backend/ai/detection/test.jpg",
    save=True
)

print("Detection completed!")