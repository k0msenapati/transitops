from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import UserRole
from app.utils.dependencies import RoleRequired
from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceClose,
    MaintenanceResponse,
)
from app.services.maintenance import maintenance_service
from app.repository.maintenance import maintenance_repo

router = APIRouter(
    tags=["maintenance"], dependencies=[Depends(RoleRequired([UserRole.FLEET_MANAGER]))]
)


@router.post(
    "", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED
)
def create_log(log_in: MaintenanceCreate, db: Session = Depends(get_db)):
    try:
        return maintenance_service.create_log(db, log_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{log_id}/close", response_model=MaintenanceResponse)
def close_log(log_id: int, close_in: MaintenanceClose, db: Session = Depends(get_db)):
    try:
        return maintenance_service.close_log(db, log_id, close_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[MaintenanceResponse])
def list_logs(db: Session = Depends(get_db)):
    return maintenance_repo.get_all(db)


@router.get("/{log_id}", response_model=MaintenanceResponse)
def get_log(log_id: int, db: Session = Depends(get_db)):
    log = maintenance_repo.get(db, log_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance log not found"
        )
    return log
