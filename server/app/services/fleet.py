from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.schemas.vehicle import VehicleCreate
from app.schemas.driver import DriverCreate
from app.repository.vehicle import vehicle_repo
from app.repository.driver import driver_repo


class FleetService:
    def register_vehicle(self, db: Session, vehicle_in: VehicleCreate) -> Vehicle:
        existing = vehicle_repo.get_by_registration_number(
            db, vehicle_in.registration_number
        )
        if existing:
            raise ValueError("Vehicle registration number must be unique")
        return vehicle_repo.create(db, vehicle_in)

    def register_driver(self, db: Session, driver_in: DriverCreate) -> Driver:
        existing = driver_repo.get_by_license_number(db, driver_in.license_number)
        if existing:
            raise ValueError("Driver license number must be unique")
        return driver_repo.create(db, driver_in)


fleet_service = FleetService()
