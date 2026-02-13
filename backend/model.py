from unicodedata import name
from pydantic import BaseModel, EmailStr
from typing import Literal
class Login(BaseModel):
    email: EmailStr
    password: str
    role: str

class create_user(BaseModel):
    email : EmailStr
    password : str
    role : Literal["doctor", "admin"]

class patient(BaseModel):
    name : str
    patient_id : str
    room_no : str
    condition : str
    doctor_email : EmailStr