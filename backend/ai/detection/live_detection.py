from pathlib import Path
from datetime import datetime
import json
import threading
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

OUTPUT_DIR = (
    BACKEND_DIR / "runs" / "sudarshana"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

LIVE_STATUS_FILE = (
    OUTPUT_DIR / "live_detection.json"
)


# ============================================================
# SETTINGS
# ============================================================

CONFIDENCE_THRESHOLD = 0.40
NO_OBJECT_TIMEOUT = 10


# ============================================================
# SHARED CAMERA STATE
# ============================================================

camera_state = {}

state_lock = threading.Lock()


for camera_name, video_path in CAMERAS.items():

    camera_state[camera_name] = {
        "camera": camera_name,
        "source": str(video_path),
        "object_present": False,
        "last_detection": None,
        "seconds_since_detection": None,
        "visible": False,
        "objects": []
    }


# ============================================================
# CATEGORY
# ============================================================

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

        with open(
            LIVE_STATUS_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                data,
                file,
                indent=4
            )


# ============================================================
# PROCESS ONE CAMERA
# ============================================================

def process_camera(camera_name, video_path):

    print(
        f"[{camera_name}] Opening: {video_path}"
    )

    if not video_path.exists():

        print(
            f"[{camera_name}] Video not found."
        )

        return


    cap = cv2.VideoCapture(
        str(video_path)
    )


    if not cap.isOpened():

        print(
            f"[{camera_name}] Unable to open video."
        )

        return


    model = YOLO(
        str(MODEL_PATH)
    )


    frame_number = 0


    while True:

        success, frame = cap.read()

        if not success:

            print(
                f"[{camera_name}] Video ended."
            )

            break


        frame_number += 1


        # ----------------------------------------------------
        # DETECTION
        # ----------------------------------------------------

        results = model(
            frame,
            conf=CONFIDENCE_THRESHOLD,
            verbose=False
        )

        result = results[0]

        detected_objects = []


        if result.boxes is not None:

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


                detected_objects.append({

                    "category":
                        get_category(
                            class_name
                        ),

                    "class":
                        class_name,

                    "confidence":
                        round(
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


        current_time = datetime.now()


        # ====================================================
        # OBJECT DETECTED
        # ====================================================

        if detected_objects:

            with state_lock:

                camera_state[
                    camera_name
                ]["object_present"] = True

                camera_state[
                    camera_name
                ]["last_detection"] = (
                    current_time.isoformat()
                )

                camera_state[
                    camera_name
                ]["seconds_since_detection"] = 0

                camera_state[
                    camera_name
                ]["visible"] = True

                camera_state[
                    camera_name
                ]["objects"] = detected_objects


        # ====================================================
        # NO OBJECT
        # ====================================================

        else:

            with state_lock:

                last_detection = (
                    camera_state[
                        camera_name
                    ]["last_detection"]
                )


            if last_detection:

                last_time = datetime.fromisoformat(
                    last_detection
                )

                seconds_since = (
                    current_time - last_time
                ).total_seconds()

            else:

                seconds_since = None


            with state_lock:

                camera_state[
                    camera_name
                ]["seconds_since_detection"] = (
                    round(
                        seconds_since,
                        2
                    )
                    if seconds_since is not None
                    else None
                )


                if (
                    seconds_since is not None
                    and
                    seconds_since >= NO_OBJECT_TIMEOUT
                ):

                    camera_state[
                        camera_name
                    ]["object_present"] = False

                    camera_state[
                        camera_name
                    ]["visible"] = False

                    camera_state[
                        camera_name
                    ]["objects"] = []


        # ----------------------------------------------------
        # SAVE STATE
        # ----------------------------------------------------

        save_live_state()


        # ----------------------------------------------------
        # TERMINAL STATUS
        # ----------------------------------------------------

        if frame_number % 30 == 0:

            with state_lock:

                state = camera_state[
                    camera_name
                ].copy()

            print(
                f"[{camera_name}] "
                f"Frame={frame_number} | "
                f"Objects={len(state['objects'])} | "
                f"Visible={state['visible']}"
            )


    cap.release()


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

        raise FileNotFoundError(
            f"YOLO model not found: {MODEL_PATH}"
        )


    # --------------------------------------------------------
    # START BOTH CAMERAS
    # --------------------------------------------------------

    threads = []


    for camera_name, video_path in CAMERAS.items():

        thread = threading.Thread(

            target=process_camera,

            args=(
                camera_name,
                video_path
            ),

            daemon=True
        )

        thread.start()

        threads.append(thread)


    # --------------------------------------------------------
    # WAIT FOR BOTH
    # --------------------------------------------------------

    for thread in threads:

        thread.join()


    save_live_state()


    print()
    print("=" * 60)
    print("        LIVE DETECTION COMPLETE")
    print("=" * 60)
    print()
    print(
        f"Live status: {LIVE_STATUS_FILE}"
    )