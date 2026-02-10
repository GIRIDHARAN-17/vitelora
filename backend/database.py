# db.py
from pymongo import MongoClient
MONGO_URI = "mongodb://localhost:27017/"  # or Atlas URI
client = MongoClient(MONGO_URI)
db = client["vitelora"]
users_collection = db["users"]
