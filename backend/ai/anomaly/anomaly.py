# ============================================================
# SUDARSHANA-AI
# ANOMALY DETECTION MODULE
# ============================================================

import math


def calculate_movement_anomaly(
    previous_position,
    current_position,
    frame_gap=1
):
    """
    Calculates a simple movement anomaly score.

    Score:
        0.0 = normal / no movement information
        1.0 = high movement anomaly

    This is a prototype/demo metric.
    """

    # First observation of an object
    if previous_position is None:
        return 0.0

    # Invalid current position
    if current_position is None:
        return 0.0

    x1, y1 = previous_position
    x2, y2 = current_position

    # Calculate movement distance
    distance = math.sqrt(
        (x2 - x1) ** 2
        + (y2 - y1) ** 2
    )

    if frame_gap <= 0:
        frame_gap = 1

    movement_per_frame = (
        distance / frame_gap
    )

    # Normalize movement
    anomaly_score = min(
        movement_per_frame / 100.0,
        1.0
    )

    return round(
        anomaly_score,
        3
    )


def classify_anomaly(score):
    """
    Converts numerical anomaly score
    into a human-readable level.
    """

    if score >= 0.75:

        return "HIGH"

    elif score >= 0.40:

        return "MEDIUM"

    return "LOW"