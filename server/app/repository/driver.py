from sqlalchemy.orm import Session
from app.repository.base import BaseRepository
from app.models.driver import Driver, DriverStatus


class DriverRepository(BaseRepository[Driver]):
    def __init__(self):
        super().__init__(Driver)

    def get_by_license_number(self, db: Session, license_number: str) -> Driver | None:
        return (
            db.query(self.model)
            .filter(self.model.license_number == license_number)
            .first()
        )

    def get_filtered_drivers(
        self,
        db: Session,
        status: DriverStatus | None = None,
        category: str | None = None,
    ) -> list[Driver]:
        query = db.query(self.model)
        if status:
            query = query.filter(self.model.status == status)
        if category:
            query = query.filter(self.model.license_category == category)
        return query.all()


driver_repo = DriverRepository()
