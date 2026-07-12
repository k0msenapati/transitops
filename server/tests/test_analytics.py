from datetime import date


def test_analytics_and_expenses_workflow(client):
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
            "email": "fa@test.com",
            "password": "pass",
            "role": "financial_analyst",
            "name": "Financial Analyst",
        },
    )
    token_fa = client.post(
        "/api/auth/login", json={"email": "fa@test.com", "password": "pass"}
    ).json()["access_token"]
    headers_fa = {"Authorization": f"Bearer {token_fa}"}

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

    # Register vehicle (Acquisition Cost = ₹500,000)
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

    # Register driver
    driver_payload = {
        "name": "Rahul Kumar",
        "license_number": "DL-1420230000000",
        "license_category": "HMV",
        "license_expiry_date": str(date(2028, 12, 31)),
        "contact_number": "9999999999",
        "safety_score": 100.0,
        "status": "Available",
    }
    res_driver = client.post("/api/drivers", json=driver_payload, headers=headers_fm)
    assert res_driver.status_code == 201
    driver_id = res_driver.json()["id"]

    # Create & Dispatch a Trip
    trip_payload = {
        "source": "Delhi",
        "destination": "Agra",
        "vehicle_id": vehicle_id,
        "driver_id": driver_id,
        "cargo_weight": 800.0,
        "planned_distance": 200.0,
        "eta_minutes": 240,
        "revenue": 15000.0,
    }
    res_trip = client.post("/api/trips", json=trip_payload, headers=headers_fm)
    assert res_trip.status_code == 201
    trip_id = res_trip.json()["id"]

    # Dispatch Trip (Updates vehicle & driver status to "On Trip")
    res_dispatch = client.post(f"/api/trips/{trip_id}/dispatch", headers=headers_fm)
    assert res_dispatch.status_code == 200

    # 1. Verify Dashboard KPIs as Dispatcher (Should succeed)
    res_dash = client.get("/api/analytics/dashboard", headers=headers_disp)
    assert res_dash.status_code == 200
    assert res_dash.json()["active_vehicles"] == 1
    assert res_dash.json()["drivers_on_duty"] == 1
    assert res_dash.json()["fleet_utilization"] == 100.0

    # Complete Trip (Odometer from 5000 -> 5200, logs fuel: 20L, ₹2000 cost, revenue ₹15000)
    complete_payload = {
        "final_odometer": 5200.0,
        "fuel_liters": 20.0,
        "fuel_cost": 2000.0,
        "revenue": 15000.0,
    }
    res_complete = client.post(
        f"/api/trips/{trip_id}/complete", json=complete_payload, headers=headers_fm
    )
    assert res_complete.status_code == 200

    # 2. Log other Toll Expense (₹1000) as Financial Analyst (Should succeed)
    expense_payload = {
        "vehicle_id": vehicle_id,
        "trip_id": trip_id,
        "type": "Toll",
        "cost": 1000.0,
        "description": "Yamuna Expressway Toll",
        "date": str(date.today()),
    }
    res_expense = client.post(
        "/api/expenses/other", json=expense_payload, headers=headers_fa
    )
    assert res_expense.status_code == 201

    # 3. Log Fuel Log manually (10L, ₹1000) as FA (Should succeed)
    fuel_payload = {
        "vehicle_id": vehicle_id,
        "trip_id": None,
        "liters": 10.0,
        "cost": 1000.0,
        "date": str(date.today()),
    }
    res_fuel = client.post("/api/expenses/fuel", json=fuel_payload, headers=headers_fa)
    assert res_fuel.status_code == 201

    # Verify Dispatcher is blocked from expenses (Should return 403)
    res_expense_denied = client.post(
        "/api/expenses/other", json=expense_payload, headers=headers_disp
    )
    assert res_expense_denied.status_code == 403

    # 4. Verify Financial KPIs on Dashboard (FM Access)
    res_dash2 = client.get("/api/analytics/dashboard", headers=headers_fm)
    assert res_dash2.status_code == 200
    # Revenue = 15000. Expenses = 2000 (trip complete fuel) + 1000 (toll) + 1000 (manual fuel) = 4000
    assert res_dash2.json()["total_revenue"] == 15000.0
    assert res_dash2.json()["total_expenses"] == 4000.0
    assert res_dash2.json()["net_profit"] == 11000.0
    assert res_dash2.json()["profit_margin"] == round((11000.0 / 15000.0) * 100, 2)

    # 5. Verify Vehicle ROI and Fuel Efficiency Report (FA Access)
    res_rep = client.get("/api/analytics/reports", headers=headers_fa)
    assert res_rep.status_code == 200
    vehicle_report = res_rep.json()[0]
    assert vehicle_report["distance_travelled"] == 200.0
    assert vehicle_report["revenue"] == 15000.0
    assert vehicle_report["expenses"] == 4000.0
    # Fuel consumed = 20 (trip complete) + 10 (manual) = 30L
    # Distance = 200. Fuel Efficiency = 200 / 30 = 6.67 km/L
    assert vehicle_report["fuel_efficiency"] == round(200.0 / 30.0, 2)
    # ROI = (Revenue - (Maint + Fuel)) / Acquisition Cost * 100
    # Fuel Cost = 2000 + 1000 = 3000. Maint = 0.
    # ROI = (15000 - 3000) / 500000 * 100 = 12000 / 500000 * 100 = 2.4%
    assert vehicle_report["roi"] == round((15000.0 - 3000.0) / 500000.0 * 100, 2)

    # Verify Dispatcher is blocked from reports (Should return 403)
    res_rep_denied = client.get("/api/analytics/reports", headers=headers_disp)
    assert res_rep_denied.status_code == 403

    # 6. Verify CSV Export
    res_csv = client.get("/api/analytics/reports/export", headers=headers_fa)
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert (
        "attachment; filename=fleet_roi_report.csv"
        in res_csv.headers["content-disposition"]
    )
    csv_content = res_csv.text
    assert "Vehicle ID" in csv_content
    assert "KA51M9999" in csv_content

    # 7. Verify settings CRUD (FM Access)
    res_settings_get = client.get("/api/settings", headers=headers_fm)
    assert res_settings_get.status_code == 200
    assert res_settings_get.json()["depot_name"] == "Gandhinagar Depot 624"

    settings_update = {
        "depot_name": "Bangalore Main Depot",
        "currency": "INR (₹)",
        "distance_unit": "Kilometers",
    }
    res_settings_put = client.put(
        "/api/settings", json=settings_update, headers=headers_fm
    )
    assert res_settings_put.status_code == 200
    assert res_settings_put.json()["depot_name"] == "Bangalore Main Depot"

    # Verify Dispatcher is blocked from settings (Should return 403)
    res_settings_denied = client.get("/api/settings", headers=headers_disp)
    assert res_settings_denied.status_code == 403
