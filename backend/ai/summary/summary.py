import json
from pathlib import Path


INPUT_FILE = Path(
    "backend/runs/sudarshana/"
    "tracking_result.json"
)

OUTPUT_FILE = Path(
    "backend/runs/sudarshana/"
    "situation_summary.json"
)


with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)


detections = data.get(
    "detections",
    []
)


total = len(detections)

persons = sum(
    1
    for d in detections
    if d["category"] == "Person"
)

vehicles = sum(
    1
    for d in detections
    if d["category"] == "Vehicle"
)

high_risk = [
    d
    for d in detections
    if d["risk"]["level"] == "HIGH"
]

medium_risk = [
    d
    for d in detections
    if d["risk"]["level"] == "MEDIUM"
]


# --------------------------------
# OVERALL STATUS
# --------------------------------

if len(high_risk) > 0:

    status = "HIGH"

elif len(medium_risk) > 0:

    status = "MEDIUM"

else:

    status = "LOW"


# --------------------------------
# SUMMARY
# --------------------------------

summary_text = (
    f"SUDARSHANA-AI detected "
    f"{total} objects. "
    f"{persons} person(s) and "
    f"{vehicles} vehicle(s) were identified. "
    f"Overall system risk level is "
    f"{status}."
)


summary = {

    "system":
        "SUDARSHANA-AI",

    "overall_status":
        status,

    "statistics": {

        "total_objects":
            total,

        "persons":
            persons,

        "vehicles":
            vehicles,

        "high_risk_events":
            len(high_risk),

        "medium_risk_events":
            len(medium_risk)
    },

    "summary":
        summary_text,

    "high_risk_events":
        high_risk
}


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        summary,
        file,
        indent=4
    )


print()
print(
    "======================================"
)

print(
    "       SITUATION SUMMARY"
)

print(
    "======================================"
)

print(summary_text)

print(
    f"Status : {status}"
)

print(
    f"Output : {OUTPUT_FILE}"
)

print(
    "======================================"
)