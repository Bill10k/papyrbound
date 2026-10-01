import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_collections_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register a test curator
        reg_resp = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": "curator@example.com",
                "username": "curator_bill",
                "password": "Password123!",
                "display_name": "Bill the Curator",
            },
        )
        assert reg_resp.status_code == 201
        token = reg_resp.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 2. List public collections initially
        list_resp = await ac.get("/api/v1/collections")
        assert list_resp.status_code == 200
        assert isinstance(list_resp.json(), list)

        # 3. Create a Spotify-style book collection playlist
        collection_payload = {
            "name": "Cyberpunk & Dystopian Essentials",
            "description": "A curated playlist of neo-noir and digital revolution reads.",
            "theme_color": "indigo",
            "is_public": True,
            "items": [
                {
                    "title": "Neuromancer",
                    "author": "William Gibson",
                    "curator_note": "The grandfather of the cyberspace genre.",
                    "order_index": 0,
                },
                {
                    "title": "Snow Crash",
                    "author": "Neal Stephenson",
                    "curator_note": "Fast-paced satirical cyberpunk worldbuilding.",
                    "order_index": 1,
                },
            ],
        }
        create_resp = await ac.post("/api/v1/collections", json=collection_payload, headers=auth_headers)
        assert create_resp.status_code == 201
        created = create_resp.json()
        assert created["name"] == "Cyberpunk & Dystopian Essentials"
        assert created["curator"]["username"] == "curator_bill"
        assert len(created["items"]) == 2
        assert created["share_code"].startswith("PAPYR-")
        collection_id = created["id"]
        share_code = created["share_code"]

        # 4. Retrieve by share code
        code_resp = await ac.get(f"/api/v1/collections/{share_code}")
        assert code_resp.status_code == 200
        assert code_resp.json()["id"] == collection_id

        # 5. Like / Bookmark collection
        like_resp = await ac.post(f"/api/v1/collections/{collection_id}/like", headers=auth_headers)
        assert like_resp.status_code == 200
        assert like_resp.json()["is_liked"] is True
        assert like_resp.json()["likes_count"] == 1

        # 6. List my collections
        my_resp = await ac.get("/api/v1/collections/mine", headers=auth_headers)
        assert my_resp.status_code == 200
        my_collections = my_resp.json()
        assert len(my_collections) >= 1
        assert my_collections[0]["id"] == collection_id

        # 7. Search public collections
        search_resp = await ac.get("/api/v1/collections?search=Cyberpunk")
        assert search_resp.status_code == 200
        results = search_resp.json()
        assert len(results) >= 1
        assert results[0]["id"] == collection_id
