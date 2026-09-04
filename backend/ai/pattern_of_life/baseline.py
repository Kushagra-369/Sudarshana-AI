from collections import defaultdict
from statistics import mean


class PatternBaseline:
    """
    Learns normal activity patterns for different zones.
    """

    def __init__(self):
        self.zone_data = defaultdict(list)

    def add_observation(self, zone, activity_count):
        self.zone_data[zone].append(activity_count)

    def get_baseline(self, zone):
        values = self.zone_data.get(zone, [])

        if not values:
            return {
                "zone": zone,
                "baseline": 0,
                "samples": 0
            }

        return {
            "zone": zone,
            "baseline": round(mean(values), 2),
            "samples": len(values)
        }

    def build_from_events(self, events):
        """
        events example:
        [
            {"zone": "A", "activity": 12},
            {"zone": "A", "activity": 15},
            {"zone": "B", "activity": 7}
        ]
        """

        for event in events:
            zone = event.get("zone")
            activity = event.get("activity", 0)

            if zone:
                self.add_observation(zone, activity)

        return {
            zone: self.get_baseline(zone)
            for zone in self.zone_data
        }