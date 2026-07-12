from app.main import app
from app.models.user import UserRole
from app.utils.dependencies import RoleRequired
from fastapi import Depends


# Define a test endpoint to verify RoleRequired RBAC
@app.get("/test-manager-only")
def manager_only_endpoint(user=Depends(RoleRequired([UserRole.FLEET_MANAGER]))):
    return {"status": "success"}


def test_register_and_login(client):
    # 1. Register a user
    register_payload = {
        "email": "manager@transitops.com",
        "password": "securepassword123",
        "role": "fleet_manager",
        "name": "Fleet Owner",
    }
    response = client.post("/auth/register", json=register_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "manager@transitops.com"
    assert data["role"] == "fleet_manager"
    assert data["name"] == "Fleet Owner"
    assert "id" in data

    # 2. Try to register same email again
    response_dup = client.post("/auth/register", json=register_payload)
    assert response_dup.status_code == 400
    assert response_dup.json()["detail"] == "Email already registered"

    # 3. Login with correct credentials
    login_payload = {"email": "manager@transitops.com", "password": "securepassword123"}
    response_login = client.post("/auth/login", json=login_payload)
    assert response_login.status_code == 200
    token_data = response_login.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # 4. Login with incorrect credentials
    bad_login = {"email": "manager@transitops.com", "password": "wrongpassword"}
    response_bad = client.post("/auth/login", json=bad_login)
    assert response_bad.status_code == 401
    assert response_bad.json()["detail"] == "Incorrect email or password"


def test_get_me_and_rbac(client):
    # Register and login a Manager
    client.post(
        "/auth/register",
        json={
            "email": "manager2@transitops.com",
            "password": "pass",
            "role": "fleet_manager",
            "name": "Manager Two",
        },
    )
    token_m = client.post(
        "/auth/login", json={"email": "manager2@transitops.com", "password": "pass"}
    ).json()["access_token"]

    # Register and login a Dispatcher
    client.post(
        "/auth/register",
        json={
            "email": "dispatcher@transitops.com",
            "password": "pass",
            "role": "dispatcher",
            "name": "Dispatcher One",
        },
    )
    token_d = client.post(
        "/auth/login", json={"email": "dispatcher@transitops.com", "password": "pass"}
    ).json()["access_token"]

    # 1. Test /users/me without token
    response_unauth = client.get("/users/me")
    assert response_unauth.status_code == 401

    # 2. Test /users/me with valid manager token
    response_me = client.get(
        "/users/me", headers={"Authorization": f"Bearer {token_m}"}
    )
    assert response_me.status_code == 200
    assert response_me.json()["email"] == "manager2@transitops.com"
    assert response_me.json()["role"] == "fleet_manager"

    # 3. Test RBAC manager-only endpoint as manager (Should succeed)
    res_rbac_ok = client.get(
        "/test-manager-only", headers={"Authorization": f"Bearer {token_m}"}
    )
    assert res_rbac_ok.status_code == 200
    assert res_rbac_ok.json()["status"] == "success"

    # 4. Test RBAC manager-only endpoint as dispatcher (Should return 403 Forbidden)
    res_rbac_denied = client.get(
        "/test-manager-only", headers={"Authorization": f"Bearer {token_d}"}
    )
    assert res_rbac_denied.status_code == 403
    assert res_rbac_denied.json()["detail"] == "Insufficient permissions"
