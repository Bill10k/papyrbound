import { getStoredToken } from "./auth-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface Curator {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
}

export interface SharedCollectionItem {
  id: string;
  title: string;
  author?: string | null;
  cover_image?: string | null;
  curator_note?: string | null;
  order_index: number;
  created_at: string;
}

export interface SharedCollection {
  id: string;
  name: string;
  description?: string | null;
  theme_color: "amber" | "indigo" | "emerald" | "rose" | "slate" | string;
  share_code: string;
  is_public: boolean;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
  curator: Curator;
  items: SharedCollectionItem[];
}

export interface CreateCollectionItemPayload {
  title: string;
  author?: string;
  cover_image?: string;
  curator_note?: string;
  order_index?: number;
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
  theme_color?: string;
  is_public?: boolean;
  items: CreateCollectionItemPayload[];
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string;
  theme_color?: string;
  is_public?: boolean;
  items?: CreateCollectionItemPayload[];
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchPublicCollections(search?: string): Promise<SharedCollection[]> {
  const url = new URL(`${API_BASE_URL}/collections`);
  if (search) {
    url.searchParams.set("search", search);
  }
  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch public collections");
  }
  return response.json();
}

export async function fetchMyCollections(): Promise<SharedCollection[]> {
  const token = getStoredToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/collections/mine`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user collections");
  }
  return response.json();
}

export async function fetchCollection(idOrCode: string): Promise<SharedCollection> {
  const response = await fetch(`${API_BASE_URL}/collections/${encodeURIComponent(idOrCode)}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Collection not found");
  }
  return response.json();
}

export async function createSharedCollection(payload: CreateCollectionPayload): Promise<SharedCollection> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Please sign in to create and share collections");
  }

  const response = await fetch(`${API_BASE_URL}/collections`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create collection");
  }

  return response.json();
}

export async function updateSharedCollection(
  id: string,
  payload: UpdateCollectionPayload
): Promise<SharedCollection> {
  const response = await fetch(`${API_BASE_URL}/collections/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update collection");
  }

  return response.json();
}

export async function deleteSharedCollection(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/collections/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete collection");
  }
}

export async function toggleSharedCollectionLike(
  id: string
): Promise<{ is_liked: boolean; likes_count: number }> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Please sign in to like or bookmark collections");
  }

  const response = await fetch(`${API_BASE_URL}/collections/${encodeURIComponent(id)}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to like collection");
  }

  return response.json();
}
