from fastapi import APIRouter
from app.routers import (
    auth,
    users,
    vehicles,
    drivers,
    trips,
    maintenance,
    expenses,
    analytics,
    settings,
)

base_router = APIRouter()

base_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
base_router.include_router(users.router, prefix="/users", tags=["Users"])
base_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
base_router.include_router(drivers.router, prefix="/drivers", tags=["Drivers"])
base_router.include_router(trips.router, prefix="/trips", tags=["Trips"])
base_router.include_router(
    maintenance.router, prefix="/maintenance", tags=["Maintenance"]
)
base_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
base_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
base_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
