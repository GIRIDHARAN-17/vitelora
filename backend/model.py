from pydantic import BaseModel, EmailStr

class Signup(BaseModel):
    email: EmailStr
    password: str
    role: str  # doctor | admin

class Login(BaseModel):
    email: EmailStr
    password: str
    role: str