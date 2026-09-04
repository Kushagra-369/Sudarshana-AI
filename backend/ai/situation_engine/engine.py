from ai.pattern_of_life.baseline import PatternBaseline
from ai.pattern_of_life.deviation import PatternDeviation

from ai.correlation.zone_correlation import ZoneCorrelation
from ai.correlation.event_correlation import EventCorrelation

from ai.historical.matcher import HistoricalMatcher
from ai.historical.case_store import CaseStore

from ai.decision_support.hypotheses import HypothesisEngine
from ai.decision_support.recommendations import RecommendationEngine
from ai.decision_support.priority import PriorityEngine

from ai.situation_engine.context import SituationContext


class SituationEngine:

    def __init__(self):
        self.context = SituationContext()

        self.baseline = PatternBaseline()
        self.deviation = PatternDeviation()

        self.zone_correlation = ZoneCorrelation()
        self.event_correlation = EventCorrelation()

        self.historical = HistoricalMatcher()
        self.case_store = CaseStore()

        self.hypotheses = HypothesisEngine()
        self.recommendations = RecommendationEngine()
        self.priority = PriorityEngine()

    def analyze(
        self,
        pattern_data=None,
        correlation_data=None,
        historical_cases=None
    ):

        pattern_analysis = None
        correlation_analysis = None
        historical_matches = []

        # -------------------------
        # Pattern-of-Life analysis
        # -------------------------
        if pattern_data:
            pattern_analysis = self.deviation.calculate(
                pattern_data.get("baseline"),
                pattern_data.get("current")
            )

        # -------------------------
        # Correlation analysis
        # -------------------------
        if correlation_data:

            correlation_analysis = {}

            # Zone correlation
            if (
                correlation_data.get("zone_a") is not None
                and correlation_data.get("zone_b") is not None
            ):
                correlation_analysis["zone_correlation"] = (
                    self.zone_correlation.compare(
                        correlation_data["zone_a"],
                        correlation_data["zone_b"]
                    )
                )

            # Event correlation
            if "events" in correlation_data:
                correlation_analysis["event_correlation"] = (
                    self.event_correlation.analyze(
                        correlation_data["events"]
                    )
                )

        # -------------------------
        # Historical matching
        # -------------------------
        if pattern_analysis:
            cases = (
                historical_cases
                if historical_cases is not None
                else self.case_store.get_cases()
            )

            historical_matches = self.historical.find_matches(
                pattern_analysis,
                cases
            )

        # -------------------------
        # Decision support
        # -------------------------
        analysis = pattern_analysis or {}

        if correlation_analysis:

            if "zone_correlation" in correlation_analysis:
                analysis.update(
                    correlation_analysis["zone_correlation"]
                )

            if "event_correlation" in correlation_analysis:
                analysis["event_status"] = (
                    correlation_analysis["event_correlation"].get("status")
                )

        hypotheses = self.hypotheses.generate(
            analysis
        )

        recommendations = self.recommendations.generate(
            hypotheses
        )

        priority = self.priority.calculate(
            hypotheses
        )

        # -------------------------
        # Update situation context
        # -------------------------
        self.context.update(
            pattern_analysis=pattern_analysis,
            correlation_analysis=correlation_analysis,
            historical_matches=historical_matches,
            hypotheses=hypotheses,
            recommendations=recommendations,
            priority=priority
        )

        return self.context.get_context()