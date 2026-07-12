from app.repository.base import BaseRepository
from app.models.settings import DepotSettings


class DepotSettingsRepository(BaseRepository[DepotSettings]):
    pass


settings_repo = DepotSettingsRepository(DepotSettings)
