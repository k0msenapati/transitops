from sqlalchemy.orm import Session
from app.repository.base import BaseRepository
from app.models.trip import Trip


class TripRepository(BaseRepository[Trip]):
    def __init__(self):
        super().__init__(Trip)

    def get_live_board(self, db: Session) -> list[Trip]:
        return db.query(self.model).order_by(self.model.created_at.desc()).all()


trip_repo = TripRepository()
