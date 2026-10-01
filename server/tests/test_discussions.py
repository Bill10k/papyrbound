import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_discussions_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register a test author
        reg_resp = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": "discussauthor@example.com",
                "username": "discussauthor",
                "password": "Password123!",
                "display_name": "Discuss Author",
            },
        )
        assert reg_resp.status_code == 201
        token = reg_resp.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 2. List initial discussions (clean database initially)
        list_resp = await ac.get("/api/v1/discussions")
        assert list_resp.status_code == 200
        discussions = list_resp.json()
        assert isinstance(discussions, list)

        # 3. Post a new discussion comment on a specific chapter
        post_payload = {
            "book_title": "The Way of Kings",
            "book_author": "Brandon Sanderson",
            "chapter_index": 5,
            "chapter_title": "Chapter 6: Bridge Four",
            "content": "Kaladin's decision to survive against all odds here is one of the greatest moments in modern fantasy.",
            "is_spoiler": False,
        }
        create_resp = await ac.post("/api/v1/discussions", json=post_payload, headers=auth_headers)
        assert create_resp.status_code == 201
        created_post = create_resp.json()
        assert created_post["book_title"] == "The Way of Kings"
        assert created_post["chapter_index"] == 5
        assert created_post["user"]["username"] == "discussauthor"
        post_id = created_post["id"]

        # 4. Filter discussions by book and chapter
        filter_resp = await ac.get(f"/api/v1/discussions?book_title=The+Way+of+Kings&chapter_index=5")
        assert filter_resp.status_code == 200
        filtered = filter_resp.json()
        assert len(filtered) == 1
        assert filtered[0]["id"] == post_id

        # 5. Like discussion post
        like_resp = await ac.post(f"/api/v1/discussions/{post_id}/like", headers=auth_headers)
        assert like_resp.status_code == 200
        assert like_resp.json()["is_liked"] is True
        assert like_resp.json()["likes_count"] == 1

        # 6. Unlike discussion post
        unlike_resp = await ac.post(f"/api/v1/discussions/{post_id}/like", headers=auth_headers)
        assert unlike_resp.status_code == 200
        assert unlike_resp.json()["is_liked"] is False
        assert unlike_resp.json()["likes_count"] == 0

        # 7. Post a private discussion scoped to a club
        priv_post_payload = {
            "book_title": "Dune",
            "book_author": "Frank Herbert",
            "chapter_index": 1,
            "chapter_title": "Chapter 1",
            "content": "Secret note for my book club members only!",
            "is_private": True,
            "club_id": "test-club-123",
        }
        priv_create_resp = await ac.post("/api/v1/discussions", json=priv_post_payload, headers=auth_headers)
        assert priv_create_resp.status_code == 201
        assert priv_create_resp.json()["is_private"] is True
        assert priv_create_resp.json()["club_id"] == "test-club-123"
        priv_id = priv_create_resp.json()["id"]

        # 8. Public listing should NOT include the private discussion
        pub_disc_resp = await ac.get("/api/v1/discussions")
        assert pub_disc_resp.status_code == 200
        pub_posts = pub_disc_resp.json()
        assert all(p["id"] != priv_id for p in pub_posts)

        # 9. Club-scoped listing SHOULD return the private discussion
        club_disc_resp = await ac.get("/api/v1/discussions?club_id=test-club-123")
        assert club_disc_resp.status_code == 200
        assert len(club_disc_resp.json()) == 1
        assert club_disc_resp.json()[0]["id"] == priv_id

