import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping
import joblib

# ==============================
# CONFIG
# ==============================
TIME_STEPS = 30
FEATURES = 7

# ==============================
# 1. Load Dataset
# ==============================
df = pd.read_csv("synthetic_icu_timeseries.csv")

# Sort by patient and time
df = df.sort_values(["patient_id", "timestamp"])

# ==============================
# 2. Encode Consciousness
# ==============================
le = LabelEncoder()
df["consciousness"] = le.fit_transform(df["consciousness"])

# ==============================
# 3. NEWS2 Score Calculation
# ==============================
def calculate_news(row):
    score = 0

    # Respiration Rate
    if row["respiration_rate"] <= 8 or row["respiration_rate"] >= 25:
        score += 3
    elif 9 <= row["respiration_rate"] <= 11 or 21 <= row["respiration_rate"] <= 24:
        score += 2

    # SpO2
    if row["spo2"] <= 91:
        score += 3
    elif 92 <= row["spo2"] <= 93:
        score += 2
    elif 94 <= row["spo2"] <= 95:
        score += 1

    # Oxygen Support
    if row["oxygen_support"] == 1:
        score += 2

    # Systolic BP
    if row["systolic_bp"] <= 90 or row["systolic_bp"] >= 220:
        score += 3
    elif 91 <= row["systolic_bp"] <= 100:
        score += 2
    elif 101 <= row["systolic_bp"] <= 110:
        score += 1

    # Heart Rate
    if row["heart_rate"] <= 40 or row["heart_rate"] >= 131:
        score += 3
    elif 41 <= row["heart_rate"] <= 50 or 111 <= row["heart_rate"] <= 130:
        score += 2
    elif 91 <= row["heart_rate"] <= 110:
        score += 1

    # Temperature
    if row["temperature"] <= 35.0:
        score += 3
    elif 35.1 <= row["temperature"] <= 36.0:
        score += 1
    elif 38.1 <= row["temperature"] <= 39.0:
        score += 1
    elif row["temperature"] >= 39.1:
        score += 2

    # Consciousness
    if row["consciousness"] != 0:
        score += 3

    # Scale to 1–10
    return min(max(score, 1), 10)

df["news_score"] = df.apply(calculate_news, axis=1)

# ==============================
# 4. Create Sequences
# ==============================
features = [
    "respiration_rate",
    "spo2",
    "oxygen_support",
    "systolic_bp",
    "heart_rate",
    "temperature",
    "consciousness"
]

X, y = [], []

for patient in df["patient_id"].unique():
    patient_data = df[df["patient_id"] == patient]

    for i in range(len(patient_data) - TIME_STEPS):
        seq = patient_data.iloc[i:i+TIME_STEPS][features].values
        target = patient_data.iloc[i+TIME_STEPS]["news_score"]

        X.append(seq)
        y.append(target)

X = np.array(X)
y = np.array(y)

# ==============================
# 5. Normalize Features
# ==============================
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X.reshape(-1, FEATURES))
X_scaled = X_scaled.reshape(-1, TIME_STEPS, FEATURES)

# Normalize target (1–10 → 0–1)
y = y / 10.0

# ==============================
# 6. Train-Test Split
# ==============================
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

# ==============================
# 7. Build LSTM Model (Regression)
# ==============================
model = Sequential([
    LSTM(64, input_shape=(TIME_STEPS, FEATURES)),
    Dense(32, activation='relu'),
    Dense(1, activation='linear')   # regression output
])

model.compile(
    optimizer='adam',
    loss='mse',
    metrics=['mae']
)

early_stop = EarlyStopping(patience=3, restore_best_weights=True)

# ==============================
# 8. Train Model
# ==============================
model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=20,
    batch_size=32,
    callbacks=[early_stop]
)

# ==============================
# 9. Save Model
# ==============================
model.save("news_lstm_regression.h5")
joblib.dump(scaler, "news_scaler.save")
joblib.dump(le, "consciousness_encoder.save")

print("Model trained and saved successfully.")
