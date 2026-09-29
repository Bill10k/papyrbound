from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
import secrets
import json
import urllib.parse
from typing import Optional

from app.db.session import get_db
from app.models.user import User
from app.models.auth_account import AuthAccount
from app.schemas.auth import (
    Token,
    GoogleAuthInit,
    GoogleAuthExchange,
)
from app.core.security import create_access_token
from app.core.config import settings
from app.api.v1.endpoints.auth import format_user_out

router = APIRouter(prefix="/auth/google", tags=["Google OAuth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

# In-memory store for pending desktop OAuth handoffs keyed by state
PENDING_OAUTH_SESSIONS: dict[str, Optional[Token]] = {}


@router.get("/init", response_model=GoogleAuthInit)
async def init_google_oauth(
    code_challenge: Optional[str] = Query(None, description="Optional PKCE Code Challenge"),
    code_challenge_method: Optional[str] = Query("S256", description="PKCE method (S256 recommended)")
):
    """
    Initializes Google OAuth 2.0 flow for desktop/browser.
    Returns the authorization redirect URL with state and optional code_challenge.
    """
    state = secrets.token_urlsafe(32)
    PENDING_OAUTH_SESSIONS[state] = None
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID or "papyrbound-dev-client-id",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }
    if code_challenge:
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = code_challenge_method

    auth_url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return GoogleAuthInit(
        redirect_url=auth_url,
        state=state,
        code_challenge=code_challenge or ""
    )


@router.get("/status")
async def get_oauth_status(
    state: str = Query(..., description="OAuth state parameter")
):
    """
    Polling endpoint for desktop/webview clients to retrieve OAuth completion session.
    """
    if state in PENDING_OAUTH_SESSIONS and PENDING_OAUTH_SESSIONS[state] is not None:
        token_data = PENDING_OAUTH_SESSIONS[state]
        return {"authenticated": True, "token": token_data}
    return {"authenticated": False}


@router.get("/callback", response_class=HTMLResponse)
async def google_oauth_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Browser redirect endpoint from Google Consent Screen.
    Exchanges authorization code, issues Papyrbound JWT, and completes login in desktop/web client.
    """
    if error:
        return HTMLResponse(
            content=f"""
            <!DOCTYPE html>
            <html>
            <head><title>Authentication Error</title></head>
            <body style="font-family:system-ui;text-align:center;padding:50px;background:#fdfcf9;color:#1e1e1e;">
                <h2>Authentication Cancelled or Failed</h2>
                <p style="color:#e11d48;">{error}</p>
                <p>You can close this window and return to Papyrbound.</p>
                <script>
                    if (window.opener) {{
                        window.opener.postMessage({{ type: "PAPYRBOUND_AUTH_ERROR", error: "{error}" }}, "*");
                        setTimeout(() => window.close(), 2000);
                    }}
                </script>
            </body>
            </html>
            """,
            status_code=400,
        )

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code from Google.")

    google_client_id = settings.GOOGLE_CLIENT_ID
    google_client_secret = settings.GOOGLE_CLIENT_SECRET

    if not google_client_id or not google_client_secret:
        raise HTTPException(status_code=500, detail="Google OAuth credentials are not configured on the server.")

    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_data = {
            "client_id": google_client_id,
            "client_secret": google_client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        }
        token_resp = await client.post(GOOGLE_TOKEN_URL, data=token_data)
        if token_resp.status_code != 200:
            return HTMLResponse(
                content=f"""
                <!DOCTYPE html>
                <html>
                <body style="font-family:system-ui;text-align:center;padding:50px;background:#fdfcf9;color:#1e1e1e;">
                    <h2>Google Exchange Failed</h2>
                    <p style="color:#e11d48;">{token_resp.text}</p>
                </body>
                </html>
                """,
                status_code=400,
            )

        tokens = token_resp.json()
        access_token = tokens.get("access_token")

        # Fetch Google Profile
        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user profile from Google.")
        userinfo = userinfo_resp.json()

    token_obj = await _get_or_create_oauth_user(
        db=db,
        provider="google",
        provider_account_id=userinfo["sub"],
        email=userinfo["email"],
        display_name=userinfo.get("name", userinfo["email"].split("@")[0]),
        avatar_url=userinfo.get("picture")
    )

    if state:
        PENDING_OAUTH_SESSIONS[state] = token_obj

    user_json = token_obj.user.model_dump_json()
    redirect_web_url = f"http://localhost:3000?auth_token={token_obj.access_token}"
    deep_link_url = f"papyrbound://auth?auth_token={token_obj.access_token}"

    return HTMLResponse(
        content=f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Papyrbound - Sign In Successful</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    background: #fdfcf9;
                    color: #1a1a1a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                    box-sizing: border-box;
                }}
                .card {{
                    background: #ffffff;
                    border: 1px solid #d3c9b5;
                    border-radius: 20px;
                    padding: 40px 32px;
                    max-width: 420px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                }}
                .avatar {{
                    width: 68px;
                    height: 68px;
                    border-radius: 50%;
                    margin: 0 auto 16px;
                    background: #b45309;
                    color: #fff;
                    display: grid;
                    place-items: center;
                    font-size: 26px;
                    font-weight: bold;
                    box-shadow: 0 4px 12px rgba(180,83,9,0.25);
                }}
                h2 {{ margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1e1e1e; }}
                p {{ font-size: 13px; color: #555; margin: 0 0 18px; line-height: 1.5; }}
                .badge {{
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 14px;
                    border-radius: 9999px;
                    background: #d1fae5;
                    color: #065f46;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 24px;
                }}
                .btn {{
                    display: inline-block;
                    width: 100%;
                    padding: 12px 20px;
                    background: #1e1e1e;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    box-sizing: border-box;
                    transition: background 0.15s ease;
                }}
                .btn:hover {{
                    background: #333333;
                }}
            </style>
        </head>
        <body>
            <div class="card">
                <div class="avatar">{token_obj.user.display_name[:1].upper()}</div>
                <h2>Welcome, {token_obj.user.display_name}!</h2>
                <p>Google account connected successfully to Papyrbound.</p>
                <div class="badge">Authenticated ✓</div>
                <a href="{redirect_web_url}" class="btn">Open Papyrbound & Return to App</a>
            </div>

            <script>
                const token = "{token_obj.access_token}";
                const user = {user_json};
                const webUrl = "{redirect_web_url}";
                const deepLink = "{deep_link_url}";

                // Store in browser localStorage
                try {{
                    localStorage.setItem("papyrbound_access_token", token);
                    localStorage.setItem("papyrbound_user_profile", JSON.stringify(user));
                    localStorage.setItem("papyrbound_token", token);
                    localStorage.setItem("papyrbound_user", JSON.stringify(user));
                }} catch(e) {{}}

                // 1. Notify desktop application if opened via window.open
                if (window.opener) {{
                    try {{
                        window.opener.postMessage({{
                            type: "PAPYRBOUND_AUTH_SUCCESS",
                            token: token,
                            user: user
                        }}, "*");
                    }} catch(e) {{}}
                    setTimeout(() => {{
                        try {{ window.close(); }} catch(e) {{}}
                    }}, 1200);
                }}

                // 2. Attempt custom deep link protocol
                try {{
                    window.location.href = deepLink;
                }} catch(e) {{}}

                // 3. Auto-redirect browser tab to frontend with auth token
                setTimeout(() => {{
                    window.location.href = webUrl;
                }}, 1500);
            </script>
        </body>
        </html>
        """
    )


