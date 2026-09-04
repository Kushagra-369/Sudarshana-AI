class HistoricalMatcher:

    def similarity(self, current, past):
        score = 0

        if current.get("zone") == past.get("zone"):
            score += 40

        if current.get("status") == past.get("status"):
            score += 30

        if current.get("activity_level") == past.get("activity_level"):
            score += 30

        return score

    def find_matches(self, current, cases):
        results = []

        for case in cases:
            score = self.similarity(current, case)

            results.append({
                "case_id": case.get("case_id"),
                "score": score,
                "description": case.get("description", "")
            })

        return sorted(
            results,
            key=lambda x: x["score"],
            reverse=True
        )