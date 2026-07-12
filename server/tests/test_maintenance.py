from datetime import date


def test_maintenance_workflow_and_rbac(client):
    # Setup users
    client.post(
        "/api/auth/register",
        json={
            "email": "fm@test.com",
            "password": "pass",
            "role": "fleet_manager",
            "name": "Fleet Manager",
        },
    )
    token_fm = client.post(
        "/api/auth/login", json={"email": "fm@test.com", "password": "pass"}
    ).json()["access_token"]
    headers_fm = {"Authorization": f"Bearer {token_fm}"}

    client.post(
        "/api/auth/register",
        json={
            "email": "disp@test.com",
            "password": "pass",
            "role": "dispatcher",
            "name": "Dispatcher",
        },
    )
    token_disp = client.post(
        "/api/auth/login", json={"email": "disp@test.com", "password": "pass"}
    ).json()["access_token"]
    headers_disp = {"Authorization": f"Bearer {token_disp}"}

    # Register vehicle
    vehicle_payload = {
        "registration_number": "KA51M9999",
        "model": "Tata Ace",
        "type": "Mini Truck",
        "max_load_capacity": 1000.0,
        "odometer": 5000.0,
        "acquisition_cost": 500000.0,
        "status": "Available",
    }
    res_vehicle = client.post("/api/vehicles", json=vehicle_payload, headers=headers_fm)
    assert res_vehicle.status_code == 201
    vehicle_id = res_vehicle.json()["id"]

    # 1. Dispatcher tries to schedule maintenance (Should be Forbidden 403)
    maintenance_payload = {
        "vehicle_id": vehicle_id,
        "description": "Engine Oil Change",
        "cost": 3500.0,
        "start_date": str(date.today()),
    }
    res_maint_denied = client.post(
        "/api/maintenance", json=maintenance_payload, headers=headers_disp
    )
    assert res_maint_denied.status_code == 403

    # 2. Fleet Manager schedules maintenance (Should succeed 201)
    res_maint = client.post(
        "/api/maintenance", json=maintenance_payload, headers=headers_fm
    )
    assert res_maint.status_code == 201
    log_id = res_maint.json()["id"]
    assert res_maint.json()["status"] == "Active"

    # Verify vehicle status is toggled to "In Shop"
    res_veh_detail = client.get(f"/api/vehicles/{vehicle_id}", headers=headers_fm)
    assert res_veh_detail.json()["status"] == "In Shop"

    # 3. Schedule maintenance on same vehicle while in shop (Should fail 400)
    res_maint_dup = client.post(
        "/api/maintenance", json=maintenance_payload, headers=headers_fm
    )
    assert res_maint_dup.status_code == 400

    # 4. Dispatcher tries to close maintenance (Should be Forbidden 403)
    close_payload = {
        "end_date": str(date.today()),
        "cost": 4000.0,
    }
    res_close_denied = client.post(
        f"/api/maintenance/{log_id}/close", json=close_payload, headers=headers_disp
    )
    assert res_close_denied.status_code == 403

    # 5. Fleet Manager closes maintenance (Should succeed 200)
    res_close = client.post(
        f"/api/maintenance/{log_id}/close", json=close_payload, headers=headers_fm
    )
    assert res_close.status_code == 200
    assert res_close.json()["status"] == "Closed"
    assert res_close.json()["end_date"] == str(date.today())
    assert res_close.json()["cost"] == 4000.0

    # Verify vehicle status is toggled back to "Available"
    res_veh_detail_after = client.get(f"/api/vehicles/{vehicle_id}", headers=headers_fm)
    assert res_veh_detail_after.json()["status"] == "Available"

    # 6. List maintenance logs (Should succeed for FM, Forbidden for Dispatcher)
    res_list = client.get("/api/maintenance", headers=headers_fm)
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1
    assert res_list.json()[0]["id"] == log_id

    res_list_denied = client.get("/api/maintenance", headers=headers_disp)
    assert res_list_denied.status_code == 403

    # 7. Try to close an already closed log (Should fail 400)
    res_close_dup = client.post(
        f"/api/maintenance/{log_id}/close", json=close_payload, headers=headers_fm
    )
    assert res_close_dup.status_code == 400
