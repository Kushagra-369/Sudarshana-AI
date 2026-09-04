class HypothesisEngine:

    def generate(self, analysis):
        hypotheses = []

        if analysis.get("status") == "MAJOR_DEVIATION":
            hypotheses.append({
                "type": "PATTERN_DEVIATION",
                "message": "Activity significantly differs from the established baseline.",
                "confidence": min(
                    95,
                    50 + abs(analysis.get("percentage", 0)) / 2
                )
            })

        if analysis.get("status") == "SIGNIFICANT_SHIFT":
            hypotheses.append({
                "type": "POSSIBLE_REPOSITIONING",
                "message": "Activity distribution suggests a possible shift between zones.",
                "confidence": 65
            })

        if analysis.get("event_status") == "CLUSTERED":
            hypotheses.append({
                "type": "EVENT_CLUSTERING",
                "message": "Multiple events are concentrated in the same zone.",
                "confidence": 70
            })

        if not hypotheses:
            hypotheses.append({
                "type": "NORMAL",
                "message": "No significant abnormal pattern identified.",
                "confidence": 90
            })

        return hypotheses