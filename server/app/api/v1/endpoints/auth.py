from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.db.session import get_db
from app.models.user import User
from app.models.auth_account import AuthAccount
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserOut,
    UserProfileUpdate,
    Token,
)
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_out(user: User) -> UserOut:
    connected = [acc.provider for acc in getattr(user, "auth_accounts", [])]
    return UserOut(
        id=user.id,
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        connected_providers=connected,
    )

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    # Check if email or username already taken
    existing_check = await db.execute(
        select(User).where(
            or_(User.email == user_in.email.lower(), User.username == user_in.username.lower())
        )
    )
    existing_user = existing_check.scalar_one_or_none()
    if existing_user:
        if existing_user.email.lower() == user_in.email.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken."
            )

    # Create new user
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        username=user_in.username.lower(),
        display_name=user_in.display_name,
        hashed_password=hashed_password,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    # Link email auth_account
    auth_acc = AuthAccount(
        user_id=user.id,
        provider="email",
        provider_account_id=user.email,
    )
    db.add(auth_acc)
    await db.commit()
    await db.refresh(user)

    # Issue JWT token
    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=format_user_out(user)
    )

@router.post("/login", response_model=Token)
async def login(
    login_in: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    # Lookup by username or email
    lookup = login_in.username_or_email.lower().strip()
    result = await db.execute(
        select(User).where(
            or_(User.email == lookup, User.username == lookup)
        )
    )
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive."
        )

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=format_user_out(user)
    )

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    """
    Clears / invalidates the active session.
    """
    return {"message": "Successfully logged out.", "user_id": current_user.id}

@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Returns authenticated user profile information.
    """
    return format_user_out(current_user)

@router.patch("/me", response_model=UserOut)
async def update_me(
    update_in: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if update_in.display_name is not None:
        current_user.display_name = update_in.display_name
    if update_in.bio is not None:
        current_user.bio = update_in.bio
    if update_in.avatar_url is not None:
        current_user.avatar_url = update_in.avatar_url

    await db.commit()
    await db.refresh(current_user)
    return format_user_out(current_user)
