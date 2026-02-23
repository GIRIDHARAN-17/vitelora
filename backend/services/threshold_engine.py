# services/threshold_engine.py
def dynamic_threshold(vigor):
    if vigor >= 7:
        return 3
    elif vigor >= 4:
        return 4
    return 5

def explain_threshold(vigor):
    base = 5
    new = dynamic_threshold(vigor)
    return f"Threshold lowered {base}->{new} due to outbreak vigor={vigor}"