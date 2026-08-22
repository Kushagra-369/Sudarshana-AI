# ai/detection/live_detection.py
from pathlib import Path
from datetime import datetime
import json
import threading
import time
import cv2
from ultralytics import YOLO

# ============================================================
# PATHS
# ============================================================

CURRENT_DIR = Path(__file__).resolve().parent
AI_DIR = CURRENT_DIR.parent
BACKEND_DIR = AI_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

MODEL_PATH = PROJECT_ROOT / "yolov8n.pt"

CAMERAS = {
    "cam1": CURRENT_DIR / "cars.mp4",
    "cam2": CURRENT_DIR / "people.mp4"
}

OUTPUT_DIR = BACKEND_DIR / "runs" / "sudarshana"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LIVE_STATUS_FILE = OUTPUT_DIR / "live_detection.json"

# ============================================================
# SETTINGS
# ============================================================

CONFIDENCE_THRESHOLD = 0.20
NO_OBJECT_TIMEOUT = 10

# ============================================================
# SHARED STATE
# ============================================================

camera_state = {}
state_lock = threading.Lock()
camera_threads = {}
camera_running = {}

for camera_name, video_path in CAMERAS.items():
    camera_state[camera_name] = {
        "camera": camera_name,
        "source": str(video_path),
        "object_present": False,
        "last_detection": None,
        "seconds_since_detection": None,
        "visible": False,
        "objects": [],
        "frame": 0,
        "fps": 0,
        "video_time": 0,
        "status": "IDLE"
    }
    camera_running[camera_name] = False

# ============================================================
# CATEGORY
# ============================================================

def get_category(class_name):
    if class_name == "person":
        return "Person"
    if class_name in ["car", "truck", "bus", "motorcycle", "bicycle"]:
        return "Vehicle"
    return "Other"

# ============================================================
# SAVE STATE
# ============================================================

def save_live_state():
    with state_lock:
        data = {
            "system": "SUDARSHANA-AI",
            "updated_at": datetime.now().isoformat(),
            "no_object_timeout": NO_OBJECT_TIMEOUT,
            "cameras": camera_state
        }
        with open(LIVE_STATUS_FILE, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)

# ============================================================
# PROCESS CAMERA
# ============================================================

def process_camera(camera_name, video_path):
    print(f"[{camera_name}] Opening: {video_path}")

    if not video_path.exists():
        print(f"[{camera_name}] Video not found.")
        return

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"[{camera_name}] Unable to open video.")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0

    frame_delay = 1.0 / fps
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"[{camera_name}] FPS: {fps}")
    print(f"[{camera_name}] Frames: {total_frames}")

    model = YOLO(str(MODEL_PATH))
    frame_number = 0
    last_detection_time = None

    camera_running[camera_name] = True

    with state_lock:
        camera_state[camera_name]["visible"] = True
        camera_state[camera_name]["status"] = "LIVE"
        camera_state[camera_name]["fps"] = fps

    save_live_state()

    while camera_running[camera_name]:
        loop_start = time.time()
        success, frame = cap.read()

        if not success:
            print(f"[{camera_name}] Video ended.")
            break

        frame_number += 1

        # YOLO detection
        results = model(frame, conf=CONFIDENCE_THRESHOLD, imgsz=1280, verbose=False)
        result = results[0]
        detected_objects = []

        if result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                class_id = int(box.cls[0])
                class_name = model.names[class_id]
                confidence = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                detected_objects.append({
                    "category": get_category(class_name),
                    "class": class_name,
                    "confidence": round(confidence, 3),
                    "bounding_box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
                })

        now = datetime.now()

        if detected_objects:
            last_detection_time = time.time()

        if last_detection_time:
            seconds_since_detection = round(time.time() - last_detection_time, 2)
        else:
            seconds_since_detection = None

        object_present = len(detected_objects) > 0

        with state_lock:
            camera_state[camera_name].update({
                "object_present": object_present,
                "last_detection": now.isoformat() if object_present else camera_state[camera_name]["last_detection"],
                "seconds_since_detection": seconds_since_detection,
                "visible": True,
                "objects": detected_objects,
                "frame": frame_number,
                "fps": fps,
                "video_time": round(frame_number / fps, 2),
                "status": "LIVE"
            })

        save_live_state()

        processing_time = time.time() - loop_start
        remaining_time = frame_delay - processing_time
        if remaining_time > 0:
            time.sleep(remaining_time)

    cap.release()
    camera_running[camera_name] = False

    with state_lock:
        camera_state[camera_name]["visible"] = False
        camera_state[camera_name]["status"] = "ENDED"
        camera_state[camera_name]["objects"] = []
        camera_state[camera_name]["object_present"] = False

    save_live_state()
    print(f"[{camera_name}] Detection stopped.")

# ============================================================
# CONTROL FUNCTIONS
# ============================================================

def start_camera(camera_name):
    if camera_name not in CAMERAS:
        return False
    if camera_running.get(camera_name):
        return False

    video_path = CAMERAS[camera_name]
    thread = threading.Thread(
        target=process_camera,
        args=(camera_name, video_path),
        daemon=True
    )
    camera_threads[camera_name] = thread
    thread.start()
    return True

def stop_camera(camera_name):
    if camera_name in camera_running:
        camera_running[camera_name] = False
        return True
    return False

def start_all_cameras():
    print("Starting all cameras...")
    for camera_name in CAMERAS:
        if camera_running.get(camera_name, False):
            print(f"[{camera_name}] Already running")
            continue
        print(f"[{camera_name}] Starting...")
        start_camera(camera_name)
    print("All cameras started.")

def stop_all_cameras():
    print("Stopping all cameras...")
    for camera_name in CAMERAS:
        if camera_running.get(camera_name, False):
            print(f"[{camera_name}] Stopping...")
            stop_camera(camera_name)
    print("All cameras stopped.")

# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print()
    print("=" * 60)
    print("        SUDARSHANA-AI")
    print("        LIVE DETECTION")
    print("=" * 60)
    print()

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"YOLO model not found: {MODEL_PATH}")

    start_all_cameras()

    for thread in camera_threads.values():
        thread.join()

    print()
    print("=" * 60)
    print("        LIVE DETECTION COMPLETE")
    print("=" * 60)
    print()