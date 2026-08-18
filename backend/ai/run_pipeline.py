import subprocess
import sys


def run_file(path):

    print()
    print(
        f"========== RUNNING {path} =========="
    )

    result = subprocess.run(
        [
            sys.executable,
            path
        ]
    )

    if result.returncode != 0:

        print(
            f"\nERROR while running {path}"
        )

        sys.exit(
            result.returncode
        )


# --------------------------------
# 1. DETECTION
# --------------------------------

run_file(
    "backend/ai/detection/detect.py"
)


# --------------------------------
# 2. TRACKING
# --------------------------------

run_file(
    "backend/ai/tracking/tracker.py"
)


# --------------------------------
# 3. SUMMARY
# --------------------------------

run_file(
    "backend/ai/summary/summary.py"
)


print()
print(
    "======================================"
)

print(
    "     SUDARSHANA-AI PIPELINE DONE"
)

print(
    "======================================"
)