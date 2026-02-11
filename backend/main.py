# main.py
from fastapi import FastAPI, HTTPException
from model import Signup,Login
from database import users_collection
from fastapi.middleware.cors import CORSMiddleware  
from security import *
from security import verify_token
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

@app.post("/auth/signup")
def signup(data: Signup):
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(400, "User already exists")

    users_collection.insert_one({
        "email": data.email,
        "password": hash_password(data.password),
        "role": data.role
    })

    return {"message": "User created"}

@app.post("/auth/login")
def login(data: Login):
    user = users_collection.find_one({
        "email": data.email,
        "role": data.role
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
    
@app.get("/protected")
def protected_route(user=Depends(verify_token)):
    return {
        "message": "Access granted",
        "user": user
    }
def require_admin(user=Depends(verify_token)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@app.get("/admin")
def admin_route(user=Depends(require_admin)):
    return {"message": "Welcome Admin"}

