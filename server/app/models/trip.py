import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class TripStatus(str, enum.Enum):
    DRAFT = "Draft"
    DISPATCHED = "Dispatched"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    cargo_weight = Column(Float, nullable=False)  # in kg
    planned_distance = Column(Float, nullable=False)  # in km
    actual_distance = Column(
        Float, nullable=False, default=0.0
    )  # in km (entered on completion)
    revenue = Column(Float, nullable=False, default=0.0)
    status = Column(Enum(TripStatus), nullable=False, default=TripStatus.DRAFT)
    eta_minutes = Column(Integer, nullable=True)  # ETA in minutes
    notes = Column(String, nullable=True)  # notes or cancellation reason
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    dispatched_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    vehicle = relationship("Vehicle", backref="trips")
    driver = relationship("Driver", backref="trips")
