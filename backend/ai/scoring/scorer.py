# ============================================================
# SUDARSHANA-AI
# RISK / THREAT SCORING MODULE
# ============================================================


def calculate_risk_score(
    category,
    confidence,
    anomaly_score=0.0
):
    """
    Calculates a prototype risk score.

    Inputs:
        category       -> Person / Vehicle / Other
        confidence     -> YOLO confidence (0.0 - 1.0)
        anomaly_score  -> movement anomaly (0.0 - 1.0)

    Returns:
        {
            "score": float,
            "level": "LOW" / "MEDIUM" / "HIGH"
        }

    NOTE:
    This is a hackathon prototype scoring mechanism.
    It is NOT a real-world threat assessment algorithm.
    """


    # ========================================================
    # CATEGORY WEIGHT
    # ========================================================

    category_weights = {

        "Person":
            30,

        "Vehicle":
            25,

        "Other":
            10
    }


    base_score = category_weights.get(
        category,
        10
    )


    # ========================================================
    # CONFIDENCE COMPONENT
    # ========================================================

    confidence = max(
        0.0,
        min(
            1.0,
            confidence
        )
    )


    confidence_score = (
        confidence * 40
    )


    # ========================================================
    # ANOMALY COMPONENT
    # ========================================================

    anomaly_score = max(
        0.0,
        min(
            1.0,
            anomaly_score
        )
    )


    anomaly_component = (
        anomaly_score * 30
    )


    # ========================================================
    # FINAL SCORE
    # ========================================================

    score = (
        base_score
        + confidence_score
        + anomaly_component
    )


    score = max(
        0.0,
        min(
            100.0,
            score
        )
    )


    # ========================================================
    # RISK LEVEL
    # ========================================================

    if score >= 75:

        level = "HIGH"

    elif score >= 45:

        level = "MEDIUM"

    else:

        level = "LOW"


    # ========================================================
    # RESULT
    # ========================================================

    return {

        "score":
            round(
                score,
                2
            ),

        "level":
            level
    }


# ============================================================
# QUICK TEST
# ============================================================

if __name__ == "__main__":

    result = calculate_risk_score(

        category="Person",

        confidence=0.84,

        anomaly_score=0.0
    )


    print(
        "Risk Score Test:"
    )

    print(
        result
    )