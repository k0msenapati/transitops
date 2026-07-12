from app.repository.base import BaseRepository
from app.models.maintenance import MaintenanceLog


class MaintenanceRepository(BaseRepository[MaintenanceLog]):
    pass


maintenance_repo = MaintenanceRepository(MaintenanceLog)
