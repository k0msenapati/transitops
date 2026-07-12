from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import UserRole
from app.models.driver import DriverStatus
from app.schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from app.services.fleet import fleet_service
from app.repository.driver import driver_repo
from app.utils.dependencies import RoleRequired

router = APIRouter(
    dependencies=[
        Depends(RoleRequired([UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER]))
    ]
)


@router.get("", response_model=list[DriverResponse])
def get_drivers(
    status: DriverStatus | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
):
    return driver_repo.get_filtered_drivers(db, status=status, category=category)


@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(driver_in: DriverCreate, db: Session = Depends(get_db)):
    try:
        return fleet_service.register_driver(db, driver_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{id}", response_model=DriverResponse)
def get_driver_by_id(id: int, db: Session = Depends(get_db)):
    driver = driver_repo.get(db, id)
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found"
        )
    return driver


@router.put("/{id}", response_model=DriverResponse)
def update_driver(id: int, driver_in: DriverUpdate, db: Session = Depends(get_db)):
    driver = driver_repo.get(db, id)
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found"
        )

    # Check license number uniqueness if it is changing
    if driver_in.license_number and driver_in.license_number != driver.license_number:
        existing = driver_repo.get_by_license_number(db, driver_in.license_number)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver license number must be unique",
            )

    return driver_repo.update(db, driver, driver_in.model_dump(exclude_unset=True))


@router.delete("/{id}", response_model=DriverResponse)
def delete_driver(id: int, db: Session = Depends(get_db)):
    driver = driver_repo.get(db, id)
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found"
        )
    return driver_repo.remove(db, id)
