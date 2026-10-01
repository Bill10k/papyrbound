import { getStoredToken, UserProfile } from "./auth-api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface DiscussionComment {
  id: string;
  book_title: string;
  book_author?: string | null;
  book_identifier?: string | null;
  chapter_index: number;
  chapter_title: string;
  user_id: string;
  content: string;
  is_spoiler: boolean;
  spoiler_warning?: string | null;
  is_private: boolean;
  club_id?: string | null;
  created_at: string;
  updated_at: string;
  likes_count: number;
  is_liked: boolean;
  user?: UserProfile | null;
}

export interface CreateDiscussionPayload {
  book_title: string;
  book_author?: string;
  book_identifier?: string;
  chapter_index: number;
  chapter_title: string;
  content: string;
  is_spoiler?: boolean;
  spoiler_warning?: string;
  is_private?: boolean;
  club_id?: string;
}

function getAuthHeader(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchDiscussions(
  bookTitle?: string,
  chapterIndex?: number,
  clubId?: string
): Promise<DiscussionComment[]> {
  try {
    const params = new URLSearchParams();
    if (bookTitle && bookTitle.trim()) params.append("book_title", bookTitle.trim());
    if (chapterIndex !== undefined && chapterIndex !== null) {
      params.append("chapter_index", chapterIndex.toString());
    }
    if (clubId) {
      params.append("club_id", clubId);
    }

    const url = `${API_BASE}/discussions${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to load discussions (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn("Could not fetch remote discussions:", err);
    return [];
  }
}

export async function createDiscussion(
  payload: CreateDiscussionPayload
): Promise<DiscussionComment> {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to post a discussion comment.");

  const res = await fetch(`${API_BASE}/discussions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to post discussion comment");
  }

  return await res.json();
}

export async function toggleDiscussionLike(
  postId: string
): Promise<{ post_id: string; is_liked: boolean; likes_count: number }> {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to like a comment.");

  const res = await fetch(`${API_BASE}/discussions/${encodeURIComponent(postId)}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to like discussion");
  }

  return await res.json();
}

export async function deleteDiscussion(postId: string): Promise<void> {
  const token = getStoredToken();
  if (!token) throw new Error("You must be signed in to delete a comment.");

  const res = await fetch(`${API_BASE}/discussions/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete discussion");
  }
}
