# services/deterioration_model.py

import xgboost as xgb
import joblib
import shap
import numpy as np
import os
BASE = os.path.dirname(__file__)
model = joblib.load(os.path.join(BASE,"xgb_deterioration.pkl"))
explainer = shap.TreeExplainer(model)

def predict_deterioration(features):
    arr = np.array([features])
    prob = model.predict_proba(arr)[0][1]
    shap_values = explainer.shap_values(arr)
    return prob, shap_values.tolist()