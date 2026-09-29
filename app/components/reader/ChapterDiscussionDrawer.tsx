"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquare,
  Send,
  Heart,
  ShieldAlert,
  Eye,
  EyeOff,
  Flame,
  LogIn,
  BookOpen,
} from "lucide-react";
import {
  DiscussionComment,
  fetchDiscussions,
  createDiscussion,
  toggleDiscussionLike,
} from "@/app/lib/discussions-api";
import { useApp } from "@/app/context/AppContext";
import type { BookDetails } from "@/app/types/epub";

interface ChapterDiscussionDrawerProps {
  book: BookDetails;
  currentChapterIndex: number;
  currentChapterTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChapterDiscussionDrawer({
  book,
  currentChapterIndex,
  currentChapterTitle,
  isOpen,
  onClose,
}: ChapterDiscussionDrawerProps) {
  const { user, setAuthModalOpen } = useApp();
  const [discussions, setDiscussions] = useState<DiscussionComment[]>([]);
  const [filterMode, setFilterMode] = useState<"chapter" | "book">("chapter");
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSpoilerChecked, setIsSpoilerChecked] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDiscussions();
    }
  }, [isOpen, filterMode, currentChapterIndex, book.title]);

  const loadDiscussions = async () => {
    setLoading(true);
    try {
      const data = await fetchDiscussions(
        book.title,
        filterMode === "chapter" ? currentChapterIndex : undefined
      );
      setDiscussions(data);
    } catch (err) {
      console.warn("Failed to load discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setPosting(true);
    try {
      const created = await createDiscussion({
        book_title: book.title,
        book_author: book.author || undefined,
        chapter_index: currentChapterIndex,
        chapter_title: currentChapterTitle || `Chapter ${currentChapterIndex + 1}`,
        content: newComment.trim(),
        is_spoiler: isSpoilerChecked,
        spoiler_warning: isSpoilerChecked ? "User marked this comment as a spoiler" : undefined,
      });

      setDiscussions((prev) => [created, ...prev]);
      setNewComment("");
      setIsSpoilerChecked(false);
    } catch (err: any) {
      alert(err.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await toggleDiscussionLike(postId);
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === postId
            ? { ...d, is_liked: res.is_liked, likes_count: res.likes_count }
            : d
        )
      );
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Side Drawer */}
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-md h-full flex flex-col border-l border-[#d3c9b5] bg-mono-100 shadow-2xl text-mono-800"
        >
          {/* Header */}
          <header className="p-5 border-b border-[#d3c9b5] bg-mono-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-amber-700 text-mono-50 grid place-items-center font-bold text-sm shadow-xs">
                <MessageSquare className="size-4.5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-mono-900 leading-tight">
                  Book Discussions
                </h3>
                <p className="text-[11px] text-mono-500 font-mono truncate max-w-[220px]">
                  {book.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="size-8 rounded-full bg-mono-200 text-mono-700 grid place-items-center hover:bg-mono-300 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </header>

          {/* Scope Filter Tabs & Reading Context */}
          <div className="px-5 py-3 border-b border-[#d3c9b5]/70 bg-mono-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-mono-700 flex items-center gap-1.5 font-mono">
                <BookOpen className="size-3.5 text-amber-700" />
                <span>Reading: Chapter {currentChapterIndex + 1}</span>
              </span>

              <div className="flex items-center gap-1 bg-mono-200/80 p-0.5 rounded-lg text-[10px] font-medium">
                <button
                  onClick={() => setFilterMode("chapter")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterMode === "chapter"
                      ? "bg-mono-800 text-mono-50 shadow-xs"
                      : "text-mono-600 hover:text-mono-900"
                  }`}
                >
                  This Chapter
                </button>
                <button
                  onClick={() => setFilterMode("book")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterMode === "book"
                      ? "bg-mono-800 text-mono-50 shadow-xs"
                      : "text-mono-600 hover:text-mono-900"
                  }`}
                >
                  All Book
                </button>
              </div>
            </div>
          </div>

          {/* Discussions Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {loading ? (
              <div className="text-center py-12 text-xs text-mono-500 font-mono">
                Loading chapter commentary...
              </div>
            ) : discussions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#d3c9b5] rounded-xl bg-mono-50/50 p-4 space-y-2">
                <Flame className="size-7 text-amber-600/70 mx-auto" />
                <p className="text-xs font-semibold text-mono-800">
                  No comments on this chapter yet
                </p>
                <p className="text-[11px] text-mono-500 max-w-xs mx-auto">
                  Be the first to share your reaction, highlight thoughts, or theory on this scene!
                </p>
              </div>
            ) : (
              discussions.map((item) => {
                const isBeyondCurrentChapter = item.chapter_index > currentChapterIndex;
                const isSpoilerProtected = (item.is_spoiler || isBeyondCurrentChapter) && !revealedSpoilers[item.id];

                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-[#d3c9b5] bg-mono-50 p-4 shadow-xs space-y-2.5 transition-all"
                  >
                    {/* Author & Chapter tag */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-mono-800 text-mono-50 grid place-items-center text-[10px] font-bold">
                          {(item.user?.display_name || "R").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-mono-900 leading-tight">
                            {item.user?.display_name || "Community Reader"}
                          </p>
                          <span className="text-[10px] text-mono-500 font-mono">
                            @{item.user?.username || "reader"}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-mono-200 text-mono-800 text-[10px] font-mono font-medium">
                        {item.chapter_title}
                      </span>
                    </div>

                    {/* Content / Spoiler Shield */}
                    {isSpoilerProtected ? (
                      <div className="rounded-lg border border-amber-300 bg-amber-50/90 p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold">
                          <ShieldAlert className="size-4 text-amber-600 shrink-0" />
                          <span>
                            {isBeyondCurrentChapter
                              ? `Mentions Chapter ${item.chapter_index + 1} (Ahead of your reading)`
                              : "Marked as Spoiler"}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleReveal(item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-200 text-amber-950 hover:bg-amber-300 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="size-3" />
                          Reveal Comment
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-mono-800 leading-relaxed">
                          {item.content}
                        </p>
                        {(item.is_spoiler || isBeyondCurrentChapter) && (
                          <button
                            onClick={() => toggleReveal(item.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-mono-400 hover:text-mono-600 cursor-pointer"
                          >
                            <EyeOff className="size-2.5" /> Hide spoiler
                          </button>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-[#d3c9b5]/40 pt-2 text-[11px] text-mono-500">
                      <button
                        onClick={() => handleToggleLike(item.id)}
                        className={`flex items-center gap-1 transition-colors cursor-pointer ${
                          item.is_liked ? "text-rose-600 font-semibold" : "hover:text-mono-800"
                        }`}
                      >
                        <Heart
                          className="size-3.5"
                          fill={item.is_liked ? "currentColor" : "none"}
                        />
                        <span>{item.likes_count}</span>
                      </button>

                      <span className="font-mono text-[10px] text-mono-400">
                        {new Date(item.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Fast Composer Footer */}
          <footer className="p-4 bg-mono-50 border-t border-[#d3c9b5]">
            {user ? (
              <form onSubmit={handlePost} className="space-y-2.5">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Discuss Chapter ${currentChapterIndex + 1}...`}
                  className="w-full text-xs rounded-lg border border-[#d3c9b5] bg-mono-100 p-2.5 outline-none focus:border-mono-600 transition-colors"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-mono-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSpoilerChecked}
                      onChange={(e) => setIsSpoilerChecked(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span className="text-[11px] flex items-center gap-1">
                      <ShieldAlert className="size-3 text-amber-600" />
                      Contains Spoilers
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!newComment.trim() || posting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-mono-800 text-mono-50 text-xs font-semibold hover:bg-mono-700 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Send className="size-3" />
                    <span>{posting ? "Posting..." : "Post"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <LogIn className="size-4 text-amber-700 shrink-0" />
                  <span>Sign in to join chapter discussions.</span>
                </div>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-amber-800 text-mono-50 font-medium hover:bg-amber-700 cursor-pointer shrink-0"
                >
                  Sign In
                </button>
              </div>
            )}
          </footer>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}
