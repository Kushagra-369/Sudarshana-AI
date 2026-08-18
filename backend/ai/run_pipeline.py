from pathlib import Path
import subprocess
import sys


# ============================================
# SUDARSHANA-AI PIPELINE
# ============================================

# This file is:
# backend/ai/run_pipeline.py

AI_DIR = Path(__file__).resolve().parent


def run_module(file_path):

    print()
    print("=" * 60)
    print(f"RUNNING: {file_path.name}")
    print("=" * 60)

    result = subprocess.run(
        [
            sys.executable,
            str(file_path)
        ]
    )

    if result.returncode != 0:

        print()
        print(f"ERROR: {file_path.name} failed.")

        sys.exit(
            result.returncode
        )


# ============================================
# 1. OBJECT DETECTION
# ============================================

run_module(
    AI_DIR / "detection" / "detect.py"
)


# ============================================
# 2. OBJECT TRACKING
# ============================================

run_module(
    AI_DIR / "tracking" / "tracker.py"
)


# ============================================
# 3. ANOMALY DETECTION
# ============================================

# Currently anomaly analysis is used
# internally by tracker.py.
#
# Keeping this separate makes the architecture
# easy to expand later.


# ============================================
# 4. RISK / THREAT SCORING
# ============================================

# Currently risk scoring is used
# internally by tracker.py.


# ============================================
# 5. SITUATION SUMMARY
# ============================================

run_module(
    AI_DIR / "summary" / "summary.py"
)


# ============================================
# COMPLETE
# ============================================

print()
print("=" * 60)
print("        SUDARSHANA-AI PIPELINE COMPLETE")
print("=" * 60)

print()
print("Generated outputs:")
print("✓ Object detection result")
print("✓ Object tracking result")
print("✓ Anomaly analysis")
print("✓ Risk scoring")
print("✓ Situation summary")
print()