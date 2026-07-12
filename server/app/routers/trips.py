from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import UserRole
from app.models.trip import TripStatus
from app.schemas.trip import TripCreate, TripResponse, TripComplete, TripCancel
from app.services.dispatch import dispatch_service
from app.repository.trip import trip_repo
from app.utils.dependencies import RoleRequired

router = APIRouter(
    dependencies=[Depends(RoleRequired([UserRole.FLEET_MANAGER, UserRole.DISPATCHER]))]
)


@router.get("", response_model=list[TripResponse])
def get_trips(status: TripStatus | None = None, db: Session = Depends(get_db)):
    if status:
        return db.query(trip_repo.model).filter(trip_repo.model.status == status).all()
    return trip_repo.get_all(db)


@router.get("/live", response_model=list[TripResponse])
def get_live_board(db: Session = Depends(get_db)):
    return trip_repo.get_live_board(db)


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(trip_in: TripCreate, db: Session = Depends(get_db)):
    try:
        return dispatch_service.create_trip(db, trip_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{id}", response_model=TripResponse)
def get_trip_by_id(id: int, db: Session = Depends(get_db)):
    trip = trip_repo.get(db, id)
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found"
        )
    return trip


@router.post("/{id}/dispatch", response_model=TripResponse)
def dispatch_trip(id: int, db: Session = Depends(get_db)):
    try:
        return dispatch_service.dispatch_trip(db, id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{id}/complete", response_model=TripResponse)
def complete_trip(id: int, complete_in: TripComplete, db: Session = Depends(get_db)):
    try:
        return dispatch_service.complete_trip(db, id, complete_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{id}/cancel", response_model=TripResponse)
def cancel_trip(id: int, cancel_in: TripCancel, db: Session = Depends(get_db)):
    try:
        return dispatch_service.cancel_trip(db, id, cancel_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
