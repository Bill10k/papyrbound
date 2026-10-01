"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  Lock,
  Globe,
  KeyRound,
  BookOpen,
  Calendar,
  Sparkles,
  MessageSquare,
  Heart,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import {
  fetchClubs,
  fetchMyClubs,
  joinClub,
  leaveClub,
  joinClubByCode,
  BookClub,
} from "@/app/lib/clubs-api";
import {
  fetchDiscussions,
  createDiscussion,
  toggleDiscussionLike,
  DiscussionComment,
} from "@/app/lib/discussions-api";
import CreateClubModal from "@/app/components/clubs/CreateClubModal";
import ClubRoomModal from "@/app/components/clubs/ClubRoomModal";

const CATEGORIES = [
  "All",
  "High Fantasy & Epics",
  "Science Fiction",
  "Manga & Comics",
  "Classics",
  "Mystery & Thriller",
  "Non-Fiction & Philosophy",
  "Romance & Drama",
  "General Fiction",
];

export default function BookClubsPage() {
  const { user, setAuthModalOpen } = useApp();

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"explore" | "my-clubs" | "discussions">("explore");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Clubs State
  const [publicClubs, setPublicClubs] = useState<BookClub[]>([]);
  const [myClubs, setMyClubs] = useState<BookClub[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [activeClubRoom, setActiveClubRoom] = useState<BookClub | null>(null);
  const [createClubOpen, setCreateClubOpen] = useState(false);

  // Invite Code Join State
  const [inviteInput, setInviteInput] = useState("");
  const [joiningCode, setJoiningCode] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Discussions State
  const [discussions, setDiscussions] = useState<DiscussionComment[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [newDiscBookTitle, setNewDiscBookTitle] = useState("");
  const [newDiscBookAuthor, setNewDiscBookAuthor] = useState("");
  const [newDiscChapterIndex, setNewDiscChapterIndex] = useState(1);
  const [newDiscChapterTitle, setNewDiscChapterTitle] = useState("");
  const [newDiscContent, setNewDiscContent] = useState("");
  const [newDiscIsSpoiler, setNewDiscIsSpoiler] = useState(false);
  const [postingDiscussion, setPostingDiscussion] = useState(false);
  const [postFormOpen, setPostFormOpen] = useState(false);

  useEffect(() => {
    loadClubs();
    loadMyClubsData();
    loadDiscussions();
  }, [user]);

  const loadClubs = async () => {
    setLoadingClubs(true);
    try {
      const data = await fetchClubs(selectedCategory, searchQuery);
      setPublicClubs(data || []);
    } catch (err) {
      console.warn("Failed to load clubs:", err);
      setPublicClubs([]);
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadMyClubsData = async () => {
    if (!user) {
      setMyClubs([]);
      return;
    }
    try {
      const data = await fetchMyClubs();
      setMyClubs(data || []);
    } catch (err) {
      console.warn("Failed to load my clubs:", err);
      setMyClubs([]);
    }
  };

  const loadDiscussions = async () => {
    setLoadingDiscussions(true);
    try {
      const data = await fetchDiscussions();
      setDiscussions(data || []);
    } catch (err) {
      console.warn("Failed to load discussions:", err);
      setDiscussions([]);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClubs();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setJoiningCode(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const club = await joinClubByCode(inviteInput.trim());
      setInviteSuccess(`Successfully joined "${club.name}"!`);
      setInviteInput("");
      loadMyClubsData();
      setActiveClubRoom(club);
    } catch (err: any) {
      setInviteError(err.message || "Failed to join with this invite code");
    } finally {
      setJoiningCode(false);
    }
  };

  const handleToggleJoin = async (e: React.MouseEvent, club: BookClub) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      if (club.is_joined) {
        await leaveClub(club.id);
      } else {
        await joinClub(club.id);
      }
      loadClubs();
      loadMyClubsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDiscussionLike = async (postId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await toggleDiscussionLike(postId);
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === postId
            ? { ...d, likes_count: res.likes_count, is_liked: res.is_liked }
            : d
        )
      );
    } catch (err) {
      console.warn("Failed to like post:", err);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscBookTitle.trim() || !newDiscContent.trim()) return;

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setPostingDiscussion(true);
    try {
      const created = await createDiscussion({
        book_title: newDiscBookTitle.trim(),
        book_author: newDiscBookAuthor.trim() || undefined,
        chapter_index: newDiscChapterIndex,
        chapter_title: newDiscChapterTitle.trim() || `Chapter ${newDiscChapterIndex}`,
        content: newDiscContent.trim(),
        is_spoiler: newDiscIsSpoiler,
        spoiler_warning: newDiscIsSpoiler ? "Contains plot spoilers" : undefined,
      });

      setDiscussions((prev) => [created, ...prev]);
      setNewDiscBookTitle("");
      setNewDiscBookAuthor("");
      setNewDiscChapterTitle("");
      setNewDiscContent("");
      setNewDiscIsSpoiler(false);
      setPostFormOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create discussion post");
    } finally {
      setPostingDiscussion(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-background p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Book Clubs & Discussions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Discover community reading clubs, start private reading circles, and share chapter reflections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (!user) {
                setAuthModalOpen(true);
              } else {
                setCreateClubOpen(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Create Club</span>
          </button>
        </div>
      </div>

      {/* Quick Join by Invite Code Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card/60 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <KeyRound className="size-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Have a Club Invite Code?</h3>
            <p className="text-[11px] text-muted-foreground">
              Enter a secret code (e.g. <span className="font-mono text-foreground font-semibold">#PAPYR-CLUB-XXXXXX</span>) to join a private circle.
            </p>
          </div>
        </div>

        <form onSubmit={handleJoinByCode} className="flex items-center gap-2">
          <input
            type="text"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder="Enter invite code..."
            className="w-56 text-xs rounded-xl border border-border bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-mono transition-colors"
          />
          <button
            type="submit"
            disabled={joiningCode || !inviteInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 text-xs font-semibold border border-border disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            <span>{joiningCode ? "Joining..." : "Join Circle"}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </form>
      </div>

      {inviteError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
          {inviteError}
        </div>
      )}

      {inviteSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          <span>{inviteSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("explore")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "explore"
              ? "bg-secondary text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Explore Public Clubs ({publicClubs.length})
        </button>

        <button
          onClick={() => setActiveTab("my-clubs")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "my-clubs"
              ? "bg-secondary text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>My Reading Circles</span>
          {myClubs.length > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold">
              {myClubs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("discussions")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "discussions"
              ? "bg-secondary text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Chapter Discussions</span>
          {discussions.length > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold">
              {discussions.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Explore Public Clubs */}
      {activeTab === "explore" && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-2xl">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clubs or books..."
                className="w-full text-xs rounded-xl border border-border bg-secondary/50 pl-8 pr-3 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Club Grid */}
          {loadingClubs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-secondary/40 animate-pulse" />
              ))}
            </div>
          ) : publicClubs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl p-8 space-y-3">
              <Users className="size-10 text-muted-foreground/60 mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">No public clubs found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Be the first to start a reading club for your favorite genre or book series!
              </p>
              <button
                onClick={() => setCreateClubOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Create a Club</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicClubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => setActiveClubRoom(club)}
                  className="rounded-2xl border border-border bg-card p-4 hover:border-border/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-secondary text-secondary-foreground">
                          {club.category}
                        </span>
                        <h3 className="text-sm font-serif font-bold text-foreground mt-1.5 group-hover:text-primary transition-colors">
                          {club.name}
                        </h3>
                      </div>
                      <div className="size-8 rounded-lg bg-primary/10 text-primary font-bold text-xs grid place-items-center shrink-0">
                        {club.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {club.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
                        {club.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <BookOpen className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        Read: <strong>{club.current_book_title || "Group Pick"}</strong>
                      </span>
                    </div>

                    {club.current_chapter_target && (
                      <div className="text-[11px] font-mono text-muted-foreground truncate">
                        Target: {club.current_chapter_target}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="size-3" />
                        <span>{club.members_count} readers</span>
                      </div>

                      <button
                        onClick={(e) => handleToggleJoin(e, club)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          club.is_joined
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
                        }`}
                      >
                        {club.is_joined ? "Joined ✓" : "Join"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Reading Circles (Private & Public) */}
      {activeTab === "my-clubs" && (
        <div className="space-y-4">
          {!user ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl p-8 space-y-3">
              <Lock className="size-10 text-muted-foreground/60 mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">Sign in to view your clubs</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sign in to view and manage your joined book clubs and private reading circles.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs cursor-pointer"
              >
                Log In
              </button>
            </div>
          ) : myClubs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl p-8 space-y-3">
              <Users className="size-10 text-muted-foreground/60 mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">You haven't joined any clubs yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Browse public clubs or enter an invite code to join a private reading group.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab("explore")}
                  className="px-4 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 cursor-pointer"
                >
                  Explore Clubs
                </button>
                <button
                  onClick={() => setCreateClubOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create Circle
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myClubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => setActiveClubRoom(club)}
                  className="rounded-2xl border border-border bg-card p-4 hover:border-border/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-secondary text-secondary-foreground">
                            {club.category}
                          </span>
                          {club.is_private ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Lock className="size-2.5" /> Private
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Globe className="size-2.5" /> Public
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-serif font-bold text-foreground mt-1.5 group-hover:text-primary transition-colors">
                          {club.name}
                        </h3>
                      </div>

                      <div className="size-8 rounded-lg bg-primary text-primary-foreground font-bold text-xs grid place-items-center shrink-0">
                        {club.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {club.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
                        {club.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <BookOpen className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        Read: <strong>{club.current_book_title || "Group Pick"}</strong>
                      </span>
                    </div>

                    {club.invite_code && (
                      <div className="text-[11px] font-mono text-muted-foreground truncate">
                        Code: <span className="text-foreground font-bold">{club.invite_code}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="size-3" />
                        <span>{club.members_count} readers</span>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                        Open Room →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Chapter Discussions */}
      {activeTab === "discussions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Community Chapter Discussions</h3>
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                } else {
                  setPostFormOpen(!postFormOpen);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <MessageSquare className="size-3.5" />
              <span>{postFormOpen ? "Cancel Post" : "Post Discussion"}</span>
            </button>
          </div>

          {/* New Discussion Composer */}
          {postFormOpen && (
            <form
              onSubmit={handleCreateDiscussion}
              className="p-4 rounded-2xl border border-border bg-card space-y-3 text-xs"
            >
              <h4 className="font-semibold text-foreground">Share a Note or Chapter Reflection</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newDiscBookTitle}
                  onChange={(e) => setNewDiscBookTitle(e.target.value)}
                  placeholder="Book Title *"
                  className="rounded-lg border border-border bg-secondary/50 p-2 text-foreground outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={newDiscBookAuthor}
                  onChange={(e) => setNewDiscBookAuthor(e.target.value)}
                  placeholder="Author (optional)"
                  className="rounded-lg border border-border bg-secondary/50 p-2 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  value={newDiscChapterIndex}
                  onChange={(e) => setNewDiscChapterIndex(parseInt(e.target.value) || 0)}
                  placeholder="Chapter #"
                  className="rounded-lg border border-border bg-secondary/50 p-2 text-foreground outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={newDiscChapterTitle}
                  onChange={(e) => setNewDiscChapterTitle(e.target.value)}
                  placeholder="Chapter Title (e.g. Chapter 4)"
                  className="rounded-lg border border-border bg-secondary/50 p-2 text-foreground outline-none focus:border-primary"
                />
              </div>

              <textarea
                required
                rows={3}
                value={newDiscContent}
                onChange={(e) => setNewDiscContent(e.target.value)}
                placeholder="What are your thoughts on this chapter?"
                className="w-full rounded-lg border border-border bg-secondary/50 p-2 text-foreground outline-none focus:border-primary"
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDiscIsSpoiler}
                    onChange={(e) => setNewDiscIsSpoiler(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Mark as spoiler</span>
                </label>

                <button
                  type="submit"
                  disabled={postingDiscussion}
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {postingDiscussion ? "Posting..." : "Publish"}
                </button>
              </div>
            </form>
          )}

          {/* Discussion List */}
          {loadingDiscussions ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-secondary/40 animate-pulse" />
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl p-8 space-y-2">
              <MessageSquare className="size-8 text-muted-foreground/60 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">No discussions posted yet</h4>
              <p className="text-xs text-muted-foreground">
                Be the first to share an insight or review from your current reading!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {discussions.map((item) => {
                const isSpoiler = item.is_spoiler;
                const isRevealed = revealedSpoilers[item.id];

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card p-4 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-primary text-primary-foreground font-bold text-xs grid place-items-center">
                          {(item.user?.display_name || "R").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground">
                            {item.user?.display_name || "Reader"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono ml-1.5">
                            @{item.user?.username || "reader"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] font-mono">
                          {item.book_title} • {item.chapter_title}
                        </span>
                        {isSpoiler && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-semibold flex items-center gap-1">
                            <ShieldAlert className="size-3" /> Spoiler
                          </span>
                        )}
                      </div>
                    </div>

                    {isSpoiler && !isRevealed ? (
                      <div className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Spoiler protected ({item.spoiler_warning || "Plot details"})
                        </span>
                        <button
                          onClick={() =>
                            setRevealedSpoilers((prev) => ({ ...prev, [item.id]: true }))
                          }
                          className="flex items-center gap-1 text-primary hover:underline font-medium cursor-pointer"
                        >
                          <Eye className="size-3.5" />
                          <span>Reveal</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground leading-relaxed pl-9">
                        {item.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between pl-9 pt-1 text-xs text-muted-foreground">
                      <span className="text-[10px] font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>

                      <button
                        onClick={() => handleToggleDiscussionLike(item.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          item.is_liked
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            : "hover:bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Heart
                          className={`size-3.5 ${item.is_liked ? "fill-rose-500 text-rose-500" : ""}`}
                        />
                        <span className="text-xs font-mono">{item.likes_count}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateClubModal
        isOpen={createClubOpen}
        onClose={() => setCreateClubOpen(false)}
        onClubCreated={(newClub) => {
          loadClubs();
          loadMyClubsData();
          setActiveClubRoom(newClub);
        }}
      />

      <ClubRoomModal
        club={activeClubRoom}
        isOpen={!!activeClubRoom}
        onClose={() => setActiveClubRoom(null)}
        onClubUpdated={() => {
          loadClubs();
          loadMyClubsData();
        }}
      />
    </div>
  );
}
