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
    "cam2": CURRENT_DIR / "people.mp4",
    "cam3": CURRENT_DIR / "cam3.mp4",
    "cam4": CURRENT_DIR / "cam4.mp4",
}

OUTPUT_DIR = BACKEND_DIR / "runs" / "sudarshana"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LIVE_STATUS_FILE = OUTPUT_DIR / "live_detection.json"

# ============================================================
# SETTINGS
# ============================================================

CONFIDENCE_THRESHOLD = 0.25  # Balanced threshold
NO_OBJECT_TIMEOUT = 10

# ============================================================
# YOLO CLASSES - Only Person and Vehicle
# ============================================================
# YOLO class IDs:
# 0: person
# 2: car, 3: motorcycle, 5: bus, 7: truck
ALLOWED_CLASS_IDS = {0, 2, 3, 5, 7}
ALLOWED_CLASS_NAMES = {
    0: "person",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}

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
# CATEGORY - Only Person and Vehicle
# ============================================================

def get_category(class_id, class_name):
    """Only return Person or Vehicle for allowed classes"""
    if class_id == 0:
        return "Person"
    if class_id in [2, 3, 5, 7]:
        return "Vehicle"
    return None  # Ignore animals and other objects

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
        print(f"[{camera_name}] ❌ Video not found.")
        return

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"[{camera_name}] ❌ Unable to open video.")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0

    frame_delay = 1.0 / fps
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"[{camera_name}] ✅ FPS: {fps:.2f}")
    print(f"[{camera_name}] ✅ Frames: {total_frames}")
    print(f"[{camera_name}] 🎯 Only detecting: Person (0), Vehicle (2,3,5,7)")
    print(f"[{camera_name}] 🎯 Confidence threshold: {CONFIDENCE_THRESHOLD}")

    model = YOLO(str(MODEL_PATH))
    frame_number = 0
    last_detection_time = None
    detection_count = 0
    animal_count = 0

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
            print(f"[{camera_name}] 🏁 Video ended.")
            print(f"[{camera_name}] 📊 Person/Vehicle: {detection_count}, Animals ignored: {animal_count}")
            break

        frame_number += 1

        # ========================================================
        # YOLO DETECTION - Fixed
        # ========================================================
        results = model(
            frame,
            conf=CONFIDENCE_THRESHOLD,
            imgsz=640,  # Faster processing
            verbose=False
        )

        result = results[0]
        detected_objects = []

        if result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                # Skip if not allowed class
                if class_id not in ALLOWED_CLASS_IDS:
                    animal_count += 1
                    continue

                class_name = model.names[class_id]
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

                category = get_category(class_id, class_name)
                
                if category is None:
                    animal_count += 1
                    continue

                detected_objects.append({
                    "category": category,
                    "class": class_name,
                    "confidence": round(confidence, 3),
                    "bounding_box": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2
                    }
                })
                detection_count += 1

        # Log every 50 frames
        if frame_number % 50 == 0:
            if len(detected_objects) > 0:
                print(f"[{camera_name}] Frame {frame_number}: {len(detected_objects)} Person/Vehicle detected")
                for obj in detected_objects[:3]:
                    print(f"[{camera_name}]   ✅ {obj['class']} ({obj['confidence']*100:.1f}%)")
            else:
                # Print once in a while to show it's still running
                if frame_number % 200 == 0:
                    print(f"[{camera_name}] Frame {frame_number}: No Person/Vehicle detected (Animals ignored: {animal_count})")

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
    print(f"[{camera_name}] 🛑 Detection stopped. Person/Vehicle: {detection_count}, Animals ignored: {animal_count}")

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
    print("\n" + "=" * 60)
    print("        SUDARSHANA-AI")
    print("        STARTING DETECTION")
    print("=" * 60)
    print()
    print("🎯 Only detecting: Person, Car, Truck, Bus, Motorcycle")
    print(f"🎯 Confidence threshold: {CONFIDENCE_THRESHOLD}")
    print("❌ Animals and other objects will be IGNORED")
    print("\n" + "-" * 60)
    
    for camera_name in CAMERAS:
        if camera_running.get(camera_name, False):
            print(f"[{camera_name}] ⏳ Already running")
            continue
        print(f"[{camera_name}] ▶️ Starting...")
        start_camera(camera_name)
    
    print("\n" + "=" * 60)
    print("✅ All cameras started.")
    print("=" * 60 + "\n")

def stop_all_cameras():
    print("\n" + "=" * 60)
    print("        SUDARSHANA-AI")
    print("        STOPPING DETECTION")
    print("=" * 60 + "\n")
    
    for camera_name in CAMERAS:
        if camera_running.get(camera_name, False):
            print(f"[{camera_name}] ⏹️ Stopping...")
            stop_camera(camera_name)
    
    print("\n" + "=" * 60)
    print("✅ All cameras stopped.")
    print("=" * 60 + "\n")

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

    # Check all videos before starting
    print("📹 Checking video files...")
    print("-" * 40)
    for cam_name, video_path in CAMERAS.items():
        if video_path.exists():
            print(f"✅ {cam_name}: {video_path.name} exists")
        else:
            print(f"❌ {cam_name}: {video_path.name} NOT FOUND")
    print("-" * 40 + "\n")

    start_all_cameras()

    try:
        # Keep running until interrupted
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n⚠️ Interrupted by user")
        stop_all_cameras()

    for thread in camera_threads.values():
        thread.join()

    print()
    print("=" * 60)
    print("        LIVE DETECTION COMPLETE")
    print("=" * 60)
    print()