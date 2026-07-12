def test_vehicles_crud_and_rbac(client):
    # Register and login roles
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

    # 1. Create vehicle as Dispatcher (Should be Forbidden 403)
    vehicle_payload = {
        "registration_number": "GJ01V1234",
        "model": "Van-05",
        "type": "Van",
        "max_load_capacity": 500.0,
        "odometer": 0.0,
        "acquisition_cost": 15000.0,
        "status": "Available",
    }
    res_create_denied = client.post(
        "/api/vehicles", json=vehicle_payload, headers=headers_disp
    )
    assert res_create_denied.status_code == 403

    # 2. Create vehicle as Fleet Manager (Should succeed 201)
    res_create = client.post("/api/vehicles", json=vehicle_payload, headers=headers_fm)
    assert res_create.status_code == 201
    vehicle_id = res_create.json()["id"]

    # 3. Create vehicle with duplicate registration number (Should fail 400)
    res_create_dup = client.post(
        "/api/vehicles", json=vehicle_payload, headers=headers_fm
    )
    assert res_create_dup.status_code == 400

    # 4. List vehicles as Dispatcher (Should be Allowed 200)
    res_list_ok = client.get("/api/vehicles", headers=headers_disp)
    assert res_list_ok.status_code == 200

    # 5. List vehicles as Fleet Manager
    res_list = client.get("/api/vehicles", headers=headers_fm)
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1
    assert res_list.json()[0]["registration_number"] == "GJ01V1234"

    # 6. Update vehicle as Fleet Manager
    update_payload = {"model": "Van-06", "status": "In Shop"}
    res_update = client.put(
        f"/api/vehicles/{vehicle_id}", json=update_payload, headers=headers_fm
    )
    assert res_update.status_code == 200
    assert res_update.json()["model"] == "Van-06"
    assert res_update.json()["status"] == "In Shop"

    # 7. Delete vehicle as Fleet Manager
    res_delete = client.delete(f"/api/vehicles/{vehicle_id}", headers=headers_fm)
    assert res_delete.status_code == 200

    # Verify deleted
    res_get = client.get(f"/api/vehicles/{vehicle_id}", headers=headers_fm)
    assert res_get.status_code == 404


def test_drivers_crud_and_rbac(client):
    # Safety Officer
    client.post(
        "/api/auth/register",
        json={
            "email": "so@test.com",
            "password": "pass",
            "role": "safety_officer",
            "name": "Safety Officer",
        },
    )
    token_so = client.post(
        "/api/auth/login", json={"email": "so@test.com", "password": "pass"}
    ).json()["access_token"]
    headers_so = {"Authorization": f"Bearer {token_so}"}

    # Fleet Manager
    client.post(
        "/api/auth/register",
        json={
            "email": "fm3@test.com",
            "password": "pass",
            "role": "fleet_manager",
            "name": "FM",
        },
    )
    token_fm = client.post(
        "/api/auth/login", json={"email": "fm3@test.com", "password": "pass"}
    ).json()["access_token"]
    headers_fm = {"Authorization": f"Bearer {token_fm}"}

    # Dispatcher
    client.post(
        "/api/auth/register",
        json={
            "email": "disp3@test.com",
            "password": "pass",
            "role": "dispatcher",
            "name": "Disp",
        },
    )
    token_disp = client.post(
        "/api/auth/login", json={"email": "disp3@test.com", "password": "pass"}
    ).json()["access_token"]
    headers_disp = {"Authorization": f"Bearer {token_disp}"}

    # 1. Create driver as Dispatcher (Should fail 403)
    driver_payload = {
        "name": "Alex",
        "license_number": "DL-12345",
        "license_category": "LMV",
        "license_expiry_date": "2028-12-31",
        "contact_number": "9876543210",
        "trip_completion_rate": 100.0,
        "safety_score": 95.0,
        "status": "Available",
    }
    res_denied = client.post("/api/drivers", json=driver_payload, headers=headers_disp)
    assert res_denied.status_code == 403

    # 2. Create driver as Safety Officer (Should succeed 201)
    res_create = client.post("/api/drivers", json=driver_payload, headers=headers_so)
    assert res_create.status_code == 201
    driver_id = res_create.json()["id"]

    # 3. Create driver as Fleet Manager (Should succeed 201)
    driver_payload_2 = driver_payload.copy()
    driver_payload_2["license_number"] = "DL-67890"
    res_create_fm = client.post(
        "/api/drivers", json=driver_payload_2, headers=headers_fm
    )
    assert res_create_fm.status_code == 201

    # 4. Duplicate license check (Should fail 400)
    res_dup = client.post("/api/drivers", json=driver_payload, headers=headers_so)
    assert res_dup.status_code == 400

    # 5. List drivers as Safety Officer (Should succeed 200)
    res_list = client.get("/api/drivers", headers=headers_so)
    assert res_list.status_code == 200
    assert len(res_list.json()) == 2

    # 6. Update driver as Safety Officer
    update_payload = {"safety_score": 90.0, "status": "Suspended"}
    res_update = client.put(
        f"/api/drivers/{driver_id}", json=update_payload, headers=headers_so
    )
    assert res_update.status_code == 200
    assert res_update.json()["safety_score"] == 90.0
    assert res_update.json()["status"] == "Suspended"

    # 7. Delete driver as Fleet Manager
    res_delete = client.delete(f"/api/drivers/{driver_id}", headers=headers_fm)
    assert res_delete.status_code == 200
