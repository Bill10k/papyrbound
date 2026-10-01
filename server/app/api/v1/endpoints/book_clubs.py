import re
import random
import string
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.book_club import BookClub, ClubMember, ClubMessage
from app.models.user import User
from app.schemas.book_club import (
    BookClubCreate,
    BookClubResponse,
    ClubMessageCreate,
    ClubMessageResponse,
    ClubMemberResponse,
)
from app.api.deps import get_current_user, get_optional_current_user

router = APIRouter()


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text or str(uuid.uuid4())[:8]


def generate_invite_code() -> str:
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"PAPYR-CLUB-{chars}"


def format_club_response(club: BookClub, current_user_id: Optional[str] = None) -> BookClubResponse:
    member_count = len(club.members) if club.members else 0
    is_joined = any(m.user_id == current_user_id for m in club.members) if (current_user_id and club.members) else False

    return BookClubResponse(
        id=club.id,
        name=club.name,
        slug=club.slug,
        description=club.description,
        category=club.category,
        cover_image=club.cover_image,
        current_book_title=club.current_book_title,
        current_book_author=club.current_book_author,
        current_chapter_target=club.current_chapter_target,
        meeting_schedule=club.meeting_schedule,
        is_private=club.is_private,
        invite_code=club.invite_code,
        created_by_id=club.created_by_id,
        created_at=club.created_at,
        updated_at=club.updated_at,
        members_count=member_count,
        is_joined=is_joined,
        created_by=club.created_by,
    )


@router.get("", response_model=List[BookClubResponse])
async def list_book_clubs(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """List all public book clubs with search, category filters, and live membership status."""
    query = select(BookClub).where(BookClub.is_private.is_(False))

    if category and category.lower() != "all":
        query = query.where(BookClub.category.ilike(f"%{category}%"))

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                BookClub.name.ilike(search_pattern),
                BookClub.description.ilike(search_pattern),
                BookClub.current_book_title.ilike(search_pattern),
            )
        )

    query = query.options(selectinload(BookClub.members), selectinload(BookClub.created_by))
    result = await db.execute(query)
    clubs = result.scalars().all()

    user_id = current_user.id if current_user else None
    return [format_club_response(c, user_id) for c in clubs]


@router.get("/mine", response_model=List[BookClubResponse])
async def list_my_book_clubs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all clubs joined or created by the current user (public and private)."""
    # Fetch clubs where current user is a member
    query = (
        select(BookClub)
        .join(ClubMember, ClubMember.club_id == BookClub.id)
        .where(ClubMember.user_id == current_user.id)
        .options(selectinload(BookClub.members), selectinload(BookClub.created_by))
        .order_by(BookClub.updated_at.desc())
    )
    result = await db.execute(query)
    clubs = result.scalars().all()

    return [format_club_response(c, current_user.id) for c in clubs]


@router.get("/code/{invite_code}", response_model=BookClubResponse)
async def get_club_by_invite_code(
    invite_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Fetch club info using invite code (e.g. PAPYR-CLUB-XXXXXX or without prefix)."""
    clean_code = invite_code.strip().upper()
    if not clean_code.startswith("PAPYR-CLUB-") and not clean_code.startswith("#PAPYR-CLUB-"):
        lookup_code = f"PAPYR-CLUB-{clean_code.replace('#', '')}"
    else:
        lookup_code = clean_code.replace("#", "")

    query = (
        select(BookClub)
        .where(
            or_(
                BookClub.invite_code == lookup_code,
                BookClub.invite_code == clean_code,
                BookClub.slug == invite_code.lower(),
            )
        )
        .options(selectinload(BookClub.members), selectinload(BookClub.created_by))
    )
    result = await db.execute(query)
    club = result.scalar_one_or_none()

    if not club:
        raise HTTPException(status_code=404, detail="Book club not found with this code")

    user_id = current_user.id if current_user else None
    return format_club_response(club, user_id)


