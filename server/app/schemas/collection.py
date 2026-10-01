from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class SharedCollectionItemBase(BaseModel):
    title: str
    author: Optional[str] = None
    cover_image: Optional[str] = None
    curator_note: Optional[str] = None
    order_index: int = 0


class SharedCollectionItemCreate(SharedCollectionItemBase):
    pass


class SharedCollectionItemOut(SharedCollectionItemBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CuratorOut(BaseModel):
    id: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SharedCollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    theme_color: str = "amber"
    is_public: bool = True
    items: List[SharedCollectionItemCreate] = []


class SharedCollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    theme_color: Optional[str] = None
    is_public: Optional[bool] = None
    items: Optional[List[SharedCollectionItemCreate]] = None


class SharedCollectionOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    theme_color: str = "amber"
    share_code: str
    is_public: bool = True
    likes_count: int = 0
    is_liked: bool = False
    created_at: datetime
    updated_at: datetime
    curator: CuratorOut
    items: List[SharedCollectionItemOut] = []

    model_config = ConfigDict(from_attributes=True)


class SharedCollectionLikeResponse(BaseModel):
    is_liked: bool
    likes_count: int
