from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import UserRole
from app.models.vehicle import VehicleStatus
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.services.fleet import fleet_service
from app.repository.vehicle import vehicle_repo
from app.utils.dependencies import RoleRequired, get_current_user

router = APIRouter()


@router.get("", response_model=list[VehicleResponse], dependencies=[Depends(get_current_user)])
def get_vehicles(
    status: VehicleStatus | None = None,
    type: str | None = None,
    db: Session = Depends(get_db),
):
    return vehicle_repo.get_filtered_vehicles(db, status=status, type=type)


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(RoleRequired([UserRole.FLEET_MANAGER]))])
def create_vehicle(vehicle_in: VehicleCreate, db: Session = Depends(get_db)):
    try:
        return fleet_service.register_vehicle(db, vehicle_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{id}", response_model=VehicleResponse, dependencies=[Depends(get_current_user)])
def get_vehicle_by_id(id: int, db: Session = Depends(get_db)):
    vehicle = vehicle_repo.get(db, id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
        )
    return vehicle


@router.put("/{id}", response_model=VehicleResponse, dependencies=[Depends(RoleRequired([UserRole.FLEET_MANAGER]))])
def update_vehicle(id: int, vehicle_in: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = vehicle_repo.get(db, id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
        )

    if (
        vehicle_in.registration_number
        and vehicle_in.registration_number != vehicle.registration_number
    ):
        existing = vehicle_repo.get_by_registration_number(
            db, vehicle_in.registration_number
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle registration number must be unique",
            )

    return vehicle_repo.update(db, vehicle, vehicle_in.model_dump(exclude_unset=True))


@router.delete("/{id}", response_model=VehicleResponse, dependencies=[Depends(RoleRequired([UserRole.FLEET_MANAGER]))])
def delete_vehicle(id: int, db: Session = Depends(get_db)):
    vehicle = vehicle_repo.get(db, id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
        )
    return vehicle_repo.remove(db, id)

