class EventCorrelation:
    def analyze(self, events):
        if not events:
            return {
                "event_count": 0,
                "status": "NO_EVENTS"
            }

        zones = {}

        for event in events:
            zone = event.get("zone", "UNKNOWN")
            zones[zone] = zones.get(zone, 0) + 1

        busiest_zone = max(zones, key=zones.get)

        return {
            "event_count": len(events),
            "zones": zones,
            "busiest_zone": busiest_zone,
            "status": "CLUSTERED" if zones[busiest_zone] >= 3 else "DISTRIBUTED"
        }
