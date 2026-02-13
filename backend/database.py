# db.py
from pymongo import MongoClient 
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["vitelora"]
users_collection = db["users"]
patient_collection = db["patients"]
