import { getStoredToken, UserProfile } from "./auth-api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface BookClub {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  cover_image?: string | null;
  current_book_title?: string | null;
  current_book_author?: string | null;
  current_chapter_target?: string | null;
  meeting_schedule?: string | null;
  is_private: boolean;
  invite_code?: string | null;
  created_by_id?: string | null;
  created_at: string;
  updated_at: string;
  members_count: number;
  is_joined: boolean;
  created_by?: UserProfile | null;
}

export interface ClubMessage {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  chapter_reference?: string | null;
  is_pinned: boolean;
  created_at: string;
  user?: UserProfile | null;
}

export interface CreateClubPayload {
  name: string;
  category?: string;
  description?: string;
  current_book_title?: string;
  current_book_author?: string;
  current_chapter_target?: string;
  meeting_schedule?: string;
  cover_image?: string;
  is_private?: boolean;
}

function getAuthHeader(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchClubs(category?: string, search?: string): Promise<BookClub[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (search && search.trim()) params.append("search", search.trim());

    const url = `${API_BASE}/clubs${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch book clubs (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn("Could not fetch remote clubs, using fallback:", err);
    return [];
  }
}

export async function fetchMyClubs(): Promise<BookClub[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE}/clubs/mine`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user clubs (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn("Could not fetch my clubs:", err);
    return [];
  }
}

export async function fetchClubByCode(inviteCode: string): Promise<BookClub> {
  const res = await fetch(`${API_BASE}/clubs/code/${encodeURIComponent(inviteCode)}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Book club not found with this code");
  }

  return await res.json();
}

export async function joinClubByCode(inviteCode: string): Promise<BookClub> {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to join a book club.");

  const res = await fetch(`${API_BASE}/clubs/join-by-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ invite_code: inviteCode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to join club with this invite code");
  }

  return await res.json();
}

export async function fetchClubDetails(clubIdOrSlug: string): Promise<BookClub> {
  const res = await fetch(`${API_BASE}/clubs/${encodeURIComponent(clubIdOrSlug)}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load club details (${res.status})`);
  }

  return await res.json();
}

export async function createClub(payload: CreateClubPayload): Promise<BookClub> {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to create a book club.");

  const res = await fetch(`${API_BASE}/clubs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create book club");
  }

  return await res.json();
}

export async function joinClub(clubIdOrSlug: string): Promise<{ joined: boolean; message: string }> {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to join a book club.");

  const res = await fetch(`${API_BASE}/clubs/${encodeURIComponent(clubIdOrSlug)}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to join club");
  }

  return await res.json();
}

export async function leaveClub(clubIdOrSlug: string): Promise<{ joined: boolean; message: string }> {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to leave a book club.");

  const res = await fetch(`${API_BASE}/clubs/${encodeURIComponent(clubIdOrSlug)}/leave`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to leave club");
  }

  return await res.json();
}

export async function fetchClubMessages(clubIdOrSlug: string): Promise<ClubMessage[]> {
  try {
    const res = await fetch(`${API_BASE}/clubs/${encodeURIComponent(clubIdOrSlug)}/messages`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch club messages (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn("Could not fetch club messages:", err);
    return [];
  }
}

export async function postClubMessage(
  clubIdOrSlug: string,
  content: string,
  chapterReference?: string
): Promise<ClubMessage> {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to post in a book club.");

  const res = await fetch(`${API_BASE}/clubs/${encodeURIComponent(clubIdOrSlug)}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
      chapter_reference: chapterReference || null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to post message to book club");
  }

  return await res.json();
}
