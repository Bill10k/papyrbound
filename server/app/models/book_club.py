import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base


class BookClub(Base):
    __tablename__ = "book_clubs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), nullable=False)
    slug = Column(String(160), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(80), nullable=False, default="General Fiction")
    cover_image = Column(String(500), nullable=True)
    current_book_title = Column(String(255), nullable=True)
    current_book_author = Column(String(255), nullable=True)
    current_chapter_target = Column(String(100), nullable=True)
    meeting_schedule = Column(String(200), nullable=True)
    is_private = Column(Boolean, default=False)
    created_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])
    members = relationship("ClubMember", back_populates="club", cascade="all, delete-orphan")
    messages = relationship("ClubMessage", back_populates="club", cascade="all, delete-orphan")


class ClubMember(Base):
    __tablename__ = "club_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    club_id = Column(String(36), ForeignKey("book_clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(30), default="member")  # admin, moderator, member
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    club = relationship("BookClub", back_populates="members")
    user = relationship("User")


class ClubMessage(Base):
    __tablename__ = "club_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    club_id = Column(String(36), ForeignKey("book_clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    chapter_reference = Column(String(100), nullable=True)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    club = relationship("BookClub", back_populates="messages")
    user = relationship("User")
