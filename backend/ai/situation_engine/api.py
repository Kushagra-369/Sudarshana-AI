# backend/ai/situation_engine/api.py
import sys
import json
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BACKEND_DIR))

try:
    from ai.situation_engine.engine import SituationEngine
    from ai.pattern_of_life.baseline import PatternBaseline
    from ai.correlation.event_correlation import EventCorrelation
    from ai.historical.case_store import CaseStore
    from ai.decision_support.hypotheses import HypothesisEngine
except ImportError as e:
    print(json.dumps({
        "error": f"Import error: {str(e)}. Please install required dependencies.",
        "response": "⚠️ AI engine modules not found. Please check the installation."
    }))
    sys.exit(1)

def generate_response(query: str, context: dict) -> str:
    """Generate human-readable response from situation context"""
    priority = context.get("priority", "LOW")
    pattern = context.get("pattern_analysis", {})
    correlation = context.get("correlation_analysis", {})
    hypotheses = context.get("hypotheses", [])
    recommendations = context.get("recommendations", [])
    historical = context.get("historical_matches", [])[:3]

    response_parts = []

    # Priority
    if priority == "HIGH":
        response_parts.append("🔴 **High Priority Situation Detected**")
    elif priority == "MEDIUM":
        response_parts.append("🟡 **Medium Priority Situation**")
    else:
        response_parts.append("🟢 **Normal Situation**")

    # Pattern analysis
    if pattern and pattern.get("status"):
        status = pattern.get("status")
        if status == "MAJOR_DEVIATION":
            response_parts.append(f"\n📊 **Major Pattern Deviation**")
            response_parts.append(f"• Baseline: {pattern.get('baseline', 0)}")
            response_parts.append(f"• Current: {pattern.get('current', 0)}")
            response_parts.append(f"• Deviation: +{pattern.get('deviation', 0)} ({pattern.get('percentage', 0):.1f}%)")
        elif status == "MODERATE_DEVIATION":
            response_parts.append(f"\n📊 **Moderate Pattern Deviation**")
            response_parts.append(f"• Change: {pattern.get('percentage', 0):.1f}% above baseline")
        elif status == "NORMAL":
            response_parts.append(f"\n📊 **Normal Pattern**")
            response_parts.append(f"• Activity within expected range")

    # Correlation
    if correlation:
        zone_corr = correlation.get("zone_correlation", {})
        if zone_corr and zone_corr.get("status") == "SIGNIFICANT_SHIFT":
            response_parts.append(f"\n🔄 **Significant Zone Shift**")
            response_parts.append(f"• {zone_corr.get('zone_a', 'A')} → {zone_corr.get('zone_b', 'B')}")
            response_parts.append(f"• Activity ratio: {zone_corr.get('ratio', 1)}x")
        elif zone_corr and zone_corr.get("status") == "MODERATE_SHIFT":
            response_parts.append(f"\n🔄 **Moderate Zone Shift**")
            response_parts.append(f"• Activity shifting between zones")
        
        event_corr = correlation.get("event_correlation", {})
        if event_corr and event_corr.get("status") == "CLUSTERED":
            response_parts.append(f"\n📌 **Event Clustering**")
            response_parts.append(f"• {event_corr.get('event_count', 0)} events in {event_corr.get('busiest_zone', 'unknown')}")
        elif event_corr and event_corr.get("status") == "DISTRIBUTED":
            response_parts.append(f"\n📌 **Events Distributed**")
            response_parts.append(f"• Activity spread across multiple zones")

    # Hypotheses
    if hypotheses:
        response_parts.append("\n🔍 **Hypotheses**")
        for h in hypotheses[:3]:
            response_parts.append(f"• {h.get('message', '')}")
            if h.get("confidence"):
                response_parts.append(f"  (Confidence: {h.get('confidence'):.0f}%)")

    # Recommendations
    if recommendations:
        response_parts.append("\n💡 **Recommendations**")
        for r in recommendations[:3]:
            response_parts.append(f"• {r}")

    # Historical matches
    if historical:
        response_parts.append("\n📚 **Historical Matches**")
        for match in historical[:2]:
            response_parts.append(f"• {match.get('case_id', 'Unknown')} (Similarity: {match.get('score', 0)}%)")

    # Human review note
    response_parts.append("\n---\n*⚠️ AI recommendations require human review*")

    # Add query context
    if query:
        response_parts.insert(0, f"**Query:** {query}\n")

    return "\n".join(response_parts)

def main():
    try:
        input_data = json.loads(sys.argv[1])
        query = input_data.get("query", "")
        zone = input_data.get("zone")
        pattern_data = input_data.get("patternData")
        correlation_data = input_data.get("correlationData")
        historical_cases = input_data.get("historicalCases", [])

        # Initialize engine
        engine = SituationEngine()
        
        # Build pattern data if not provided
        if not pattern_data and zone:
            pattern_data = {
                "baseline": 10,
                "current": 15,
                "zone": zone
            }

        # Build correlation data if not provided
        if not correlation_data:
            correlation_data = {
                "zone_a": {"zone": "A", "activity": 12},
                "zone_b": {"zone": "B", "activity": 8},
                "events": [
                    {"zone": "A", "activity": 5},
                    {"zone": "B", "activity": 3},
                    {"zone": "A", "activity": 4},
                ]
            }

        # Analyze
        context = engine.analyze(
            pattern_data=pattern_data,
            correlation_data=correlation_data,
            historical_cases=historical_cases if historical_cases else None
        )

        # Generate response
        response_text = generate_response(query, context)

        result = {
            "response": response_text,
            "context": context,
            "sources": ["Pattern Analysis", "Correlation Engine", "Historical Database"]
        }

        print(json.dumps(result))

    except json.JSONDecodeError:
        print(json.dumps({
            "error": "Invalid JSON input",
            "response": "⚠️ Invalid request format. Please try again."
        }))
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "response": f"⚠️ I encountered an error while analyzing the situation: {str(e)}"
        }))

if __name__ == "__main__":
    main()