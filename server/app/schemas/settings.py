from pydantic import BaseModel, ConfigDict


class DepotSettingsBase(BaseModel):
    depot_name: str
    currency: str
    distance_unit: str

    model_config = ConfigDict(from_attributes=True)


class DepotSettingsUpdate(BaseModel):
    depot_name: str | None = None
    currency: str | None = None
    distance_unit: str | None = None


class DepotSettingsResponse(DepotSettingsBase):
    id: int
