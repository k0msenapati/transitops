import enum
from sqlalchemy import Column, Integer, String, Float, Enum, Date
from app.core.database import Base


class DriverStatus(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=False)  # e.g., LMV, HMV
    license_expiry_date = Column(Date, nullable=False)
    contact_number = Column(String, nullable=False)
    trip_completion_rate = Column(
        Float, nullable=False, default=100.0
    )  # e.g., 96.0 for 96%
    safety_score = Column(Float, nullable=False, default=100.0)  # e.g., 96.0 for 96%
    status = Column(Enum(DriverStatus), nullable=False, default=DriverStatus.AVAILABLE)
