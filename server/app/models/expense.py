import enum
from sqlalchemy import Column, Integer, String, Float, Enum, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ExpenseType(str, enum.Enum):
    TOLL = "Toll"
    OTHER = "Other"


class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    liters = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    vehicle = relationship("Vehicle", backref="fuel_logs")
    trip = relationship("Trip", backref="fuel_logs")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    type = Column(Enum(ExpenseType), nullable=False, default=ExpenseType.TOLL)
    cost = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    date = Column(Date, nullable=False)

    vehicle = relationship("Vehicle", backref="expenses")
    trip = relationship("Trip", backref="expenses")
