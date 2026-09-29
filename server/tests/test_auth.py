import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["database"] == "healthy"

@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    # 1. Register a new user
    register_payload = {
        "email": "bill@example.com",
        "username": "bill10k",
        "display_name": "Bill",
        "password": "supersecurepassword123"
    }
    reg_res = await client.post("/api/v1/auth/register", json=register_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "bill@example.com"
    assert reg_data["user"]["username"] == "bill10k"
    assert "email" in reg_data["user"]["connected_providers"]

    token = reg_data["access_token"]

    # 2. Access protected /auth/me
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["id"] == reg_data["user"]["id"]
    assert me_data["display_name"] == "Bill"

    # 3. Test Login with credentials
    login_payload = {
        "username_or_email": "bill@example.com",
        "password": "supersecurepassword123"
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # 4. Test wrong password rejection
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "bill@example.com", "password": "wrongpassword"}
    )
    assert bad_login.status_code == 401


@pytest.mark.asyncio
async def test_google_oauth_init_and_exchange(client: AsyncClient):
    # 1. Test /auth/google/init endpoint
    init_res = await client.get("/api/v1/auth/google/init")
    assert init_res.status_code == 200
    init_data = init_res.json()
    assert "redirect_url" in init_data
    assert "accounts.google.com" in init_data["redirect_url"]
    assert "openid" in init_data["redirect_url"]
    assert "state" in init_data

    # 2. Test /auth/google/exchange endpoint with dev code
    exchange_res = await client.post(
        "/api/v1/auth/google/exchange",
        json={"code": "dev_test_oauth_code_123", "code_verifier": "test_verifier"}
    )
    assert exchange_res.status_code == 200
    auth_data = exchange_res.json()
    assert "access_token" in auth_data
    assert "user" in auth_data
    assert "google" in auth_data["user"]["connected_providers"]

