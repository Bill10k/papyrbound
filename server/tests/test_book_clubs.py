import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_book_clubs_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register a test user
        reg_resp = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": "clubmaster@example.com",
                "username": "clubmaster",
                "password": "Password123!",
                "display_name": "Club Master",
            },
        )
        assert reg_resp.status_code == 201
        token = reg_resp.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 2. List clubs (clean database initially)
        list_resp = await ac.get("/api/v1/clubs", headers=auth_headers)
        assert list_resp.status_code == 200
        clubs = list_resp.json()
        assert isinstance(clubs, list)

        # 3. Create a custom book club
        new_club_payload = {
            "name": "Cosmere Explorers",
            "category": "High Fantasy & Epics",
            "description": "Discussing Brandon Sanderson's Cosmere universe in depth.",
            "current_book_title": "The Way of Kings",
            "current_book_author": "Brandon Sanderson",
            "current_chapter_target": "Part 1: Above Silence",
            "meeting_schedule": "Saturdays 5:00 PM GMT",
        }
        create_resp = await ac.post("/api/v1/clubs", json=new_club_payload, headers=auth_headers)
        assert create_resp.status_code == 201
        created_club = create_resp.json()
        assert created_club["name"] == "Cosmere Explorers"
        assert created_club["members_count"] == 1
        assert created_club["is_joined"] is True
        club_id = created_club["id"]

        # 4. Post a message to the club thread
        msg_payload = {
            "content": "Welcome everyone to the Cosmere Explorers reading club! Let's conquer Roshar.",
            "chapter_reference": "Prologue: To Kill",
        }
        post_msg_resp = await ac.post(f"/api/v1/clubs/{club_id}/messages", json=msg_payload, headers=auth_headers)
        assert post_msg_resp.status_code == 201
        msg = post_msg_resp.json()
        assert msg["content"] == msg_payload["content"]
        assert msg["user"]["username"] == "clubmaster"

        # 5. List messages from club
        get_msgs_resp = await ac.get(f"/api/v1/clubs/{club_id}/messages")
        assert get_msgs_resp.status_code == 200
        msgs = get_msgs_resp.json()
        assert len(msgs) == 1
        assert msgs[0]["content"] == msg_payload["content"]

        # 6. Test second user joining and leaving
        reg_user2 = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": "reader2@example.com",
                "username": "reader2",
                "password": "Password123!",
                "display_name": "Second Reader",
            },
        )
        user2_headers = {"Authorization": f"Bearer {reg_user2.json()['access_token']}"}

        join_resp = await ac.post(f"/api/v1/clubs/{club_id}/join", headers=user2_headers)
        assert join_resp.status_code == 200
        assert join_resp.json()["joined"] is True

        # Check club details reflecting 2 members
        details_resp = await ac.get(f"/api/v1/clubs/{club_id}", headers=user2_headers)
        assert details_resp.status_code == 200
        assert details_resp.json()["members_count"] == 2
        assert details_resp.json()["is_joined"] is True

        # Leave club
        leave_resp = await ac.post(f"/api/v1/clubs/{club_id}/leave", headers=user2_headers)
        assert leave_resp.status_code == 200
        assert leave_resp.json()["joined"] is False

        # 7. Create a private club and verify invite code
        private_club_payload = {
            "name": "Secret Midnight Book Coven",
            "category": "Mystery & Thriller",
            "description": "Private readers only.",
            "is_private": True,
        }
        priv_resp = await ac.post("/api/v1/clubs", json=private_club_payload, headers=auth_headers)
        assert priv_resp.status_code == 201
        priv_club = priv_resp.json()
        assert priv_club["is_private"] is True
        assert "PAPYR-CLUB-" in priv_club["invite_code"]
        invite_code = priv_club["invite_code"]

        # 8. Public listing should NOT include the private club
        pub_list_resp = await ac.get("/api/v1/clubs")
        assert pub_list_resp.status_code == 200
        pub_clubs = pub_list_resp.json()
        assert all(c["id"] != priv_club["id"] for c in pub_clubs)

        # 9. Get club by invite code
        code_resp = await ac.get(f"/api/v1/clubs/code/{invite_code}")
        assert code_resp.status_code == 200
        assert code_resp.json()["name"] == "Secret Midnight Book Coven"

        # 10. Join private club via invite code
        join_code_resp = await ac.post("/api/v1/clubs/join-by-code", json={"invite_code": invite_code}, headers=user2_headers)
        assert join_code_resp.status_code == 200
        assert join_code_resp.json()["is_joined"] is True

        # 11. Verify user2 sees it in /mine
        mine_resp = await ac.get("/api/v1/clubs/mine", headers=user2_headers)
        assert mine_resp.status_code == 200
        my_clubs = mine_resp.json()
        assert any(c["id"] == priv_club["id"] for c in my_clubs)

