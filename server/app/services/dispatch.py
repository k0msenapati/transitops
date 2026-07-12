# mypy: ignore-errors
from datetime import datetime, date, timezone
from sqlalchemy.orm import Session
from app.models.trip import Trip, TripStatus
from app.models.vehicle import VehicleStatus
from app.models.driver import DriverStatus
from app.models.expense import FuelLog
from app.schemas.trip import TripCreate, TripComplete, TripCancel
from app.repository.trip import trip_repo
from app.repository.vehicle import vehicle_repo
from app.repository.driver import driver_repo


class DispatchService:
    def create_trip(self, db: Session, trip_in: TripCreate) -> Trip:
        vehicle = vehicle_repo.get(db, trip_in.vehicle_id)
        if not vehicle:
            raise ValueError("Vehicle not found")
        driver = driver_repo.get(db, trip_in.driver_id)
        if not driver:
            raise ValueError("Driver not found")

        # Create trip as Draft
        db_obj = Trip(
            source=trip_in.source,
            destination=trip_in.destination,
            vehicle_id=trip_in.vehicle_id,
            driver_id=trip_in.driver_id,
            cargo_weight=trip_in.cargo_weight,
            planned_distance=trip_in.planned_distance,
            eta_minutes=trip_in.eta_minutes,
            revenue=trip_in.revenue,
            status=TripStatus.DRAFT,
        )
        return trip_repo.create(db, db_obj)

    def dispatch_trip(self, db: Session, trip_id: int) -> Trip:
        trip = trip_repo.get(db, trip_id)
        if not trip:
            raise ValueError("Trip not found")
        if trip.status != TripStatus.DRAFT:
            raise ValueError("Only draft trips can be dispatched")

        vehicle = vehicle_repo.get(db, trip.vehicle_id)
        if not vehicle:
            raise ValueError("Vehicle not found")
        driver = driver_repo.get(db, trip.driver_id)
        if not driver:
            raise ValueError("Driver not found")

        # 1. Cargo weight check
        if trip.cargo_weight > vehicle.max_load_capacity:
            raise ValueError(
                f"Cargo weight ({trip.cargo_weight} kg) exceeds vehicle maximum capacity ({vehicle.max_load_capacity} kg)"
            )

        # 2. Vehicle status availability check
        if vehicle.status != VehicleStatus.AVAILABLE:
            raise ValueError(
                f"Vehicle status is '{vehicle.status.value}', must be 'Available'"
            )

        # 3. Driver status availability check
        if driver.status != DriverStatus.AVAILABLE:
            raise ValueError(
                f"Driver status is '{driver.status.value}', must be 'Available'"
            )

        # 4. Driver license expiry check
        if driver.license_expiry_date < date.today():
            raise ValueError("Driver driving license has expired")

        # 5. Check if driver or vehicle is already double booked in active dispatched trips
        # (Though status check should prevent it, let's be double safe)
        active_veh_trips = (
            db.query(Trip)
            .filter(Trip.vehicle_id == vehicle.id, Trip.status == TripStatus.DISPATCHED)
            .first()
        )
        if active_veh_trips:
            raise ValueError("Vehicle is already assigned to an active dispatched trip")
        active_dr_trips = (
            db.query(Trip)
            .filter(Trip.driver_id == driver.id, Trip.status == TripStatus.DISPATCHED)
            .first()
        )
        if active_dr_trips:
            raise ValueError("Driver is already assigned to an active dispatched trip")

        # Updates
        trip.status = TripStatus.DISPATCHED
        trip.dispatched_at = datetime.now(timezone.utc).replace(tzinfo=None)

        vehicle.status = VehicleStatus.ON_TRIP
        driver.status = DriverStatus.ON_TRIP

        db.add(trip)
        db.add(vehicle)
        db.add(driver)
        db.commit()
        db.refresh(trip)
        return trip

    def complete_trip(
        self, db: Session, trip_id: int, complete_in: TripComplete
    ) -> Trip:
        trip = trip_repo.get(db, trip_id)
        if not trip:
            raise ValueError("Trip not found")
        if trip.status != TripStatus.DISPATCHED:
            raise ValueError("Only dispatched trips can be completed")

        vehicle = vehicle_repo.get(db, trip.vehicle_id)
        if not vehicle:
            raise ValueError("Vehicle not found")
        driver = driver_repo.get(db, trip.driver_id)
        if not driver:
            raise ValueError("Driver not found")

        # Odometer check
        if complete_in.final_odometer < vehicle.odometer:
            raise ValueError(
                f"Final odometer ({complete_in.final_odometer}) cannot be less than initial odometer ({vehicle.odometer})"
            )

        actual_dist = complete_in.final_odometer - vehicle.odometer
        vehicle.odometer = complete_in.final_odometer

        # Create Fuel Log
        fuel_log = FuelLog(
            vehicle_id=vehicle.id,
            trip_id=trip.id,
            liters=complete_in.fuel_liters,
            cost=complete_in.fuel_cost,
            date=date.today(),
        )
        db.add(fuel_log)

        # Update Trip status
        trip.status = TripStatus.COMPLETED
        trip.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
        trip.actual_distance = actual_dist
        if complete_in.revenue is not None:
            trip.revenue = complete_in.revenue

        # Revert vehicle and driver statuses to Available
        vehicle.status = VehicleStatus.AVAILABLE
        driver.status = DriverStatus.AVAILABLE

        db.add(trip)
        db.add(vehicle)
        db.add(driver)
        db.commit()
        db.refresh(trip)
        return trip

    def cancel_trip(self, db: Session, trip_id: int, cancel_in: TripCancel) -> Trip:
        trip = trip_repo.get(db, trip_id)
        if not trip:
            raise ValueError("Trip not found")
        if trip.status not in (TripStatus.DRAFT, TripStatus.DISPATCHED):
            raise ValueError("Only draft or dispatched trips can be cancelled")

        # If dispatched, restore vehicle and driver to Available
        if trip.status == TripStatus.DISPATCHED:
            vehicle = vehicle_repo.get(db, trip.vehicle_id)
            driver = driver_repo.get(db, trip.driver_id)
            if vehicle:
                vehicle.status = VehicleStatus.AVAILABLE
                db.add(vehicle)
            if driver:
                driver.status = DriverStatus.AVAILABLE
                db.add(driver)

        trip.status = TripStatus.CANCELLED
        trip.notes = cancel_in.notes

        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip


dispatch_service = DispatchService()
