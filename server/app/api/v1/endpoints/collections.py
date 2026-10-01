import uuid
import secrets
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_, and_
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.collection import SharedCollection, SharedCollectionItem, SharedCollectionLike
from app.models.user import User
from app.schemas.collection import (
    SharedCollectionCreate,
    SharedCollectionUpdate,
    SharedCollectionOut,
    SharedCollectionLikeResponse,
    CuratorOut,
    SharedCollectionItemOut,
)
from app.api.deps import get_current_user, get_optional_current_user

router = APIRouter()


def generate_share_code(name: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9]+', '', name)[:6].upper()
    if not slug:
        slug = "BOOK"
    suffix = secrets.token_hex(2).upper()
    return f"PAPYR-{slug}-{suffix}"


def _format_collection(collection: SharedCollection, current_user_id: Optional[str] = None) -> SharedCollectionOut:
    likes_count = len(collection.likes) if collection.likes else 0
    is_liked = any(like.user_id == current_user_id for like in collection.likes) if current_user_id and collection.likes else False

    curator = CuratorOut(
        id=collection.user.id if collection.user else "anonymous",
        username=collection.user.username if collection.user else "reader",
        display_name=collection.user.display_name if collection.user else "Anonymous Reader",
        avatar_url=collection.user.avatar_url if collection.user else None,
    )

    items = [
        SharedCollectionItemOut(
            id=item.id,
            title=item.title,
            author=item.author,
            cover_image=item.cover_image,
            curator_note=item.curator_note,
            order_index=item.order_index,
            created_at=item.created_at,
        )
        for item in (collection.items or [])
    ]

    return SharedCollectionOut(
        id=collection.id,
        name=collection.name,
        description=collection.description,
        theme_color=collection.theme_color or "amber",
        share_code=collection.share_code,
        is_public=collection.is_public,
        likes_count=likes_count,
        is_liked=is_liked,
        created_at=collection.created_at,
        updated_at=collection.updated_at,
        curator=curator,
        items=items,
    )


