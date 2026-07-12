from datetime import date
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.maintenance import MaintenanceStatus


class MaintenanceBase(BaseModel):
    vehicle_id: int
    description: str
    cost: float = 0.0
    start_date: date
    end_date: date | None = None
    status: MaintenanceStatus = MaintenanceStatus.ACTIVE

    model_config = ConfigDict(from_attributes=True)

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def parse_dates(cls, v):
        if isinstance(v, str):
            if not v:
                return None
            return date.fromisoformat(v)
        return v


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    description: str
    cost: float = 0.0
    start_date: date

    @field_validator("start_date", mode="before")
    @classmethod
    def parse_start_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class MaintenanceClose(BaseModel):
    end_date: date
    cost: float | None = None

    @field_validator("end_date", mode="before")
    @classmethod
    def parse_end_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class MaintenanceResponse(MaintenanceBase):
    id: int
