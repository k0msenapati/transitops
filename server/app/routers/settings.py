from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import UserRole
from app.utils.dependencies import RoleRequired
from app.schemas.settings import DepotSettingsUpdate, DepotSettingsResponse
from app.repository.settings import settings_repo
from app.models.settings import DepotSettings

router = APIRouter(
    tags=["settings"], dependencies=[Depends(RoleRequired([UserRole.FLEET_MANAGER]))]
)


@router.get("", response_model=DepotSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = settings_repo.get(db, 1)
    if not settings:
        # Initialize default row
        settings = DepotSettings(
            id=1,
            depot_name="Gandhinagar Depot 624",
            currency="INR (Rs)",
            distance_unit="Kilometers",
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("", response_model=DepotSettingsResponse)
def update_settings(settings_in: DepotSettingsUpdate, db: Session = Depends(get_db)):
    settings = settings_repo.get(db, 1)
    if not settings:
        settings = DepotSettings(
            id=1,
            depot_name="Gandhinagar Depot 624",
            currency="INR (Rs)",
            distance_unit="Kilometers",
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings_repo.update(db, db_obj=settings, obj_in=settings_in)
