class RecommendationEngine:

    def generate(self, hypotheses):
        recommendations = []

        for h in hypotheses:
            if h["type"] == "PATTERN_DEVIATION":
                recommendations.append(
                    "Increase monitoring of the affected sector."
                )

            elif h["type"] == "POSSIBLE_REPOSITIONING":
                recommendations.append(
                    "Review activity across neighboring sectors."
                )

            elif h["type"] == "EVENT_CLUSTERING":
                recommendations.append(
                    "Increase monitoring of the affected zone."
                )

            elif h["type"] == "NORMAL":
                recommendations.append(
                    "Continue routine monitoring."
                )

        return recommendations