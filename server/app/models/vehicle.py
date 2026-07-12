import enum
from sqlalchemy import Column, Integer, String, Float, Enum
from app.core.database import Base


class VehicleStatus(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    RETIRED = "Retired"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    model = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., Van, Truck, Mini
    max_load_capacity = Column(Float, nullable=False)  # in kg
    odometer = Column(Float, nullable=False, default=0.0)  # in km
    acquisition_cost = Column(Float, nullable=False, default=0.0)
    status = Column(
        Enum(VehicleStatus), nullable=False, default=VehicleStatus.AVAILABLE
    )
