# services/main_vitelora.py

from .news2_calculator import calculate_news2
from .deterioration_model import predict_deterioration
from .social_media_monitor import compute_vigor
from .threshold_engine import dynamic_threshold

def run_vitelora_pipeline(patient):

    vitals = patient["vitals"][0]
    diagnosis = patient["diagnosis"]

    news2 = calculate_news2(vitals)

    features = [
        vitals["rr"],vitals["spo2"],
        vitals["sbp"],vitals["hr"],
        vitals["temp"],news2
    ]

    risk, shap_vals = predict_deterioration(features)
    outbreak = compute_vigor(diagnosis)

    threshold = dynamic_threshold(outbreak["vigor_score"])

    alert = news2 >= threshold or risk >= 0.65

    return {
        "news2":news2,
        "risk":risk,
        "threshold":threshold,
        "outbreak":outbreak,
        "alert":alert
    }