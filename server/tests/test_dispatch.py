from datetime import date, timedelta
from app.models.expense import FuelLog


def test_trip_lifecycle_and_constraints(client, db):
    # 1. Setup users & authenticate
    # Dispatcher
    client.post(
        "/api/auth/register",
        json={
            "email": "dispatcher@ops.com",
            "password": "pass",
            "role": "dispatcher",
            "name": "Disp",
        },
    )
    token_disp = client.post(
        "/api/auth/login", json={"email": "dispatcher@ops.com", "password": "pass"}
    ).json()["access_token"]
    headers_disp = {"Authorization": f"Bearer {token_disp}"}

    # Fleet Manager (to create vehicles/drivers)
    client.post(
        "/api/auth/register",
        json={
            "email": "manager@ops.com",
            "password": "pass",
            "role": "fleet_manager",
            "name": "Mgr",
        },
    )
    token_mgr = client.post(
        "/api/auth/login", json={"email": "manager@ops.com", "password": "pass"}
    ).json()["access_token"]
    headers_mgr = {"Authorization": f"Bearer {token_mgr}"}

    # 2. Register vehicles (Van-05 with 500kg capacity, and Truck-01 with 5000kg capacity)
    res_v1 = client.post(
        "/api/vehicles",
        json={
            "registration_number": "VAN-05",
            "model": "Van-05",
            "type": "Van",
            "max_load_capacity": 500.0,
            "odometer": 1000.0,
            "acquisition_cost": 15000.0,
        },
        headers=headers_mgr,
    )
    vehicle_id = res_v1.json()["id"]

    res_v2 = client.post(
        "/api/vehicles",
        json={
            "registration_number": "TRUCK-01",
            "model": "Truck-01",
            "type": "Truck",
            "max_load_capacity": 5000.0,
            "odometer": 2000.0,
            "acquisition_cost": 45000.0,
        },
        headers=headers_mgr,
    )
    truck_id = res_v2.json()["id"]

    # 3. Register drivers (Alex with valid license, and John with expired license)
    valid_expiry = (date.today() + timedelta(days=365)).isoformat()
    expired_date = (date.today() - timedelta(days=10)).isoformat()

    res_d1 = client.post(
        "/api/drivers",
        json={
            "name": "Alex",
            "license_number": "DL-VALID",
            "license_category": "LMV",
            "license_expiry_date": valid_expiry,
            "contact_number": "123",
        },
        headers=headers_mgr,
    )
    driver_id = res_d1.json()["id"]

    res_d2 = client.post(
        "/api/drivers",
        json={
            "name": "John",
            "license_number": "DL-EXPIRED",
            "license_category": "HMV",
            "license_expiry_date": expired_date,
            "contact_number": "456",
        },
        headers=headers_mgr,
    )
    expired_driver_id = res_d2.json()["id"]

    # 4. Create a draft trip (Cargo Weight = 700 kg for Van-05 which has 500 kg capacity)
    trip_overweight_payload = {
        "source": "Depot A",
        "destination": "Hub B",
        "vehicle_id": vehicle_id,
        "driver_id": driver_id,
        "cargo_weight": 700.0,
        "planned_distance": 50.0,
    }
    res_t1 = client.post(
        "/api/trips", json=trip_overweight_payload, headers=headers_disp
    )
    assert res_t1.status_code == 201
    overweight_trip_id = res_t1.json()["id"]

    # Dispatch overweight trip -> should fail 400
    res_dispatch_fail = client.post(
        f"/api/trips/{overweight_trip_id}/dispatch", headers=headers_disp
    )
    assert res_dispatch_fail.status_code == 400
    assert "exceeds vehicle maximum capacity" in res_dispatch_fail.json()["detail"]

    # 5. Create a draft trip with valid weight (Cargo = 450 kg for Van-05)
    trip_valid_payload = trip_overweight_payload.copy()
    trip_valid_payload["cargo_weight"] = 450.0
    res_t2 = client.post("/api/trips", json=trip_valid_payload, headers=headers_disp)
    valid_trip_id = res_t2.json()["id"]

    # 6. Create a draft trip with expired driver
    trip_expired_driver_payload = trip_valid_payload.copy()
    trip_expired_driver_payload["driver_id"] = expired_driver_id
    res_t3 = client.post(
        "/api/trips", json=trip_expired_driver_payload, headers=headers_disp
    )
    expired_driver_trip_id = res_t3.json()["id"]

    # Dispatch with expired driver -> should fail 400
    res_disp_expired = client.post(
        f"/api/trips/{expired_driver_trip_id}/dispatch", headers=headers_disp
    )
    assert res_disp_expired.status_code == 400
    assert "license has expired" in res_disp_expired.json()["detail"]

    # 7. Dispatch valid trip -> should succeed 200
    res_dispatch_ok = client.post(
        f"/api/trips/{valid_trip_id}/dispatch", headers=headers_disp
    )
    assert res_dispatch_ok.status_code == 200
    assert res_dispatch_ok.json()["status"] == "Dispatched"

    # Verify vehicle and driver status is now On Trip
    vehicle_check = client.get(
        f"/api/vehicles/{vehicle_id}", headers=headers_mgr
    ).json()
    driver_check = client.get(f"/api/drivers/{driver_id}", headers=headers_mgr).json()
    assert vehicle_check["status"] == "On Trip"
    assert driver_check["status"] == "On Trip"

    # 8. Try to double book - dispatch another trip with same vehicle (e.g. Truck payload using Van-05)
    double_book_payload = {
        "source": "Depot A",
        "destination": "Hub C",
        "vehicle_id": vehicle_id,
        "driver_id": expired_driver_id,  # not assigned to active trip but has expired license anyway, let's use valid driver if we had one
        "cargo_weight": 100.0,
        "planned_distance": 20.0,
    }
    # Create trip
    res_db = client.post("/api/trips", json=double_book_payload, headers=headers_disp)
    db_trip_id = res_db.json()["id"]
    # Attempt to dispatch -> should fail 400 (vehicle not Available)
    res_disp_db_fail = client.post(
        f"/api/trips/{db_trip_id}/dispatch", headers=headers_disp
    )
    assert res_disp_db_fail.status_code == 400
    assert "must be 'Available'" in res_disp_db_fail.json()["detail"]

    # 9. Complete the valid trip (final odometer = 1045.0, fuel liters = 42.0, cost = 3150.0)
    completion_payload = {
        "final_odometer": 1045.0,
        "fuel_liters": 42.0,
        "fuel_cost": 3150.0,
        "revenue": 5000.0,
    }
    # Complete with bad odometer (less than current 1000) -> should fail 400
    bad_completion = completion_payload.copy()
    bad_completion["final_odometer"] = 999.0
    res_comp_fail = client.post(
        f"/api/trips/{valid_trip_id}/complete",
        json=bad_completion,
        headers=headers_disp,
    )
    assert res_comp_fail.status_code == 400

    # Complete successfully
    res_complete_ok = client.post(
        f"/api/trips/{valid_trip_id}/complete",
        json=completion_payload,
        headers=headers_disp,
    )
    assert res_complete_ok.status_code == 200
    assert res_complete_ok.json()["status"] == "Completed"
    assert res_complete_ok.json()["actual_distance"] == 45.0
    assert res_complete_ok.json()["revenue"] == 5000.0

    # Verify vehicle and driver status is back to Available and odometer updated
    vehicle_check_post = client.get(
        f"/api/vehicles/{vehicle_id}", headers=headers_mgr
    ).json()
    driver_check_post = client.get(
        f"/api/drivers/{driver_id}", headers=headers_mgr
    ).json()
    assert vehicle_check_post["status"] == "Available"
    assert vehicle_check_post["odometer"] == 1045.0
    assert driver_check_post["status"] == "Available"

    # Verify FuelLog was written to db
    fuel_logs = db.query(FuelLog).filter(FuelLog.trip_id == valid_trip_id).all()
    assert len(fuel_logs) == 1
    assert fuel_logs[0].liters == 42.0
    assert fuel_logs[0].cost == 3150.0

    # 10. Cancel a trip
    # Create draft trip
    res_cancel_draft = client.post(
        "/api/trips",
        json={
            "source": "Depot A",
            "destination": "Hub D",
            "vehicle_id": truck_id,
            "driver_id": driver_id,
            "cargo_weight": 100.0,
            "planned_distance": 20.0,
        },
        headers=headers_disp,
    )
    cancel_trip_id = res_cancel_draft.json()["id"]

    # Dispatch it first
    client.post(f"/api/trips/{cancel_trip_id}/dispatch", headers=headers_disp)
    # Verify driver/vehicle is On Trip
    assert (
        client.get(f"/api/vehicles/{truck_id}", headers=headers_mgr).json()["status"]
        == "On Trip"
    )

    # Cancel it
    res_cancel_ok = client.post(
        f"/api/trips/{cancel_trip_id}/cancel",
        json={"notes": "Vehicle went to shop"},
        headers=headers_disp,
    )
    assert res_cancel_ok.status_code == 200
    assert res_cancel_ok.json()["status"] == "Cancelled"
    assert res_cancel_ok.json()["notes"] == "Vehicle went to shop"

    # Verify driver/vehicle is restored to Available
    assert (
        client.get(f"/api/vehicles/{truck_id}", headers=headers_mgr).json()["status"]
        == "Available"
    )
    assert (
        client.get(f"/api/drivers/{driver_id}", headers=headers_mgr).json()["status"]
        == "Available"
    )
