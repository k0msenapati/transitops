from datetime import date
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.expense import ExpenseType


class FuelLogBase(BaseModel):
    vehicle_id: int
    trip_id: int | None = None
    liters: float
    cost: float
    date: date

    model_config = ConfigDict(from_attributes=True)

    @field_validator("date", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class FuelLogCreate(FuelLogBase):
    pass


class FuelLogResponse(FuelLogBase):
    id: int


class ExpenseBase(BaseModel):
    vehicle_id: int
    trip_id: int | None = None
    type: ExpenseType = ExpenseType.TOLL
    cost: float
    description: str
    date: date

    model_config = ConfigDict(from_attributes=True)

    @field_validator("date", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: int
