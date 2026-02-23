# services/news2_calculator.py

def score_rr(rr):
    if rr <= 8: return 3
    elif 9 <= rr <= 11: return 1
    elif 12 <= rr <= 20: return 0
    elif 21 <= rr <= 24: return 2
    else: return 3

def score_spo2(spo2):
    if spo2 <= 91: return 3
    elif 92 <= spo2 <= 93: return 2
    elif 94 <= spo2 <= 95: return 1
    else: return 0

def score_temp(temp):
    if temp <= 35: return 3
    elif 35.1 <= temp <= 36: return 1
    elif 36.1 <= temp <= 38: return 0
    elif 38.1 <= temp <= 39: return 1
    else: return 2

def score_sbp(sbp):
    if sbp <= 90: return 3
    elif 91 <= sbp <= 100: return 2
    elif 101 <= sbp <= 110: return 1
    elif 111 <= sbp <= 219: return 0
    else: return 3

def score_hr(hr):
    if hr <= 40: return 3
    elif 41 <= hr <= 50: return 1
    elif 51 <= hr <= 90: return 0
    elif 91 <= hr <= 110: return 1
    elif 111 <= hr <= 130: return 2
    else: return 3

def score_consciousness(avpu):
    return 0 if avpu == "A" else 3

def calculate_news2(v):
    return (
        score_rr(v["rr"]) +
        score_spo2(v["spo2"]) +
        score_temp(v["temp"]) +
        score_sbp(v["sbp"]) +
        score_hr(v["hr"]) +
        score_consciousness(v["consciousness"])
    )