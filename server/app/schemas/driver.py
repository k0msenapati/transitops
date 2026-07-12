from datetime import date
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.driver import DriverStatus


class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    trip_completion_rate: float = 100.0
    safety_score: float = 100.0
    status: DriverStatus = DriverStatus.AVAILABLE

    # Support string input parsing to date type
    @field_validator("license_expiry_date", mode="before")
    @classmethod
    def parse_expiry_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    name: str | None = None
    license_number: str | None = None
    license_category: str | None = None
    license_expiry_date: date | None = None
    contact_number: str | None = None
    trip_completion_rate: float | None = None
    safety_score: float | None = None
    status: DriverStatus | None = None

    # Support string input parsing to date type
    @field_validator("license_expiry_date", mode="before")
    @classmethod
    def parse_expiry_date(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class DriverResponse(DriverBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
