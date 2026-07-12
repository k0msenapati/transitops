from datetime import date, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.driver import Driver, DriverStatus
from app.models.trip import Trip, TripStatus
from app.models.maintenance import MaintenanceLog, MaintenanceStatus
from app.models.expense import FuelLog, Expense, ExpenseType
from app.models.settings import DepotSettings

def seed_data():
    print("Clearing existing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding Users...")
        users = [
            User(email="manager@transitops.in", hashed_password=hash_password("manager123"), role=UserRole.FLEET_MANAGER, name="K Om Senapati"),
            User(email="dispatcher@transitops.in", hashed_password=hash_password("dispatcher123"), role=UserRole.DISPATCHER, name="Vikram (Dispatcher)"),
            User(email="safety@transitops.in", hashed_password=hash_password("safety123"), role=UserRole.SAFETY_OFFICER, name="Amit (Safety Officer)"),
            User(email="finance@transitops.in", hashed_password=hash_password("finance123"), role=UserRole.FINANCIAL_ANALYST, name="Suresh (Financial Analyst)")
        ]
        db.add_all(users)
        db.commit()

        print("Seeding Vehicles...")
        vehicles = [
            Vehicle(id=1, registration_number="GJ01V1234", model="Tata Ace Gold", type="Mini Truck", max_load_capacity=1000.0, odometer=12500.0, acquisition_cost=600000.0, status=VehicleStatus.AVAILABLE),
            Vehicle(id=2, registration_number="MH12AB5678", model="Mahindra Bolero MaxiTruck", type="Pickup", max_load_capacity=1500.0, odometer=45000.0, acquisition_cost=850000.0, status=VehicleStatus.ON_TRIP),
            Vehicle(id=3, registration_number="DL01XY9012", model="Eicher Pro 2049", type="Heavy Truck", max_load_capacity=5000.0, odometer=98000.0, acquisition_cost=1800000.0, status=VehicleStatus.IN_SHOP),
            Vehicle(id=4, registration_number="KA03M3344", model="Ashok Leyland Dost+", type="Mini Truck", max_load_capacity=1200.0, odometer=22000.0, acquisition_cost=700000.0, status=VehicleStatus.AVAILABLE),
            Vehicle(id=5, registration_number="HR26Z7788", model="BharatBenz 1917R", type="Heavy Truck", max_load_capacity=10000.0, odometer=150000.0, acquisition_cost=2800000.0, status=VehicleStatus.RETIRED)
        ]
        db.add_all(vehicles)
        db.commit()

        print("Seeding Drivers...")
        drivers = [
            Driver(id=1, name="Rahul Kumar", license_number="DL14202300001", license_category="HMV", license_expiry_date=date.today() + timedelta(days=730), contact_number="9999912345", safety_score=95.0, status=DriverStatus.AVAILABLE),
            Driver(id=2, name="Vikram Singh", license_number="MH12202200002", license_category="LMV", license_expiry_date=date.today() + timedelta(days=900), contact_number="9876543210", safety_score=88.0, status=DriverStatus.ON_TRIP),
            Driver(id=3, name="Amit Sharma", license_number="KA03202400003", license_category="HMV", license_expiry_date=date.today() + timedelta(days=365), contact_number="9123456789", safety_score=92.5, status=DriverStatus.AVAILABLE),
            Driver(id=4, name="Sandeep Yadav", license_number="HR26202100004", license_category="HMV", license_expiry_date=date.today() - timedelta(days=100), contact_number="8888877777", safety_score=78.0, status=DriverStatus.OFF_DUTY),
            Driver(id=5, name="Rajesh Patel", license_number="GJ01202300005", license_category="LMV", license_expiry_date=date.today() + timedelta(days=1000), contact_number="7777766666", safety_score=99.0, status=DriverStatus.SUSPENDED)
        ]
        db.add_all(drivers)
        db.commit()

        print("Seeding Trips & Fuel Logs...")
        # Completed Trip 1
        trip1 = Trip(id=1, source="Delhi", destination="Mumbai", vehicle_id=1, driver_id=1, cargo_weight=800.0, planned_distance=1400.0, actual_distance=1410.0, eta_minutes=1800, revenue=75000.0, status=TripStatus.COMPLETED)
        db.add(trip1)
        db.commit()
        fuel1 = FuelLog(vehicle_id=1, trip_id=1, liters=180.0, cost=16200.0, date=date.today() - timedelta(days=12))
        db.add(fuel1)

        # Dispatched Trip 2 (Active)
        trip2 = Trip(id=2, source="Pune", destination="Bangalore", vehicle_id=2, driver_id=2, cargo_weight=1200.0, planned_distance=840.0, eta_minutes=1100, revenue=48000.0, status=TripStatus.DISPATCHED)
        db.add(trip2)

        # Completed Trip 3
        trip3 = Trip(id=3, source="Ahmedabad", destination="Vadodara", vehicle_id=4, driver_id=3, cargo_weight=950.0, planned_distance=110.0, actual_distance=112.0, eta_minutes=150, revenue=8500.0, status=TripStatus.COMPLETED)
        db.add(trip3)
        db.commit()
        fuel3 = FuelLog(vehicle_id=4, trip_id=3, liters=15.0, cost=1350.0, date=date.today() - timedelta(days=8))
        db.add(fuel3)

        # Completed Trip 4
        trip4 = Trip(id=4, source="Gurgaon", destination="Jaipur", vehicle_id=1, driver_id=3, cargo_weight=700.0, planned_distance=270.0, actual_distance=275.0, eta_minutes=360, revenue=18000.0, status=TripStatus.COMPLETED)
        db.add(trip4)
        db.commit()
        fuel4 = FuelLog(vehicle_id=1, trip_id=4, liters=35.0, cost=3150.0, date=date.today() - timedelta(days=5))
        db.add(fuel4)

        # Draft Trip 5
        trip5 = Trip(id=5, source="Delhi", destination="Agra", vehicle_id=4, driver_id=1, cargo_weight=600.0, planned_distance=230.0, eta_minutes=300, revenue=12000.0, status=TripStatus.DRAFT)
        db.add(trip5)
        db.commit()

        print("Seeding Maintenance Logs...")
        maint_logs = [
            # Active in shop (Vehicle 3)
            MaintenanceLog(vehicle_id=3, description="Gearbox Overhaul", cost=35000.0, start_date=date.today() - timedelta(days=3), status=MaintenanceStatus.ACTIVE),
            # Completed services (Vehicle 1 & 2)
            MaintenanceLog(vehicle_id=1, description="Regular 10k Oil Change", cost=4500.0, start_date=date.today() - timedelta(days=15), end_date=date.today() - timedelta(days=14), status=MaintenanceStatus.CLOSED),
            MaintenanceLog(vehicle_id=2, description="Brake Pad Replacement", cost=8000.0, start_date=date.today() - timedelta(days=30), end_date=date.today() - timedelta(days=29), status=MaintenanceStatus.CLOSED)
        ]
        db.add_all(maint_logs)
        db.commit()

        print("Seeding Other Expenses...")
        expenses = [
            Expense(vehicle_id=1, trip_id=1, type=ExpenseType.TOLL, cost=4500.0, description="NH8 Highway Tolls", date=date.today() - timedelta(days=12)),
            Expense(vehicle_id=4, trip_id=3, type=ExpenseType.TOLL, cost=400.0, description="NE1 Expressway Toll", date=date.today() - timedelta(days=8)),
            Expense(vehicle_id=1, trip_id=4, type=ExpenseType.TOLL, cost=800.0, description="NH48 Toll Plaza", date=date.today() - timedelta(days=5))
        ]
        db.add_all(expenses)
        db.commit()

        print("Seeding Depot Settings...")
        settings = DepotSettings(id=1, depot_name="Gandhinagar Depot 624", currency="INR (₹)", distance_unit="Kilometers")
        db.add(settings)
        db.commit()

        print("Database seeded successfully with operational test records!")
    except Exception as e:
        print(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
