from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.trip import TripStatus
from app.schemas.vehicle import VehicleResponse
from app.schemas.driver import DriverResponse


class TripBase(BaseModel):
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float  # in kg
    planned_distance: float  # in km
    eta_minutes: int | None = None
    revenue: float = 0.0


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    source: str | None = None
    destination: str | None = None
    vehicle_id: int | None = None
    driver_id: int | None = None
    cargo_weight: float | None = None
    planned_distance: float | None = None
    eta_minutes: int | None = None
    revenue: float | None = None
    status: TripStatus | None = None
    notes: str | None = None


class TripResponse(TripBase):
    id: int
    actual_distance: float
    status: TripStatus
    notes: str | None = None
    created_at: datetime
    dispatched_at: datetime | None = None
    completed_at: datetime | None = None

    vehicle: VehicleResponse | None = None
    driver: DriverResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class TripComplete(BaseModel):
    final_odometer: float
    fuel_liters: float
    fuel_cost: float
    revenue: float | None = None


class TripCancel(BaseModel):
    notes: str | None = None