@router.get("", response_model=List[SharedCollectionOut])
async def list_public_collections(
    search: Optional[str] = Query(None, description="Search by collection title, description, or curator"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    List public shareable collections (Spotify-style curated playlists).
    """
    query = (
        select(SharedCollection)
        .where(SharedCollection.is_public == True)
        .options(
            selectinload(SharedCollection.user),
            selectinload(SharedCollection.items),
            selectinload(SharedCollection.likes),
        )
        .order_by(desc(SharedCollection.created_at))
        .limit(limit)
    )

    if search:
        query = query.where(
            or_(
                SharedCollection.name.ilike(f"%{search}%"),
                SharedCollection.description.ilike(f"%{search}%"),
                SharedCollection.share_code.ilike(f"%{search}%"),
            )
        )

    result = await db.execute(query)
    collections = result.scalars().all()
    user_id = current_user.id if current_user else None

    return [_format_collection(c, user_id) for c in collections]


@router.get("/mine", response_model=List[SharedCollectionOut])
async def list_my_collections(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all collections created by the current authenticated user.
    """
    query = (
        select(SharedCollection)
        .where(SharedCollection.user_id == current_user.id)
        .options(
            selectinload(SharedCollection.user),
            selectinload(SharedCollection.items),
            selectinload(SharedCollection.likes),
        )
        .order_by(desc(SharedCollection.updated_at))
    )

    result = await db.execute(query)
    collections = result.scalars().all()

    return [_format_collection(c, current_user.id) for c in collections]


@router.get("/{id_or_code}", response_model=SharedCollectionOut)
async def get_collection_by_id_or_code(
    id_or_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Get a single collection by ID or share code.
    """
    query = (
        select(SharedCollection)
        .where(
            or_(
                SharedCollection.id == id_or_code,
                SharedCollection.share_code == id_or_code.upper(),
            )
        )
        .options(
            selectinload(SharedCollection.user),
            selectinload(SharedCollection.items),
            selectinload(SharedCollection.likes),
        )
    )

    result = await db.execute(query)
    collection = result.scalar_one_or_none()

    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")

    user_id = current_user.id if current_user else None
    return _format_collection(collection, user_id)


@router.post("", response_model=SharedCollectionOut, status_code=status.HTTP_201_CREATED)
async def create_collection(
    payload: SharedCollectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new shareable curated collection.
    """
    share_code = generate_share_code(payload.name)

    # Ensure share code uniqueness
    existing = await db.execute(select(SharedCollection).where(SharedCollection.share_code == share_code))
    if existing.scalar_one_or_none():
        share_code = f"{share_code}-{secrets.token_hex(1).upper()}"

    collection = SharedCollection(
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        theme_color=payload.theme_color or "amber",
        share_code=share_code,
        is_public=payload.is_public,
        user_id=current_user.id,
    )
    db.add(collection)
    await db.flush()

    for idx, item in enumerate(payload.items):
        db_item = SharedCollectionItem(
            collection_id=collection.id,
            title=item.title.strip(),
            author=item.author.strip() if item.author else None,
            cover_image=item.cover_image,
            curator_note=item.curator_note.strip() if item.curator_note else None,
            order_index=item.order_index if item.order_index is not None else idx,
        )
        db.add(db_item)

    await db.commit()

    # Re-fetch with relationships
    query = (
        select(SharedCollection)
        .where(SharedCollection.id == collection.id)
        .options(
            selectinload(SharedCollection.user),
            selectinload(SharedCollection.items),
            selectinload(SharedCollection.likes),
        )
    )
    res = await db.execute(query)
    created_collection = res.scalar_one()

    return _format_collection(created_collection, current_user.id)


@router.put("/{collection_id}", response_model=SharedCollectionOut)
async def update_collection(
    collection_id: str,
    payload: SharedCollectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing collection (curator only).
    """
    query = (
        select(SharedCollection)
        .where(SharedCollection.id == collection_id)
        .options(
            selectinload(SharedCollection.user),
            selectinload(SharedCollection.items),
            selectinload(SharedCollection.likes),
        )
    )
    res = await db.execute(query)
    collection = res.scalar_one_or_none()

    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")

    if collection.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own collections")

    if payload.name is not None:
        collection.name = payload.name.strip()
    if payload.description is not None:
        collection.description = payload.description.strip()
    if payload.theme_color is not None:
        collection.theme_color = payload.theme_color
    if payload.is_public is not None:
        collection.is_public = payload.is_public

    if payload.items is not None:
        # Replace items
        for old_item in collection.items:
            await db.delete(old_item)
        await db.flush()

        for idx, item in enumerate(payload.items):
            db_item = SharedCollectionItem(
                collection_id=collection.id,
                title=item.title.strip(),
                author=item.author.strip() if item.author else None,
                cover_image=item.cover_image,
                curator_note=item.curator_note.strip() if item.curator_note else None,
                order_index=item.order_index if item.order_index is not None else idx,
            )
            db.add(db_item)

    await db.commit()

    # Re-fetch updated
    res = await db.execute(query)
    updated = res.scalar_one()
    return _format_collection(updated, current_user.id)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a collection (curator only).
    """
    query = select(SharedCollection).where(SharedCollection.id == collection_id)
    res = await db.execute(query)
    collection = res.scalar_one_or_none()

    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")

    if collection.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own collections")

    await db.delete(collection)
    await db.commit()
    return None


@router.post("/{collection_id}/like", response_model=SharedCollectionLikeResponse)
async def toggle_collection_like(
    collection_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Like or save a shared collection.
    """
    # Check collection exists
    c_query = select(SharedCollection).where(SharedCollection.id == collection_id)
    c_res = await db.execute(c_query)
    if not c_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")

    like_query = select(SharedCollectionLike).where(
        SharedCollectionLike.collection_id == collection_id,
        SharedCollectionLike.user_id == current_user.id,
    )
    like_res = await db.execute(like_query)
    existing_like = like_res.scalar_one_or_none()

    if existing_like:
        await db.delete(existing_like)
        is_liked = False
    else:
        new_like = SharedCollectionLike(
            collection_id=collection_id,
            user_id=current_user.id,
        )
        db.add(new_like)
        is_liked = True

    await db.commit()

    count_res = await db.execute(
        select(func.count()).select_from(SharedCollectionLike).where(SharedCollectionLike.collection_id == collection_id)
    )
    total_likes = count_res.scalar_one()

    return SharedCollectionLikeResponse(is_liked=is_liked, likes_count=total_likes)
