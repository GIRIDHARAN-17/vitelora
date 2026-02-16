from unicodedata import name
from pydantic import BaseModel, EmailStr
from typing import Literal,Optional
class Login(BaseModel):
    email: EmailStr
    password: str
    role: str

class admin_add_user(BaseModel):
    full_name : str
    email : EmailStr
    password : str
    role : str
    specialization : Optional[Literal["General Practice","Virology","Epidemiology","Cardiology"]] = None
class patient(BaseModel):
    full_name : str
    patient_id : str
    room_no : str
    condition : str
    doctor_name : str
    doctor_email : EmailStr
    
class news_score(BaseModel):
    patient_id : str
    news_score : float