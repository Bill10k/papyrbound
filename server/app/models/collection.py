import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base


class SharedCollection(Base):
    __tablename__ = "shared_collections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    theme_color = Column(String(30), default="amber")  # amber, indigo, emerald, rose, slate
    share_code = Column(String(30), unique=True, index=True, nullable=False)
    is_public = Column(Boolean, default=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User")
    items = relationship("SharedCollectionItem", back_populates="collection", cascade="all, delete-orphan", order_by="SharedCollectionItem.order_index")
    likes = relationship("SharedCollectionLike", back_populates="collection", cascade="all, delete-orphan")


class SharedCollectionItem(Base):
    __tablename__ = "shared_collection_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    collection_id = Column(String(36), ForeignKey("shared_collections.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=True)
    cover_image = Column(Text, nullable=True)
    curator_note = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    collection = relationship("SharedCollection", back_populates="items")


class SharedCollectionLike(Base):
    __tablename__ = "shared_collection_likes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    collection_id = Column(String(36), ForeignKey("shared_collections.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    collection = relationship("SharedCollection", back_populates="likes")
    user = relationship("User")
