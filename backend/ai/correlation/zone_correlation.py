class ZoneCorrelation:
    def compare(self, zone_a, zone_b):
        activity_a = zone_a.get("activity", 0)
        activity_b = zone_b.get("activity", 0)

        if activity_a == 0 and activity_b == 0:
            return {"status": "NO_ACTIVITY"}

        ratio = activity_b / max(activity_a, 1)

        if ratio >= 2:
            status = "SIGNIFICANT_SHIFT"
        elif ratio >= 1.3:
            status = "MODERATE_SHIFT"
        else:
            status = "NORMAL"

        return {
            "zone_a": zone_a.get("zone"),
            "zone_b": zone_b.get("zone"),
            "activity_a": activity_a,
            "activity_b": activity_b,
            "ratio": round(ratio, 2),
            "status": status
        }
