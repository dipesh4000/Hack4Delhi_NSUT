import os
import subprocess
import sys

# =====================
# CONFIG
# =====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

EXCLUDE_FILES = {
    "run_all_wards.py",
}

# =====================
# DISCOVER SCRIPTS
# =====================
zone_scripts = []

for file in os.listdir(BASE_DIR):
    if (
        file.endswith("_Wards_Script.py")
        and file not in EXCLUDE_FILES
        and not file.endswith(".ipynb")
    ):
        zone_scripts.append(file)

zone_scripts.sort()

if not zone_scripts:
    print("No zone scripts found.")
    sys.exit(0)

print(f"Found {len(zone_scripts)} zone scripts\n")

# =====================
# RUN SCRIPTS
# =====================
for script in zone_scripts:
    print("=" * 60)
    print(f"Running: {script}")
    print("=" * 60)

    result = subprocess.run(
        [sys.executable, script],
        cwd=BASE_DIR
    )

    if result.returncode != 0:
        print(f"❌ Error running {script}, stopping execution.")
        break

print("\n✅ All zone scripts completed.")
