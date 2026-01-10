import requests
import pandas as pd
import json
import time
import os
from datetime import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv


# =====================
# CONFIG
# =====================
ZONE_NAME = "Najafgarh Zone"
CSV_PATH = "data_source/Ward_monitoring.csv"
OUTPUT_JSON = "dynamic_ward_data/ward_{number}.json"

BASE_URL = "https://api.waqi.info/feed/@{uid}/?token={token}"

# =====================
# ENV
# =====================
load_dotenv()
API_KEY = os.getenv("aqicn_api")

if not API_KEY:
    raise RuntimeError("AQICN API key not found in .env")

IST = ZoneInfo("Asia/Kolkata")

# =====================
# TIME NORMALIZATION
# =====================
def normalize_to_ist(time_block):
    """
    Convert WAQI time block to IST-aware datetime
    """
    # 1️ Prefer ISO timestamp (already tz-aware)
    iso_ts = time_block.get("iso")
    if iso_ts:
        dt = datetime.fromisoformat(iso_ts)
        return dt.astimezone(IST)

    # 2️ Fallback: Unix timestamp
    unix_ts = time_block.get("v")
    if unix_ts:
        return datetime.fromtimestamp(unix_ts, tz=IST)

    return None

# =====================
# LOAD CSV
# =====================
df = pd.read_csv(CSV_PATH)

zone_df = df[df["Zone"].str.lower() == ZONE_NAME.lower()]
if zone_df.empty:
    raise RuntimeError(f"No wards found for zone: {ZONE_NAME}")

# =====================
# FETCH & SAVE PER WARD
# =====================
for _, row in zone_df.iterrows():
    uid = int(row["UID"])
    ward_name = row["WardName"]
    ward_num = row["WardNum"]

    url = BASE_URL.format(uid=uid, token=API_KEY)

    try:
        response = requests.get(url, timeout=15)
        data = response.json()

        if data.get("status") != "ok":
            print(f" API returned non-ok for ward {ward_num}")
            continue

        d = data["data"]

        # ---- IST TIME HANDLING ----
        time_block = d.get("time", {})
        ist_dt = normalize_to_ist(time_block)

        if ist_dt:
            timestamp_ist_iso = ist_dt.isoformat()
            timestamp_ist_epoch = int(ist_dt.timestamp())
            reading_date_ist = ist_dt.date().isoformat()
            reading_time_ist = ist_dt.time().isoformat()
        else:
            timestamp_ist_iso = None
            timestamp_ist_epoch = None
            reading_date_ist = None
            reading_time_ist = None

        # ---- PER WARD JSON ----
        ward_output = {
            "zone": ZONE_NAME,
            "ward_number": ward_num,
            "ward_name": ward_name,
            "station_uid": uid,
            "generated_at_ist": datetime.now(IST).isoformat(),

            # Core AQI
            "aqi": d.get("aqi"),
            "idx": d.get("idx"),
            "dominentpol": d.get("dominentpol"),

            # City
            "city_name": d.get("city", {}).get("name"),
            "city_geo": d.get("city", {}).get("geo"),
            "city_url": d.get("city", {}).get("url"),

            # IAQI
            "iaqi_pm25": d.get("iaqi", {}).get("pm25", {}).get("v"),
            "iaqi_pm10": d.get("iaqi", {}).get("pm10", {}).get("v"),
            "iaqi_no2": d.get("iaqi", {}).get("no2", {}).get("v"),
            "iaqi_o3": d.get("iaqi", {}).get("o3", {}).get("v"),
            "iaqi_so2": d.get("iaqi", {}).get("so2", {}).get("v"),
            "iaqi_co": d.get("iaqi", {}).get("co", {}).get("v"),

            # Normalized IST timestamps
            "timestamp_ist_iso": timestamp_ist_iso,
            "timestamp_ist_epoch": timestamp_ist_epoch,
            "reading_date_ist": reading_date_ist,
            "reading_time_ist": reading_time_ist,

            # Raw time (for audit/debug)
            "time_raw": time_block,

            # Forecasts
            "forecast_daily_pm25": d.get("forecast", {}).get("daily", {}).get("pm25"),
            "forecast_daily_pm10": d.get("forecast", {}).get("daily", {}).get("pm10"),
            "forecast_daily_uvi": d.get("forecast", {}).get("daily", {}).get("uvi")
        }

        # SAVE FILE
        with open(OUTPUT_JSON.format(number=ward_num), "w", encoding="utf-8") as f:
            json.dump(ward_output, f, indent=4)

        print(f"Saved ward {ward_num}")
        time.sleep(1)

    except Exception as e:
        print(f"Error for ward {ward_num}: {e}")

print("=" * 10, f"ZONE COMPLETED: {ZONE_NAME}", "=" * 10)