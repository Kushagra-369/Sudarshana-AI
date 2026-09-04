class PatternDeviation:
    """
    Compares current activity against learned baseline.
    """

    def calculate(self, baseline, current):
        if baseline == 0:
            return {
                "deviation": 0,
                "percentage": 0,
                "status": "NO_BASELINE"
            }

        difference = current - baseline
        percentage = (difference / baseline) * 100

        if abs(percentage) >= 50:
            status = "MAJOR_DEVIATION"
        elif abs(percentage) >= 25:
            status = "MODERATE_DEVIATION"
        else:
            status = "NORMAL"

        return {
            "baseline": round(baseline, 2),
            "current": current,
            "deviation": round(difference, 2),
            "percentage": round(percentage, 2),
            "status": status
        }