@router.post("/join-by-code", response_model=BookClubResponse)
async def join_club_by_code(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Join a public or private club by its invite code."""
    raw_code = payload.get("invite_code") or payload.get("code") or ""
    clean_code = raw_code.strip().upper()
    if not clean_code:
        raise HTTPException(status_code=400, detail="Invite code is required")

    if not clean_code.startswith("PAPYR-CLUB-") and not clean_code.startswith("#PAPYR-CLUB-"):
        lookup_code = f"PAPYR-CLUB-{clean_code.replace('#', '')}"
    else:
        lookup_code = clean_code.replace("#", "")

    query = (
        select(BookClub)
        .where(
            or_(
                BookClub.invite_code == lookup_code,
                BookClub.invite_code == clean_code,
                BookClub.slug == raw_code.strip().lower(),
                BookClub.id == raw_code.strip(),
            )
        )
        .options(selectinload(BookClub.members), selectinload(BookClub.created_by))
    )
    result = await db.execute(query)
    club = result.scalar_one_or_none()

    if not club:
        raise HTTPException(status_code=404, detail="No book club matches this invite code")

    club_id = club.id
    member_check = await db.execute(
        select(ClubMember).where(ClubMember.club_id == club_id, ClubMember.user_id == current_user.id)
    )
    if not member_check.scalar_one_or_none():
        member = ClubMember(
            id=str(uuid.uuid4()),
            club_id=club_id,
            user_id=current_user.id,
            role="member",
        )
        db.add(member)
        await db.commit()

    count_res = await db.execute(
        select(func.count(ClubMember.id)).where(ClubMember.club_id == club_id)
    )
    members_count = count_res.scalar() or 1

    return BookClubResponse(
        id=club.id,
        name=club.name,
        slug=club.slug,
        description=club.description,
        category=club.category,
        cover_image=club.cover_image,
        current_book_title=club.current_book_title,
        current_book_author=club.current_book_author,
        current_chapter_target=club.current_chapter_target,
        meeting_schedule=club.meeting_schedule,
        is_private=club.is_private,
        invite_code=club.invite_code,
        created_by_id=club.created_by_id,
        created_at=club.created_at,
        updated_at=club.updated_at,
        members_count=members_count,
        is_joined=True,
        created_by=club.created_by,
    )


@router.post("", response_model=BookClubResponse, status_code=status.HTTP_201_CREATED)
async def create_book_club(
    payload: BookClubCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new book club. The creator is automatically added as an admin member."""
    base_slug = slugify(payload.name)
    slug = base_slug
    idx = 1
    while True:
        exists = await db.execute(select(BookClub).where(BookClub.slug == slug))
        if not exists.scalar_one_or_none():
            break
        slug = f"{base_slug}-{idx}"
        idx += 1

    invite_code = generate_invite_code()

    club = BookClub(
        id=str(uuid.uuid4()),
        name=payload.name,
        slug=slug,
        description=payload.description,
        category=payload.category,
        cover_image=payload.cover_image,
        current_book_title=payload.current_book_title,
        current_book_author=payload.current_book_author,
        current_chapter_target=payload.current_chapter_target,
        meeting_schedule=payload.meeting_schedule,
        is_private=payload.is_private,
        invite_code=invite_code,
        created_by_id=current_user.id,
    )
    db.add(club)
    await db.flush()

    # Add creator as admin member
    member = ClubMember(
        id=str(uuid.uuid4()),
        club_id=club.id,
        user_id=current_user.id,
        role="admin",
    )
    db.add(member)
    await db.commit()

    # Re-fetch with relationships
    fresh = await db.execute(
        select(BookClub)
        .where(BookClub.id == club.id)
        .options(selectinload(BookClub.members), selectinload(BookClub.created_by))
    )
    club = fresh.scalar_one()
    return format_club_response(club, current_user.id)


@router.get("/{club_id}", response_model=BookClubResponse)
async def get_book_club(
    club_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Retrieve book club details by UUID, slug, or invite code."""
    query = select(BookClub).where(
        or_(
            BookClub.id == club_id,
            BookClub.slug == club_id,
            BookClub.invite_code == club_id,
        )
    ).options(selectinload(BookClub.members), selectinload(BookClub.created_by))
    result = await db.execute(query)
    club = result.scalar_one_or_none()

    if not club:
        raise HTTPException(status_code=404, detail="Book club not found")

    user_id = current_user.id if current_user else None
    return format_club_response(club, user_id)


@router.post("/{club_id}/join", status_code=status.HTTP_200_OK)
async def join_book_club(
    club_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Join a book club."""
    query = select(BookClub).where(or_(BookClub.id == club_id, BookClub.slug == club_id))
    result = await db.execute(query)
    club = result.scalar_one_or_none()
    if not club:
        raise HTTPException(status_code=404, detail="Book club not found")

    member_check = await db.execute(
        select(ClubMember).where(ClubMember.club_id == club.id, ClubMember.user_id == current_user.id)
    )
    if member_check.scalar_one_or_none():
        return {"message": "Already a member of this club", "joined": True}

    member = ClubMember(
        id=str(uuid.uuid4()),
        club_id=club.id,
        user_id=current_user.id,
        role="member",
    )
    db.add(member)
    await db.commit()
    return {"message": f"Successfully joined {club.name}", "joined": True}


@router.post("/{club_id}/leave", status_code=status.HTTP_200_OK)
async def leave_book_club(
    club_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Leave a book club."""
    query = select(BookClub).where(or_(BookClub.id == club_id, BookClub.slug == club_id))
    result = await db.execute(query)
    club = result.scalar_one_or_none()
    if not club:
        raise HTTPException(status_code=404, detail="Book club not found")

    member_check = await db.execute(
        select(ClubMember).where(ClubMember.club_id == club.id, ClubMember.user_id == current_user.id)
    )
    member = member_check.scalar_one_or_none()
    if not member:
        return {"message": "Not a member of this club", "joined": False}

    await db.delete(member)
    await db.commit()
    return {"message": f"Successfully left {club.name}", "joined": False}


@router.get("/{club_id}/messages", response_model=List[ClubMessageResponse])
async def list_club_messages(
    club_id: str,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List recent discussion messages for a book club."""
    query = select(BookClub).where(or_(BookClub.id == club_id, BookClub.slug == club_id))
    result = await db.execute(query)
    club = result.scalar_one_or_none()
    if not club:
        raise HTTPException(status_code=404, detail="Book club not found")

    msg_query = (
        select(ClubMessage)
        .where(ClubMessage.club_id == club.id)
        .order_by(ClubMessage.created_at.asc())
        .limit(limit)
        .options(selectinload(ClubMessage.user))
    )
    msg_result = await db.execute(msg_query)
    messages = msg_result.scalars().all()
    return messages


@router.post("/{club_id}/messages", response_model=ClubMessageResponse, status_code=status.HTTP_201_CREATED)
async def post_club_message(
    club_id: str,
    payload: ClubMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Post a message or discussion comment to a book club."""
    query = select(BookClub).where(or_(BookClub.id == club_id, BookClub.slug == club_id))
    result = await db.execute(query)
    club = result.scalar_one_or_none()
    if not club:
        raise HTTPException(status_code=404, detail="Book club not found")

    message = ClubMessage(
        id=str(uuid.uuid4()),
        club_id=club.id,
        user_id=current_user.id,
        content=payload.content,
        chapter_reference=payload.chapter_reference,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)

    # Attach user object for response
    message.user = current_user
    return message
