import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Integer, Index
from sqlalchemy.orm import relationship
from app.db.base import Base


class DiscussionPost(Base):
    __tablename__ = "discussion_posts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    book_title = Column(String(255), nullable=False, index=True)
    book_author = Column(String(255), nullable=True)
    book_identifier = Column(String(100), nullable=True, index=True)
    chapter_index = Column(Integer, nullable=False, default=0, index=True)
    chapter_title = Column(String(255), nullable=False, default="Chapter")
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_spoiler = Column(Boolean, default=False)
    spoiler_warning = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User")
    likes = relationship("DiscussionLike", back_populates="post", cascade="all, delete-orphan")


class DiscussionLike(Base):
    __tablename__ = "discussion_likes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String(36), ForeignKey("discussion_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    post = relationship("DiscussionPost", back_populates="likes")
    user = relationship("User")

    __table_args__ = (
        Index("ix_post_user_like", "post_id", "user_id", unique=True),
    )
