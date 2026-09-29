# Papyrbound User Accounts and Google Authentication

## Overview
The next major feature for Papyrbound transforms the app from a local EPUB reader into an interconnected reading community platform.

The goal is to give users a **Papyrbound account** that can optionally be connected to **Google OAuth 2.0 (PKCE)**. This account supports social features such as book discussions, chapter-level comments, book clubs, group chats, profiles, notifications, and cloud synchronization.

> **Core Architectural Rule**:
> A Google account is an authentication method for a Papyrbound account. It is not the Papyrbound account itself.

---

## 1. Account Architecture

```text
                           PAPYRBOUND
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
    Desktop Application                       Online API
            │                                     │
    ┌───────┴───────┐                     ┌───────┴───────┐
    │               │                     │               │
  React           Tauri              Auth Service   Social Service
    │               │                     │               │
  Rust           SQLite              PostgreSQL      WebSockets
    │               │                     │               │
    └───────┬───────┘                     └───────┬───────┘
            │                                     │
      Local Library                         Cloud Library
      EPUB Reader                           User Accounts
      Reading Progress                      Book Clubs
      Offline Settings                      Discussions & Chat
```

### Local Application
The existing Tauri, React, Rust, and SQLite architecture continues handling the reader and local data:
- EPUB and comic metadata
- Local library storage
- Reading progress and bookmarks
- Reader settings and reading sessions
- Full offline usage

### Online Backend
The online Papyrbound API handles features requiring accounts and multi-user communication:
- User identity & profiles
- Google OAuth & Token management
- Book discussions with chapter-based spoiler protection
- Book clubs & club group chats
- Direct messaging & notifications
- Cloud library metadata sync

---

## 2. User Database Design (PostgreSQL)

```sql
-- Core User Profile
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Authentication Providers (Google, Email/Password, etc.)
CREATE TABLE auth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'email', 'apple', 'github'
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- Book Discussions
CREATE TABLE book_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_identifier TEXT NOT NULL,
    book_title TEXT NOT NULL,
    chapter_index INTEGER,
    chapter_title TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Book Clubs
CREATE TABLE book_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    current_book_title TEXT,
    next_meeting_at TIMESTAMPTZ,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Book Club Members
CREATE TABLE book_club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);
```

---

## 3. Google OAuth with PKCE Flow

For the Tauri desktop application, we use the **OAuth 2.0 Authorization Code Flow with PKCE** to avoid bundling Google client secrets in the desktop client binary.

```text
 Papyrbound Desktop                     Browser / Google Auth                Papyrbound Server
        │                                        │                                   │
        │── 1. "Continue with Google" ───────────►                                   │
        │      (Generates code_verifier & code_challenge)                            │
        │                                        │                                   │
        │                                        │── 2. User signs in & consents ───►│
        │                                        │                                   │
        │                                        │◄─ 3. Redirect with auth code ─────│
        │                                        │      https://api.papyrbound.com/auth/google/callback
        │                                        │                                   │
        │◄─ 4. Deep link callback ───────────────┘                                   │
        │      papyrbound://auth/callback?code=...                                   │
        │                                                                            │
        │── 5. Exchange code + code_verifier for session token ─────────────────────►│
        │                                                                            │
        │◄─ 6. Authenticated session token & user profile ───────────────────────────│
```

---

## 4. Reading Context & Spoiler Protection System

Because Papyrbound understands user reading progress, messages carry reading context:

```typescript
interface DiscussionMessage {
  id: string;
  book_id: string;
  book_title: string;
  chapter_index: number;
  chapter_title?: string;
  user: {
    id: string;
    display_name: string;
    username: string;
    avatar_url?: string;
  };
  content: string;
  created_at: string;
  likes: number;
  replies_count: number;
}
```

### Dynamic Spoiler Shield:
When user's current reading progress `< message.chapter_index`:
* Automatically obscure comment body with a blur/spoiler shield:
  > **⚠️ Spoiler Warning** (Chapter 20 content — you are currently on Chapter 3)
  > `[ Click to reveal ]`

---

## 5. Phased Roadmap

| Phase | Milestone | Key Features |
|-------|-----------|--------------|
| **Phase 1** | Reader (Current) | Local SQLite library, CBZ/EPUB engines, RTL Dual spread, Highlights & bookmarks |
| **Phase 2** | User Accounts | Google OAuth PKCE, Deep links, User Profiles, Auth state |
| **Phase 3** | Discussions & Social Annotations | Book & Chapter discussion rooms, Spoiler Shield, Highlight Sharing |
| **Phase 4** | Book Clubs | Create/Join Clubs, Scheduled Discussions, Club Chat |
| **Phase 5** | Direct Messaging & Cloud Sync | 1-on-1 chats, Real-time notifications, Cloud metadata synchronization |
