from fastapi import APIRouter
from app.routers import auth, users

base_router = APIRouter()

base_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
base_router.include_router(users.router, prefix="/users", tags=["Users"])
