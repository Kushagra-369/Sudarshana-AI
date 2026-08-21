# ============================================================
# SUDARSHANA-AI
# VIDEO SURVEILLANCE PIPELINE
# ============================================================

from pathlib import Path
import json
import cv2
import math

from ultralytics import YOLO

from scoring.scorer import calculate_risk_score


# ============================================================
# PATHS
# ============================================================

CURRENT_DIR = Path(__file__).resolve().parent

AI_DIR = CURRENT_DIR.parent

BACKEND_DIR = AI_DIR.parent

PROJECT_ROOT = BACKEND_DIR.parent


# ============================================================
# INPUT VIDEO
# ============================================================

# First test with people.mp4
VIDEO_PATH = (
    AI_DIR
    / "detection"
    / "people.mp4"
)


# For car video, simply change the line above to:
#
# VIDEO_PATH = (
#     AI_DIR
#     / "detection"
#     / "cars.mp4"
# )


# ============================================================
# OUTPUT DIRECTORY
# ============================================================

OUTPUT_DIR = (
    BACKEND_DIR
    / "runs"
    / "sudarshana"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


OUTPUT_VIDEO = (
    OUTPUT_DIR
    / "surveillance_result.mp4"
)

OUTPUT_JSON = (
    OUTPUT_DIR
    / "surveillance_result.json"
)


# ============================================================
# MODEL
# ============================================================

MODEL_PATH = (
    PROJECT_ROOT
    / "yolov8n.pt"
)


# ============================================================
# CHECK INPUT
# ============================================================

if not VIDEO_PATH.exists():

    raise FileNotFoundError(
        f"Video not found: {VIDEO_PATH}"
    )


# ============================================================
# LOAD MODEL
# ============================================================

print()

print("=" * 60)

print(
    "        SUDARSHANA-AI"
)

print(
    "        VIDEO SURVEILLANCE"
)

print("=" * 60)

print()

print(
    "Loading YOLO model..."
)


model = YOLO(
    str(MODEL_PATH)
)


print(
    f"Input video: {VIDEO_PATH}"
)


# ============================================================
# VIDEO INPUT
# ============================================================

cap = cv2.VideoCapture(
    str(VIDEO_PATH)
)


if not cap.isOpened():

    raise RuntimeError(
        f"Unable to open video: {VIDEO_PATH}"
    )


fps = cap.get(
    cv2.CAP_PROP_FPS
)

width = int(
    cap.get(
        cv2.CAP_PROP_FRAME_WIDTH
    )
)

height = int(
    cap.get(
        cv2.CAP_PROP_FRAME_HEIGHT
    )
)

total_frames = int(
    cap.get(
        cv2.CAP_PROP_FRAME_COUNT
    )
)


if fps <= 0:

    fps = 25.0


# ============================================================
# VIDEO OUTPUT
# ============================================================

fourcc = cv2.VideoWriter_fourcc(
    *"mp4v"
)


writer = cv2.VideoWriter(

    str(OUTPUT_VIDEO),

    fourcc,

    fps,

    (width, height)
)


if not writer.isOpened():

    cap.release()

    raise RuntimeError(
        "Unable to create output video."
    )


# ============================================================
# TRACK HISTORY
# ============================================================

track_history = {}


track_results = {}


frame_number = 0


# ============================================================
# MAIN LOOP
# ============================================================

while True:

    success, frame = cap.read()


    if not success:

        break


    frame_number += 1


    # ========================================================
    # YOLO TRACKING
    # ========================================================

    results = model.track(

        frame,

        persist=True,

        tracker="bytetrack.yaml",

        conf=0.40,

        verbose=False
    )


    result = results[0]


    annotated_frame = frame.copy()


    if result.boxes is not None:

        boxes = result.boxes


        for i in range(
            len(boxes)
        ):

            # ------------------------------------------------
            # CLASS
            # ------------------------------------------------

            class_id = int(
                boxes.cls[i]
            )

            class_name = (
                model.names[
                    class_id
                ]
            )


            # ------------------------------------------------
            # CATEGORY
            # ------------------------------------------------

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


            # ------------------------------------------------
            # CONFIDENCE
            # ------------------------------------------------

            confidence = float(
                boxes.conf[i]
            )


            # ------------------------------------------------
            # TRACK ID
            # ------------------------------------------------

            if boxes.id is not None:

                track_id = int(
                    boxes.id[i]
                )

            else:

                track_id = (
                    i + 1
                )


            # ------------------------------------------------
            # BOUNDING BOX
            # ------------------------------------------------

            x1, y1, x2, y2 = map(

                int,

                boxes.xyxy[i]
            )


            # ------------------------------------------------
            # CENTROID
            # ------------------------------------------------

            center_x = (
                x1 + x2
            ) // 2

            center_y = (
                y1 + y2
            ) // 2


            current_position = (
                center_x,
                center_y
            )


            # =================================================
            # MOVEMENT ANALYSIS
            # =================================================

            previous_position = (
                track_history
                .get(track_id)
            )


            movement_distance = 0.0


            if previous_position is not None:

                dx = (
                    current_position[0]
                    - previous_position[0]
                )

                dy = (
                    current_position[1]
                    - previous_position[1]
                )

                movement_distance = math.sqrt(
                    dx * dx + dy * dy
                )


            track_history[
                track_id
            ] = current_position


            # =================================================
            # DEMONSTRATION ANOMALY
            # =================================================

            # This is a simple prototype movement
            # deviation indicator.
            #
            # It does NOT determine intent or threat.
            #
            # Higher frame-to-frame displacement
            # produces a higher anomaly score.

            if movement_distance > 80:

                anomaly_score = 1.0

                anomaly_level = "HIGH"

            elif movement_distance > 40:

                anomaly_score = 0.5

                anomaly_level = "MEDIUM"

            else:

                anomaly_score = 0.0

                anomaly_level = "LOW"


            # =================================================
            # RISK SCORE
            # =================================================

            risk = calculate_risk_score(

                category=category,

                confidence=confidence,

                anomaly_score=anomaly_score
            )


            # =================================================
            # STORE RESULT
            # =================================================

            track_results[
                track_id
            ] = {

                "track_id":
                    track_id,

                "category":
                    category,

                "class":
                    class_name,

                "confidence":
                    round(
                        confidence,
                        3
                    ),

                "position": {

                    "x":
                        center_x,

                    "y":
                        center_y
                },

                "movement": {

                    "distance":
                        round(
                            movement_distance,
                            2
                        )
                },

                "anomaly": {

                    "score":
                        anomaly_score,

                    "level":
                        anomaly_level
                },

                "risk":
                    risk,

                "last_frame":
                    frame_number
            }


            # =================================================
            # DRAW TRACKING BOX
            # =================================================

            label = (

                f"ID {track_id} | "

                f"{category} | "

                f"{confidence:.2f} | "

                f"A:{anomaly_level} | "

                f"R:{risk['level']}"
            )


            cv2.rectangle(

                annotated_frame,

                (x1, y1),

                (x2, y2),

                (0, 255, 0),

                2
            )


            cv2.putText(

                annotated_frame,

                label,

                (x1, max(
                    y1 - 10,
                    20
                )),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.55,

                (0, 255, 0),

                2
            )


            # ------------------------------------------------
            # TRACK CENTROID
            # ------------------------------------------------

            cv2.circle(

                annotated_frame,

                current_position,

                4,

                (0, 255, 255),

                -1
            )


    # ========================================================
    # FRAME INFORMATION
    # ========================================================

    cv2.putText(

        annotated_frame,

        f"Frame: {frame_number}/{total_frames}",

        (20, 30),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.7,

        (255, 255, 255),

        2
    )


    # ========================================================
    # WRITE FRAME
    # ========================================================

    writer.write(
        annotated_frame
    )


# ============================================================
# CLEANUP
# ============================================================

cap.release()

writer.release()


# ============================================================
# FINAL JSON
# ============================================================

final_results = {

    "system":
        "SUDARSHANA-AI",

    "input_video":
        str(VIDEO_PATH),

    "output_video":
        str(OUTPUT_VIDEO),

    "fps":
        fps,

    "resolution": {

        "width":
            width,

        "height":
            height
    },

    "total_frames":
        total_frames,

    "tracks_detected":
        len(track_results),

    "tracks":
        list(
            track_results.values()
        )
}


with open(

    OUTPUT_JSON,

    "w",

    encoding="utf-8"

) as file:

    json.dump(

        final_results,

        file,

        indent=4
    )


# ============================================================
# FINAL OUTPUT
# ============================================================

print()

print("=" * 60)

print(
    "        VIDEO PROCESSING COMPLETE"
)

print("=" * 60)

print()

print(
    f"Frames processed : "
    f"{total_frames}"
)

print(
    f"Tracks detected  : "
    f"{len(track_results)}"
)

print()

print(
    f"Annotated video  : "
    f"{OUTPUT_VIDEO}"
)

print(
    f"JSON result      : "
    f"{OUTPUT_JSON}"
)

print()

print("=" * 60)

print(
    "        SUDARSHANA-AI VIDEO COMPLETE"
)

print("=" * 60)