from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import UserRole
from app.utils.dependencies import RoleRequired
from app.schemas.expense import (
    FuelLogCreate,
    FuelLogResponse,
    ExpenseCreate,
    ExpenseResponse,
)
from app.repository.expense import fuel_log_repo, expense_repo
from app.repository.vehicle import vehicle_repo

router = APIRouter(
    tags=["expenses"],
    dependencies=[
        Depends(RoleRequired([UserRole.FLEET_MANAGER, UserRole.FINANCIAL_ANALYST]))
    ],
)


@router.post(
    "/fuel", response_model=FuelLogResponse, status_code=status.HTTP_201_CREATED
)
def create_fuel_log(log_in: FuelLogCreate, db: Session = Depends(get_db)):
    vehicle = vehicle_repo.get(db, log_in.vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
        )
    return fuel_log_repo.create(db, log_in)


@router.get("/fuel", response_model=list[FuelLogResponse])
def get_fuel_logs(db: Session = Depends(get_db)):
    return fuel_log_repo.get_all(db)


@router.post(
    "/other", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED
)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    vehicle = vehicle_repo.get(db, expense_in.vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
        )
    return expense_repo.create(db, expense_in)


@router.get("/other", response_model=list[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    return expense_repo.get_all(db)
