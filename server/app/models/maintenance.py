import enum
from sqlalchemy import Column, Integer, String, Float, Enum, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class MaintenanceStatus(str, enum.Enum):
    ACTIVE = "Active"
    CLOSED = "Closed"


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    description = Column(
        String, nullable=False
    )  # Service type, e.g., Oil Change, Tyre Replace
    cost = Column(Float, nullable=False, default=0.0)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(
        Enum(MaintenanceStatus), nullable=False, default=MaintenanceStatus.ACTIVE
    )

    vehicle = relationship("Vehicle", backref="maintenance_logs")
