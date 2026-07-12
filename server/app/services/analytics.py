# mypy: ignore-errors
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.driver import Driver, DriverStatus
from app.models.trip import Trip, TripStatus
from app.models.maintenance import MaintenanceLog
from app.models.expense import FuelLog, Expense


class AnalyticsService:
    def get_dashboard_stats(self, db: Session) -> dict:
        # Asset status counts
        avail_vehicles = (
            db.query(func.count(Vehicle.id))
            .filter(Vehicle.status == VehicleStatus.AVAILABLE)
            .scalar()
            or 0
        )
        trip_vehicles = (
            db.query(func.count(Vehicle.id))
            .filter(Vehicle.status == VehicleStatus.ON_TRIP)
            .scalar()
            or 0
        )
        shop_vehicles = (
            db.query(func.count(Vehicle.id))
            .filter(Vehicle.status == VehicleStatus.IN_SHOP)
            .scalar()
            or 0
        )
        retired_vehicles = (
            db.query(func.count(Vehicle.id))
            .filter(Vehicle.status == VehicleStatus.RETIRED)
            .scalar()
            or 0
        )

        active_trips = (
            db.query(func.count(Trip.id))
            .filter(Trip.status == TripStatus.DISPATCHED)
            .scalar()
            or 0
        )
        pending_trips = (
            db.query(func.count(Trip.id))
            .filter(Trip.status == TripStatus.DRAFT)
            .scalar()
            or 0
        )
        drivers_on_duty = (
            db.query(func.count(Driver.id))
            .filter(Driver.status == DriverStatus.ON_TRIP)
            .scalar()
            or 0
        )

        # Fleet Utilization: Vehicles On Trip / Total Active (Non-Retired) Vehicles
        total_active_fleet = avail_vehicles + trip_vehicles + shop_vehicles
        fleet_utilization = 0.0
        if total_active_fleet > 0:
            fleet_utilization = (trip_vehicles / total_active_fleet) * 100

        # Financial Metrics
        total_revenue = (
            db.query(func.sum(Trip.revenue))
            .filter(Trip.status == TripStatus.COMPLETED)
            .scalar()
            or 0.0
        )

        fuel_expense = db.query(func.sum(FuelLog.cost)).scalar() or 0.0
        other_expense = db.query(func.sum(Expense.cost)).scalar() or 0.0
        maintenance_expense = db.query(func.sum(MaintenanceLog.cost)).scalar() or 0.0

        total_expenses = fuel_expense + other_expense + maintenance_expense
        net_profit = total_revenue - total_expenses

        profit_margin = 0.0
        if total_revenue > 0:
            profit_margin = (net_profit / total_revenue) * 100

        return {
            "active_vehicles": trip_vehicles,
            "available_vehicles": avail_vehicles,
            "vehicles_in_maintenance": shop_vehicles,
            "retired_vehicles": retired_vehicles,
            "active_trips": active_trips,
            "pending_trips": pending_trips,
            "drivers_on_duty": drivers_on_duty,
            "fleet_utilization": round(fleet_utilization, 2),
            "total_revenue": round(total_revenue, 2),
            "total_expenses": round(total_expenses, 2),
            "net_profit": round(net_profit, 2),
            "profit_margin": round(profit_margin, 2),
        }

    def get_vehicle_reports(self, db: Session) -> list[dict]:
        vehicles = db.query(Vehicle).all()
        report_data = []

        for v in vehicles:
            # 1. Total Distance Travelled (completed trips only)
            distance = (
                db.query(func.sum(Trip.actual_distance))
                .filter(Trip.vehicle_id == v.id, Trip.status == TripStatus.COMPLETED)
                .scalar()
                or 0.0
            )

            # 2. Total Revenue (completed trips only)
            revenue = (
                db.query(func.sum(Trip.revenue))
                .filter(Trip.vehicle_id == v.id, Trip.status == TripStatus.COMPLETED)
                .scalar()
                or 0.0
            )

            # 3. Fuel consumed & Cost
            fuel_liters = (
                db.query(func.sum(FuelLog.liters))
                .filter(FuelLog.vehicle_id == v.id)
                .scalar()
                or 0.0
            )
            fuel_cost = (
                db.query(func.sum(FuelLog.cost))
                .filter(FuelLog.vehicle_id == v.id)
                .scalar()
                or 0.0
            )

            # 4. Other Expenses
            other_cost = (
                db.query(func.sum(Expense.cost))
                .filter(Expense.vehicle_id == v.id)
                .scalar()
                or 0.0
            )

            # 5. Maintenance Expenses
            maint_cost = (
                db.query(func.sum(MaintenanceLog.cost))
                .filter(MaintenanceLog.vehicle_id == v.id)
                .scalar()
                or 0.0
            )

            total_expenses = fuel_cost + other_cost + maint_cost
            net_profit = revenue - total_expenses

            # Fuel Efficiency: Distance / Fuel (km/L)
            fuel_efficiency = 0.0
            if fuel_liters > 0:
                fuel_efficiency = distance / fuel_liters

            # ROI: (Revenue - (Maintenance + Fuel)) / AcquisitionCost * 100
            roi = 0.0
            if v.acquisition_cost > 0:
                roi = ((revenue - (maint_cost + fuel_cost)) / v.acquisition_cost) * 100

            report_data.append(
                {
                    "vehicle_id": v.id,
                    "registration_number": v.registration_number,
                    "model": v.model,
                    "type": v.type,
                    "distance_travelled": round(distance, 2),
                    "revenue": round(revenue, 2),
                    "expenses": round(total_expenses, 2),
                    "net_profit": round(net_profit, 2),
                    "fuel_efficiency": round(fuel_efficiency, 2),
                    "roi": round(roi, 2),
                }
            )

        return report_data


analytics_service = AnalyticsService()
