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
            Vehicle(id=5, registration_number="HR26Z7788", model="BharatBenz 1917R", type="Heavy Truck", max_load_capacity=10000.0, odometer=150000.0, acquisition_cost=2800000.0, status=VehicleStatus.RETIRED),
            
            # Frontend Mock Vehicles
            Vehicle(id=6, registration_number="GJ01AB452", model="VAN-05", type="Van", max_load_capacity=500.0, odometer=74000.0, acquisition_cost=620000.0, status=VehicleStatus.AVAILABLE),
            Vehicle(id=7, registration_number="GJ01AB998", model="TRUCK-11", type="Truck", max_load_capacity=5000.0, odometer=182000.0, acquisition_cost=2450000.0, status=VehicleStatus.ON_TRIP),
            Vehicle(id=8, registration_number="GJ01AB1120", model="MINI-03", type="Mini", max_load_capacity=1000.0, odometer=66000.0, acquisition_cost=410000.0, status=VehicleStatus.IN_SHOP),
            Vehicle(id=9, registration_number="GJ01AB0008", model="VAN-09", type="Van", max_load_capacity=750.0, odometer=241900.0, acquisition_cost=590000.0, status=VehicleStatus.RETIRED),
            Vehicle(id=10, registration_number="GJ01AB1212", model="TRUCK-12", type="Truck", max_load_capacity=10000.0, odometer=15000.0, acquisition_cost=3200000.0, status=VehicleStatus.AVAILABLE)
        ]
        db.add_all(vehicles)
        db.commit()

        print("Seeding Drivers...")
        drivers = [
            Driver(id=1, name="Rahul Kumar", license_number="DL14202300001", license_category="HMV", license_expiry_date=date.today() + timedelta(days=730), contact_number="9999912345", safety_score=95.0, status=DriverStatus.AVAILABLE),
            Driver(id=2, name="Vikram Singh", license_number="MH12202200002", license_category="LMV", license_expiry_date=date.today() + timedelta(days=900), contact_number="9876543210", safety_score=88.0, status=DriverStatus.ON_TRIP),
            Driver(id=3, name="Amit Sharma", license_number="KA03202400003", license_category="HMV", license_expiry_date=date.today() + timedelta(days=365), contact_number="9123456789", safety_score=92.5, status=DriverStatus.AVAILABLE),
            Driver(id=4, name="Sandeep Yadav", license_number="HR26202100004", license_category="HMV", license_expiry_date=date.today() - timedelta(days=100), contact_number="8888877777", safety_score=78.0, status=DriverStatus.OFF_DUTY),
            Driver(id=5, name="Rajesh Patel", license_number="GJ01202300005", license_category="LMV", license_expiry_date=date.today() + timedelta(days=1000), contact_number="7777766666", safety_score=99.0, status=DriverStatus.SUSPENDED),
            
            # Frontend Mock Drivers
            Driver(id=6, name="Alex", license_number="DL-199212", license_category="LMV", license_expiry_date=date(2028, 12, 31), contact_number="9876543211", trip_completion_rate=96.0, safety_score=95.0, status=DriverStatus.AVAILABLE),
            Driver(id=7, name="John", license_number="DL-114420", license_category="HMV", license_expiry_date=date(2025, 3, 15), contact_number="9822012345", trip_completion_rate=92.0, safety_score=81.0, status=DriverStatus.SUSPENDED),
            Driver(id=8, name="Priya", license_number="DL-170251", license_category="LMV", license_expiry_date=date(2029, 9, 30), contact_number="9998123456", trip_completion_rate=99.0, safety_score=90.0, status=DriverStatus.ON_TRIP),
            Driver(id=9, name="Suresh", license_number="DL-110045", license_category="HMV", license_expiry_date=date(2027, 1, 20), contact_number="9940123456", trip_completion_rate=88.0, safety_score=85.0, status=DriverStatus.OFF_DUTY)
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

        # Frontend Mock Trips
        # Mock Trip 1 (Active)
        trip6 = Trip(id=6, source="Ahmedabad Depot", destination="Anandhand Hub", vehicle_id=6, driver_id=6, cargo_weight=400.0, planned_distance=80.0, eta_minutes=45, revenue=0.0, status=TripStatus.DISPATCHED)
        db.add(trip6)
        
        # Mock Trip 2 (Draft)
        trip7 = Trip(id=7, source="Noida Industrial Area", destination="Sonipat Warehouse", vehicle_id=10, driver_id=9, cargo_weight=6000.0, planned_distance=110.0, eta_minutes=180, revenue=0.0, status=TripStatus.DRAFT)
        db.add(trip7)

        # Mock Trip 3 (Cancelled)
        trip8 = Trip(id=8, source="Manesar", destination="Kalka Depot", vehicle_id=10, driver_id=6, cargo_weight=2000.0, planned_distance=300.0, revenue=0.0, status=TripStatus.CANCELLED, notes="Route unsafe")
        db.add(trip8)
        db.commit()

        print("Seeding Maintenance Logs...")
        maint_logs = [
            # Active in shop (Vehicle 3)
            MaintenanceLog(vehicle_id=3, description="Gearbox Overhaul", cost=35000.0, start_date=date.today() - timedelta(days=3), status=MaintenanceStatus.ACTIVE),
            # Completed services (Vehicle 1 & 2)
            MaintenanceLog(vehicle_id=1, description="Regular 10k Oil Change", cost=4500.0, start_date=date.today() - timedelta(days=15), end_date=date.today() - timedelta(days=14), status=MaintenanceStatus.CLOSED),
            MaintenanceLog(vehicle_id=2, description="Brake Pad Replacement", cost=8000.0, start_date=date.today() - timedelta(days=30), end_date=date.today() - timedelta(days=29), status=MaintenanceStatus.CLOSED),
            
            # Frontend Mock Maintenance Logs
            MaintenanceLog(vehicle_id=6, description="Oil Change", cost=2500.0, start_date=date.today() - timedelta(days=2), status=MaintenanceStatus.ACTIVE),
            MaintenanceLog(vehicle_id=7, description="Engine Repair", cost=18000.0, start_date=date.today() - timedelta(days=10), end_date=date.today() - timedelta(days=8), status=MaintenanceStatus.CLOSED),
            MaintenanceLog(vehicle_id=8, description="Tyre Replace", cost=4200.0, start_date=date.today() - timedelta(days=1), status=MaintenanceStatus.ACTIVE)
        ]
        db.add_all(maint_logs)
        db.commit()

        print("Seeding Other Expenses...")
        expenses = [
            Expense(vehicle_id=1, trip_id=1, type=ExpenseType.TOLL, cost=4500.0, description="NH8 Highway Tolls", date=date.today() - timedelta(days=12)),
            Expense(vehicle_id=4, trip_id=3, type=ExpenseType.TOLL, cost=400.0, description="NE1 Expressway Toll", date=date.today() - timedelta(days=8)),
            Expense(vehicle_id=1, trip_id=4, type=ExpenseType.TOLL, cost=800.0, description="NH48 Toll Plaza", date=date.today() - timedelta(days=5)),
            
            # Frontend Mock Expenses
            Expense(vehicle_id=6, trip_id=6, type=ExpenseType.TOLL, cost=120.0, description="NH8 Toll", date=date(2026, 7, 5)),
            Expense(vehicle_id=10, trip_id=2, type=ExpenseType.TOLL, cost=340.0, description="NH4 Toll", date=date(2026, 7, 6)),
            Expense(vehicle_id=10, trip_id=2, type=ExpenseType.OTHER, cost=150.0, description="Driver refreshment", date=date(2026, 7, 6)),
            Expense(vehicle_id=10, trip_id=2, type=ExpenseType.OTHER, cost=17510.0, description="Miscellaneous charges", date=date(2026, 7, 6))
        ]
        db.add_all(expenses)
        db.commit()

        print("Seeding Fuel Logs...")
        fuel_logs = [
            # Frontend Mock Fuel Logs
            FuelLog(vehicle_id=6, liters=42.0, cost=3850.0, date=date(2026, 7, 5)),
            FuelLog(vehicle_id=7, liters=90.0, cost=8400.0, date=date(2026, 7, 6)),
            FuelLog(vehicle_id=8, liters=25.0, cost=2050.0, date=date(2026, 7, 5))
        ]
        db.add_all(fuel_logs)
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

