from fastapi import APIRouter
from app.api.v1.endpoints import auth, oauth, health, book_clubs, discussions, collections

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(oauth.router)
api_router.include_router(book_clubs.router, prefix="/clubs", tags=["Book Clubs"])
api_router.include_router(discussions.router, prefix="/discussions", tags=["Discussions"])
api_router.include_router(collections.router, prefix="/collections", tags=["Shared Collections"])


