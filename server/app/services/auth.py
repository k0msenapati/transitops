from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate
from app.repository.user import user_repo


class AuthService:
    def register_user(self, db: Session, user_in: UserCreate) -> User:
        existing_user = user_repo.get_by_email(db, email=user_in.email)
        if existing_user:
            raise ValueError("Email already registered")

        hashed_password = hash_password(user_in.password)
        db_obj = User(
            email=user_in.email,
            hashed_password=hashed_password,
            role=user_in.role,
            name=user_in.name,
        )
        return user_repo.create(db, db_obj)

    def authenticate_user(self, db: Session, email: str, password: str) -> User | None:
        user = user_repo.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(str(user.hashed_password), password):
            return None
        return user

    def create_token_for_user(self, user: User) -> str:
        payload = {"sub": user.email, "role": user.role.value}
        return create_access_token(payload)


auth_service = AuthService()
