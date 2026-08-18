def calculate_risk_score(
    category: str,
    confidence: float,
    anomaly_score: float = 0.0
):
    """
    Demo risk scoring function for SUDARSHANA-AI.

    This is a prototype scoring mechanism.
    It should not be treated as a real-world threat assessment system.
    """

    category_weight = {
        "Person": 30,
        "Vehicle": 25,
        "Other": 10
    }

    base_score = category_weight.get(
        category,
        10
    )

    confidence_score = confidence * 40

    anomaly_component = anomaly_score * 30

    score = (
        base_score
        + confidence_score
        + anomaly_component
    )

    score = max(
        0,
        min(
            100,
            score
        )
    )

    if score >= 75:
        level = "HIGH"

    elif score >= 45:
        level = "MEDIUM"

    else:
        level = "LOW"

    return {
        "score": round(score, 2),
        "level": level
    }