from pydantic import BaseModel, ConfigDict
from app.models.vehicle import VehicleStatus


class VehicleBase(BaseModel):
    registration_number: str
    model: str
    type: str
    max_load_capacity: float
    odometer: float = 0.0
    acquisition_cost: float = 0.0
    status: VehicleStatus = VehicleStatus.AVAILABLE


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    registration_number: str | None = None
    model: str | None = None
    type: str | None = None
    max_load_capacity: float | None = None
    odometer: float | None = None
    acquisition_cost: float | None = None
    status: VehicleStatus | None = None


class VehicleResponse(VehicleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
