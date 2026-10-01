from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserOut



class BookClubBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "General Fiction"
    cover_image: Optional[str] = None
    current_book_title: Optional[str] = None
    current_book_author: Optional[str] = None
    current_chapter_target: Optional[str] = None
    meeting_schedule: Optional[str] = None
    is_private: bool = False
    invite_code: Optional[str] = None


class BookClubCreate(BookClubBase):
    pass


class BookClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    cover_image: Optional[str] = None
    current_book_title: Optional[str] = None
    current_book_author: Optional[str] = None
    current_chapter_target: Optional[str] = None
    meeting_schedule: Optional[str] = None
    is_private: Optional[bool] = None


class ClubMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    club_id: str
    user_id: str
    role: str
    joined_at: datetime
    user: Optional[UserOut] = None


class ClubMessageCreate(BaseModel):
    content: str
    chapter_reference: Optional[str] = None


class ClubMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    club_id: str
    user_id: str
    content: str
    chapter_reference: Optional[str] = None
    is_pinned: bool
    created_at: datetime
    user: Optional[UserOut] = None


class BookClubResponse(BookClubBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    created_by_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    members_count: int = 0
    is_joined: bool = False
    created_by: Optional[UserOut] = None
