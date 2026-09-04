class SituationContext:

    def __init__(self):
        self.pattern_analysis = None
        self.correlation_analysis = None
        self.historical_matches = []
        self.hypotheses = []
        self.recommendations = []
        self.priority = "LOW"

    def update(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def get_context(self):
        return {
            "pattern_analysis": self.pattern_analysis,
            "correlation_analysis": self.correlation_analysis,
            "historical_matches": self.historical_matches,
            "hypotheses": self.hypotheses,
            "recommendations": self.recommendations,
            "priority": self.priority
        }