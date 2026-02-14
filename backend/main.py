# main.py
from fastapi import FastAPI, HTTPException, Depends
from model import *
from database import users_collection,patient_collection
from fastapi.middleware.cors import CORSMiddleware  
from security import *
import numpy as np
import joblib
import random
from collections import deque
from tensorflow.keras.models import load_model
import os

TIME_STEPS = 30
FEATURES = 7

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins= ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "news_lstm_regression.h5")
SCALER_PATH = os.path.join(BASE_DIR, "news_scaler.save")
model = load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
buffer = deque(maxlen=TIME_STEPS)

def generate_random_vitals():
    return [
        random.randint(10, 30),      
        random.randint(88, 100),     
        random.randint(0, 1),        
        random.randint(90, 160),  
        random.randint(50, 140),     
        round(random.uniform(35, 40), 1),  
        random.randint(0, 3)         
    ]
    
@app.get("/")
def welcome():
    return {"message": "Welcome to Vitelora API"}

@app.post("/auth/login")
def login(data: Login):
    user = users_collection.find_one({
        "email": data.email,
    })

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "invalid credentials")
    
    token = create_token({
        "sub": user["email"],
        "role": user["role"]
    })

    return {
    "access_token": token,
    "token_type": "bearer",
    "role": user["role"],
}


    

@app.post("/admin_add_user")
def admin_add_user(data: admin_add_user, admin=Depends(require_admin)):
    if data.role == 'doctor' and not data.specialization:
        raise HTTPException(
           status_code =  400,
           detail = "Doctor must have specialization"
           )
    if data.role == 'admin':
        data.specialization = None
    hashed_password = hash_password(data.password)
    users_collection.insert_one({
        "name": data.full_name,
        "email": data.email,
        "password": hashed_password,
        "role": data.role,
        "specialization": data.specialization
    })
    return {
        "message": f"{data.role.capitalize()} created successfully"
    }
@app.post("/create_patient")
def patient(data: patient, admin=Depends(require_admin)):
    existing_patient = patient_collection.find_one({"patient_id": data.patient_id})
    not_doctor_found = users_collection.find_one({"email": data.doctor_email})
    if not_doctor_found is None:
        raise HTTPException(400, "Doctor with this email does not exist")
    if existing_patient:
        raise HTTPException(400, "Patient with this ID already exists")
    patient_collection.insert_one({
        "name": data.full_name,
        "patient_id": data.patient_id,
        "room_no": data.room_no,
        "condition": data.condition,
        "doctor_name": data.doctor_name,
        "doctor_email": data.doctor_email
    })
    return {
        "message": f"Patient {data.full_name} created successfully"
    }
    
@app.get("/auto_stream")
def auto_stream():

    new_row = generate_random_vitals()
    buffer.append(new_row)

    if len(buffer) < TIME_STEPS:
        return {
            "status": "Collecting data...",
            "current_buffer_size": len(buffer)
        }

    seq = np.array(buffer)
    seq_scaled = scaler.transform(seq)
    seq_scaled = seq_scaled.reshape(1, TIME_STEPS, FEATURES)

    prediction = model.predict(seq_scaled, verbose=0)[0][0] * 10

    return {
        "latest_vitals": new_row,
        "predicted_news_score": round(float(prediction), 2)
    }