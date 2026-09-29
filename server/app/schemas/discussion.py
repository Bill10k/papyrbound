from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserOut


class DiscussionCreate(BaseModel):
    book_title: str
    book_author: Optional[str] = None
    book_identifier: Optional[str] = None
    chapter_index: int = 0
    chapter_title: str = "Chapter"
    content: str
    is_spoiler: bool = False
    spoiler_warning: Optional[str] = None


class DiscussionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    book_title: str
    book_author: Optional[str] = None
    book_identifier: Optional[str] = None
    chapter_index: int
    chapter_title: str
    user_id: str
    content: str
    is_spoiler: bool
    spoiler_warning: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    likes_count: int = 0
    is_liked: bool = False
    user: Optional[UserOut] = None


class DiscussionLikeResponse(BaseModel):
    post_id: str
    is_liked: bool
    likes_count: int
