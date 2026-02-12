# main.py
from fastapi import FastAPI, HTTPException
from model import Login,create_user
from database import users_collection
from fastapi.middleware.cors import CORSMiddleware  
from security import *
from fastapi import Depends

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins= ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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
        "email": user["email"],
        "role": user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"]
    }
@app.get("/admin")
def admin_route(user=Depends(require_admin)):
    return {"message": "Welcome Admin"}
@app.post("/create_user")
def create_user(data: create_user, admin=Depends(require_admin)):
    existing_user = users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(400, "User with this email already exists")
    hashed_password = hash_password(data.password)
    users_collection.insert_one({
        "email": data.email,
        "password": hashed_password,
        "role": data.role
    })
    return {
        "message": f"{data.role.capitalize()} created successfully"
    }