@router.post("/exchange", response_model=Token)
async def exchange_google_code(
    payload: GoogleAuthExchange,
    db: AsyncSession = Depends(get_db)
):
    """
    Exchanges the Google authorization code for Papyrbound user session.
    """
    google_client_id = settings.GOOGLE_CLIENT_ID
    google_client_secret = settings.GOOGLE_CLIENT_SECRET

    # If in test/dev mode with a mock code or without live Google credentials, handle structured mock exchange
    if payload.code.startswith("dev_") or payload.code.startswith("mock_") or not google_client_id or not google_client_secret:
        mock_google_id = f"google_{hash(payload.code) % 1000000}"
        mock_email = f"user_{mock_google_id}@gmail.com"
        mock_name = "Google Reader"
        
        return await _get_or_create_oauth_user(
            db=db,
            provider="google",
            provider_account_id=mock_google_id,
            email=mock_email,
            display_name=mock_name,
            avatar_url="https://lh3.googleusercontent.com/a/default-user"
        )

    # Production Google Token Exchange
    async with httpx.AsyncClient() as client:
        token_data = {
            "client_id": google_client_id,
            "client_secret": google_client_secret,
            "code": payload.code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        }
        if payload.code_verifier:
            token_data["code_verifier"] = payload.code_verifier

        token_resp = await client.post(GOOGLE_TOKEN_URL, data=token_data)
        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange authorization code with Google: {token_resp.text}"
            )
        tokens = token_resp.json()
        access_token = tokens.get("access_token")

        # Fetch Google Profile
        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user profile from Google."
            )
        userinfo = userinfo_resp.json()

    return await _get_or_create_oauth_user(
        db=db,
        provider="google",
        provider_account_id=userinfo["sub"],
        email=userinfo["email"],
        display_name=userinfo.get("name", userinfo["email"].split("@")[0]),
        avatar_url=userinfo.get("picture")
    )


async def _get_or_create_oauth_user(
    db: AsyncSession,
    provider: str,
    provider_account_id: str,
    email: str,
    display_name: str,
    avatar_url: str = None
) -> Token:
    # 1. Check if auth_account already linked
    acc_result = await db.execute(
        select(AuthAccount).where(
            AuthAccount.provider == provider,
            AuthAccount.provider_account_id == provider_account_id
        )
    )
    auth_account = acc_result.scalar_one_or_none()

    if auth_account:
        user_result = await db.execute(
            select(User).where(User.id == auth_account.user_id)
        )
        user = user_result.scalar_one()
        # Update avatar or display name if changed on Google
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        if display_name and not user.display_name:
            user.display_name = display_name
        await db.commit()
        await db.refresh(user)
    else:
        # 2. Check if a user with this email already exists
        user_result = await db.execute(
            select(User).where(User.email == email.lower())
        )
        user = user_result.scalar_one_or_none()

        if not user:
            # Create a brand new user
            base_username = email.split("@")[0].lower()
            unique_username = f"{base_username}_{secrets.token_hex(2)}"
            user = User(
                email=email.lower(),
                username=unique_username,
                display_name=display_name,
                avatar_url=avatar_url,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            await db.flush()

        # Link Google AuthAccount
        new_auth_account = AuthAccount(
            user_id=user.id,
            provider=provider,
            provider_account_id=provider_account_id,
        )
        db.add(new_auth_account)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=format_user_out(user)
    )
