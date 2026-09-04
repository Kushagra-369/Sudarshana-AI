class PriorityEngine:

    def calculate(self, hypotheses):
        if not hypotheses:
            return "LOW"

        for h in hypotheses:
            if h.get("type") == "NORMAL":
                return "LOW"

        max_confidence = max(
            h.get("confidence", 0)
            for h in hypotheses
        )

        if max_confidence >= 80:
            return "HIGH"
        elif max_confidence >= 60:
            return "MEDIUM"
        else:
            return "LOW"