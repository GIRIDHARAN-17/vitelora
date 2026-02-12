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