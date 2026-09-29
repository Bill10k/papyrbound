import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.discussion import DiscussionPost, DiscussionLike
from app.models.user import User
from app.schemas.discussion import (
    DiscussionCreate,
    DiscussionResponse,
    DiscussionLikeResponse,
)
from app.api.deps import get_current_user, get_optional_current_user

router = APIRouter()

@router.get("", response_model=List[DiscussionResponse])
async def list_discussions(
    book_title: Optional[str] = Query(None),
    chapter_index: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """List chapter and book discussion comments with user profiles and like statuses."""
    query = select(DiscussionPost).order_by(desc(DiscussionPost.created_at)).limit(limit)

    if book_title:
        query = query.where(DiscussionPost.book_title.ilike(f"%{book_title}%"))

    if chapter_index is not None:
        query = query.where(DiscussionPost.chapter_index == chapter_index)

    query = query.options(
        selectinload(DiscussionPost.user),
        selectinload(DiscussionPost.likes)
    )

    result = await db.execute(query)
    posts = result.scalars().all()

    user_id = current_user.id if current_user else None
    response = []

    for post in posts:
        likes_count = len(post.likes)
        is_liked = any(like.user_id == user_id for like in post.likes) if user_id else False

        post_data = {
            "id": post.id,
            "book_title": post.book_title,
            "book_author": post.book_author,
            "book_identifier": post.book_identifier,
            "chapter_index": post.chapter_index,
            "chapter_title": post.chapter_title,
            "user_id": post.user_id,
            "content": post.content,
            "is_spoiler": post.is_spoiler,
            "spoiler_warning": post.spoiler_warning,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "likes_count": likes_count,
            "is_liked": is_liked,
            "user": post.user,
        }
        response.append(DiscussionResponse(**post_data))

    return response


@router.post("", response_model=DiscussionResponse, status_code=status.HTTP_201_CREATED)
async def create_discussion_post(
    payload: DiscussionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Post a new discussion note on a book chapter."""
    post = DiscussionPost(
        id=str(uuid.uuid4()),
        book_title=payload.book_title,
        book_author=payload.book_author,
        book_identifier=payload.book_identifier,
        chapter_index=payload.chapter_index,
        chapter_title=payload.chapter_title,
        user_id=current_user.id,
        content=payload.content,
        is_spoiler=payload.is_spoiler,
        spoiler_warning=payload.spoiler_warning,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    post.user = current_user
    return DiscussionResponse(
        id=post.id,
        book_title=post.book_title,
        book_author=post.book_author,
        book_identifier=post.book_identifier,
        chapter_index=post.chapter_index,
        chapter_title=post.chapter_title,
        user_id=post.user_id,
        content=post.content,
        is_spoiler=post.is_spoiler,
        spoiler_warning=post.spoiler_warning,
        created_at=post.created_at,
        updated_at=post.updated_at,
        likes_count=0,
        is_liked=False,
        user=current_user,
    )


@router.post("/{post_id}/like", response_model=DiscussionLikeResponse)
async def toggle_discussion_like(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle like on a discussion comment."""
    post_res = await db.execute(select(DiscussionPost).where(DiscussionPost.id == post_id))
    post = post_res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Discussion post not found")

    like_res = await db.execute(
        select(DiscussionLike).where(
            and_(DiscussionLike.post_id == post_id, DiscussionLike.user_id == current_user.id)
        )
    )
    existing_like = like_res.scalar_one_or_none()

    if existing_like:
        await db.delete(existing_like)
        is_liked = False
    else:
        new_like = DiscussionLike(
            id=str(uuid.uuid4()),
            post_id=post_id,
            user_id=current_user.id,
        )
        db.add(new_like)
        is_liked = True

    await db.commit()

    # Get updated count
    count_res = await db.execute(
        select(func.count(DiscussionLike.id)).where(DiscussionLike.post_id == post_id)
    )
    likes_count = count_res.scalar() or 0

    return DiscussionLikeResponse(
        post_id=post_id,
        is_liked=is_liked,
        likes_count=likes_count,
    )


@router.delete("/{post_id}", status_code=status.HTTP_200_OK)
async def delete_discussion_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a discussion post (author only)."""
    post_res = await db.execute(select(DiscussionPost).where(DiscussionPost.id == post_id))
    post = post_res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Discussion post not found")

    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    await db.delete(post)
    await db.commit()
    return {"message": "Discussion post deleted"}
