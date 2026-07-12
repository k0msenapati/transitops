from sqlalchemy import Column, Integer, String
from app.core.database import Base


class DepotSettings(Base):
    __tablename__ = "depot_settings"

    id = Column(Integer, primary_key=True, index=True)
    depot_name = Column(String, default="Gandhinagar Depot 624", nullable=False)
    currency = Column(String, default="INR (Rs)", nullable=False)
    distance_unit = Column(String, default="Kilometers", nullable=False)
