from .baseline import PatternBaseline
from .deviation import PatternDeviation


class PatternAnalyzer:

    def __init__(self):
        self.baseline_engine = PatternBaseline()
        self.deviation_engine = PatternDeviation()

    def learn(self, events):
        return self.baseline_engine.build_from_events(events)

    def analyze(self, zone, current_activity):
        baseline_data = self.baseline_engine.get_baseline(zone)

        result = self.deviation_engine.calculate(
            baseline_data["baseline"],
            current_activity
        )

        return {
            "zone": zone,
            **result
        }