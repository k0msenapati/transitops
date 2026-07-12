from datetime import date
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.driver import Driver, DriverStatus


def test_password_hashing():
    password = "my_secure_password"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(hashed, password) is True
    assert verify_password(hashed, "wrong_password") is False


def test_jwt_tokens():
    payload = {"sub": "user@example.com", "role": "dispatcher"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user@example.com"
    assert decoded["role"] == "dispatcher"


def test_db_insertions(db):
    # Insert user
    user = User(
        email="test@transitops.com",
        hashed_password="hashed_pw",
        role=UserRole.FLEET_MANAGER,
        name="John Doe",
    )
    db.add(user)
    db.commit()

    db_user = db.query(User).filter_by(email="test@transitops.com").first()
    assert db_user is not None
    assert db_user.name == "John Doe"
    assert db_user.role == UserRole.FLEET_MANAGER

    # Insert vehicle
    vehicle = Vehicle(
        registration_number="GJ01AB1234",
        model="Van-05",
        type="Van",
        max_load_capacity=500.0,
        odometer=100.0,
        acquisition_cost=12000.0,
        status=VehicleStatus.AVAILABLE,
    )
    db.add(vehicle)
    db.commit()

    db_vehicle = db.query(Vehicle).filter_by(registration_number="GJ01AB1234").first()
    assert db_vehicle is not None
    assert db_vehicle.model == "Van-05"
    assert db_vehicle.max_load_capacity == 500.0

    # Insert driver
    driver = Driver(
        name="Alex",
        license_number="DL-88213",
        license_category="LMV",
        license_expiry_date=date(2028, 12, 31),
        contact_number="9876543210",
        status=DriverStatus.AVAILABLE,
    )
    db.add(driver)
    db.commit()

    db_driver = db.query(Driver).filter_by(license_number="DL-88213").first()
    assert db_driver is not None
    assert db_driver.name == "Alex"
    assert db_driver.status == DriverStatus.AVAILABLE
