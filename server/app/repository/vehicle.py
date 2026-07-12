from sqlalchemy.orm import Session
from app.repository.base import BaseRepository
from app.models.vehicle import Vehicle, VehicleStatus


class VehicleRepository(BaseRepository[Vehicle]):
    def __init__(self):
        super().__init__(Vehicle)

    def get_by_registration_number(
        self, db: Session, registration_number: str
    ) -> Vehicle | None:
        return (
            db.query(self.model)
            .filter(self.model.registration_number == registration_number)
            .first()
        )

    def get_filtered_vehicles(
        self, db: Session, status: VehicleStatus | None = None, type: str | None = None
    ) -> list[Vehicle]:
        query = db.query(self.model)
        if status:
            query = query.filter(self.model.status == status)
        if type:
            query = query.filter(self.model.type == type)
        return query.all()


vehicle_repo = VehicleRepository()
