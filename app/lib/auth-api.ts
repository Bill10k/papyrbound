/**
 * Papyrbound Backend Authentication Client
 * Connects the desktop frontend to the FastAPI authentication server.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  connected_providers: string[];
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

export interface RegisterPayload {
  email: string;
  username: string;
  display_name: string;
  password: string;
}

export interface LoginPayload {
  username_or_email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed");
  }

  const data: AuthTokenResponse = await response.json();
  saveAuthSession(data);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }

  const data: AuthTokenResponse = await response.json();
  saveAuthSession(data);
  return data;
}

export async function getCurrentUser(token?: string): Promise<UserProfile> {
  const authToken = token || getStoredToken();
  if (!authToken) {
    throw new Error("No authentication token available");
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Session expired or invalid token");
  }

  return response.json();
}

export async function initGoogleOAuth(codeChallenge?: string): Promise<{
  redirect_url: string;
  state: string;
  code_challenge: string;
}> {
  const url = codeChallenge
    ? `${API_BASE_URL}/auth/google/init?code_challenge=${encodeURIComponent(codeChallenge)}`
    : `${API_BASE_URL}/auth/google/init`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to initialize Google OAuth");
  }
  return response.json();
}

export async function exchangeGoogleCode(
  code: string,
  codeVerifier: string
): Promise<AuthTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, code_verifier: codeVerifier }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Google authentication exchange failed");
  }

  const data: AuthTokenResponse = await response.json();
  saveAuthSession(data);
  return data;
}

export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  clearAuthSession();
}

export function saveAuthSession(auth: AuthTokenResponse): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("papyrbound_access_token", auth.access_token);
    localStorage.setItem("papyrbound_user_profile", JSON.stringify(auth.user));
  } catch {
    // ignore
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("papyrbound_access_token");
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("papyrbound_user_profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("papyrbound_access_token");
  localStorage.removeItem("papyrbound_user_profile");
}
