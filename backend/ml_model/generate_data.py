import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

NUM_PATIENTS = 50
TIME_STEPS = 60

def generate_patient_series(patient_id):
    data = []
    base_time = datetime.now()

    base_rr = np.random.randint(14, 20)
    base_spo2 = np.random.randint(95, 99)
    base_bp = np.random.randint(110, 130)
    base_hr = np.random.randint(70, 95)
    base_temp = round(np.random.uniform(36.5, 37.5), 1)

    deteriorating = random.choice([True, False])

    for t in range(TIME_STEPS):
        timestamp = base_time + timedelta(minutes=t)

        rr = base_rr + np.random.randint(-2, 3)
        spo2 = base_spo2 + np.random.randint(-2, 2)
        bp = base_bp + np.random.randint(-10, 10)
        hr = base_hr + np.random.randint(-5, 5)
        temp = round(base_temp + np.random.uniform(-0.3, 0.3), 1)

        if deteriorating and t > TIME_STEPS//2:
            rr += 4
            spo2 -= 4
            hr += 15
            temp += 1

        oxygen_support = 1 if spo2 < 94 else 0
        consciousness = "A" if spo2 > 90 else random.choice(["V","P","U"])

        data.append([
            patient_id, timestamp, rr, spo2, oxygen_support,
            bp, hr, temp, consciousness
        ])

    return data

all_data = []
for i in range(1, NUM_PATIENTS+1):
    pid = f"P{str(i).zfill(4)}"
    all_data.extend(generate_patient_series(pid))

columns = [
    "patient_id","timestamp","respiration_rate","spo2",
    "oxygen_support","systolic_bp","heart_rate",
    "temperature","consciousness"
]

df = pd.DataFrame(all_data, columns=columns)
df.to_csv("synthetic_icu_timeseries.csv", index=False)

print("Dataset created.")
