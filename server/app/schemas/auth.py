from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    display_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6, max_length=128)

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class AuthAccountOut(BaseModel):
    provider: str
    created_at: datetime

    model_config = {"from_attributes": True}

class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    connected_providers: List[str] = []

    model_config = {"from_attributes": True}

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class GoogleAuthInit(BaseModel):
    redirect_url: str
    state: str
    code_challenge: str

class GoogleAuthExchange(BaseModel):
    code: str
    code_verifier: str
    state: Optional[str] = None
