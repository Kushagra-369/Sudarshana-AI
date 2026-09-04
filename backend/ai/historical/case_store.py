import json
from pathlib import Path


class CaseStore:

    def __init__(self, file_path="ai/historical/cases.json"):
        self.file_path = Path(file_path)
        self.cases = []

        self._load()

    def _load(self):
        if not self.file_path.exists():
            self.cases = []
            return

        try:
            with open(self.file_path, "r") as f:
                self.cases = json.load(f)
        except (json.JSONDecodeError, OSError):
            self.cases = []

    def _save(self):
        self.file_path.parent.mkdir(parents=True, exist_ok=True)

        with open(self.file_path, "w") as f:
            json.dump(self.cases, f, indent=4)

    def add_case(self, case):
        self.cases.append(case)
        self._save()

    def get_cases(self):
        return self.cases

    def count(self):
        return len(self.cases)