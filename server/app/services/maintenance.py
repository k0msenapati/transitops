# mypy: ignore-errors
from sqlalchemy.orm import Session
from app.models.maintenance import MaintenanceLog, MaintenanceStatus
from app.models.vehicle import VehicleStatus
from app.schemas.maintenance import MaintenanceCreate, MaintenanceClose
from app.repository.maintenance import maintenance_repo
from app.repository.vehicle import vehicle_repo


class MaintenanceService:
    def create_log(self, db: Session, log_in: MaintenanceCreate) -> MaintenanceLog:
        vehicle = vehicle_repo.get(db, log_in.vehicle_id)
        if not vehicle:
            raise ValueError("Vehicle not found")
        if vehicle.status != VehicleStatus.AVAILABLE:
            raise ValueError(
                f"Vehicle status is '{vehicle.status.value}', must be 'Available' to enter maintenance"
            )

        # Create active log
        db_obj = MaintenanceLog(
            vehicle_id=log_in.vehicle_id,
            description=log_in.description,
            cost=log_in.cost,
            start_date=log_in.start_date,
            status=MaintenanceStatus.ACTIVE,
        )
        log = maintenance_repo.create(db, db_obj)

        # Toggle vehicle status
        vehicle.status = VehicleStatus.IN_SHOP
        db.add(vehicle)
        db.commit()
        db.refresh(log)
        return log

    def close_log(
        self, db: Session, log_id: int, close_in: MaintenanceClose
    ) -> MaintenanceLog:
        log = maintenance_repo.get(db, log_id)
        if not log:
            raise ValueError("Maintenance log not found")
        if log.status != MaintenanceStatus.ACTIVE:
            raise ValueError("Maintenance log is already closed")

        if close_in.end_date < log.start_date:
            raise ValueError("End date cannot be before start date")

        # Update log
        log.status = MaintenanceStatus.CLOSED
        log.end_date = close_in.end_date
        if close_in.cost is not None:
            log.cost = close_in.cost

        # Restore vehicle status
        vehicle = vehicle_repo.get(db, log.vehicle_id)
        if vehicle and vehicle.status == VehicleStatus.IN_SHOP:
            vehicle.status = VehicleStatus.AVAILABLE
            db.add(vehicle)

        db.add(log)
        db.commit()
        db.refresh(log)
        return log


maintenance_service = MaintenanceService()
