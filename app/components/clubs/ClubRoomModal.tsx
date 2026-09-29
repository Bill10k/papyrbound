"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  BookOpen,
  Calendar,
  Send,
  Sparkles,
  ShieldCheck,
  Bookmark,
  MessageCircle,
  LogIn,
} from "lucide-react";
import {
  BookClub,
  ClubMessage,
  fetchClubMessages,
  postClubMessage,
  joinClub,
  leaveClub,
} from "@/app/lib/clubs-api";
import { useApp } from "@/app/context/AppContext";

interface ClubRoomModalProps {
  club: BookClub | null;
  isOpen: boolean;
  onClose: () => void;
  onClubUpdated?: (updatedClub: BookClub) => void;
}

export default function ClubRoomModal({
  club,
  isOpen,
  onClose,
  onClubUpdated,
}: ClubRoomModalProps) {
  const { user, setAuthModalOpen } = useApp();
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chapterRef, setChapterRef] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (club && isOpen) {
      setIsJoined(club.is_joined || false);
      setMembersCount(club.members_count || 1);
      setChapterRef(club.current_chapter_target || "");
      loadMessages();
    }
  }, [club, isOpen]);

  const loadMessages = async () => {
    if (!club) return;
    setLoadingMessages(true);
    try {
      const msgs = await fetchClubMessages(club.id);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleToggleJoin = async () => {
    if (!club) return;
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setActionLoading(true);
    try {
      if (isJoined) {
        await leaveClub(club.id);
        setIsJoined(false);
        setMembersCount((prev) => Math.max(1, prev - 1));
        if (onClubUpdated) {
          onClubUpdated({ ...club, is_joined: false, members_count: Math.max(1, membersCount - 1) });
        }
      } else {
        await joinClub(club.id);
        setIsJoined(true);
        setMembersCount((prev) => prev + 1);
        if (onClubUpdated) {
          onClubUpdated({ ...club, is_joined: true, members_count: membersCount + 1 });
        }
      }
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club || !newMessage.trim()) return;

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const msg = await postClubMessage(club.id, newMessage.trim(), chapterRef.trim() || undefined);
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err: any) {
      alert(err.message || "Failed to post message");
    }
  };

  if (!isOpen || !club) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-[#d3c9b5] bg-mono-100 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <header className="px-6 py-4.5 bg-mono-50 border-b border-[#d3c9b5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-700 text-mono-50 grid place-items-center font-bold text-sm shadow-xs">
                {club.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-serif font-bold text-mono-900 leading-tight">
                    {club.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-mono-200 text-mono-800">
                    {club.category}
                  </span>
                </div>
                <p className="text-xs text-mono-600 flex items-center gap-2 mt-0.5">
                  <Users className="size-3 text-emerald-700" />
                  <span>{membersCount} active members</span>
                  {club.created_by && (
                    <span>• Hosted by @{club.created_by.username}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleToggleJoin}
                disabled={actionLoading}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                  isJoined
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                    : "bg-mono-800 text-mono-50 hover:bg-mono-700"
                }`}
              >
                {actionLoading ? "..." : isJoined ? "Member ✓" : "Join Club"}
              </button>

              <button
                onClick={onClose}
                className="size-8 rounded-full bg-mono-200 text-mono-700 grid place-items-center hover:bg-mono-300 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          {/* Current Reading Milestone Banner */}
          <div className="px-6 py-3 bg-gradient-to-r from-amber-50 via-mono-50 to-emerald-50 border-b border-[#d3c9b5] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-medium text-mono-900">
                <BookOpen className="size-4 text-amber-700" />
                <span>Current Read: <strong>{club.current_book_title || "Group Selection"}</strong></span>
                {club.current_book_author && (
                  <span className="text-mono-500">by {club.current_book_author}</span>
                )}
              </div>
              {club.current_chapter_target && (
                <span className="px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 text-[11px] font-mono">
                  Target: {club.current_chapter_target}
                </span>
              )}
            </div>

            {club.meeting_schedule && (
              <div className="flex items-center gap-1.5 text-emerald-800 font-mono text-[11px]">
                <Calendar className="size-3.5" />
                <span>Next Meeting: {club.meeting_schedule}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {club.description && (
            <div className="px-6 py-2.5 bg-mono-50/50 border-b border-[#d3c9b5]/60 text-xs text-mono-600">
              {club.description}
            </div>
          )}

          {/* Chat / Discussion Room Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[260px] max-h-[380px]">
            {loadingMessages ? (
              <div className="text-center py-10 text-xs text-mono-500">
                Loading discussion room messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#d3c9b5] rounded-xl bg-mono-50/50 space-y-2">
                <MessageCircle className="size-8 text-mono-400 mx-auto" />
                <h4 className="text-sm font-semibold text-mono-800">No discussion posts yet</h4>
                <p className="text-xs text-mono-500 max-w-sm mx-auto">
                  Be the first to share your thoughts, predictions, or favourite quotes for this reading milestone!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-[#d3c9b5] bg-mono-50 p-3.5 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-mono-800 text-mono-50 grid place-items-center text-[10px] font-bold">
                        {(msg.user?.display_name || "R").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-mono-900">
                        {msg.user?.display_name || "Community Reader"}
                      </span>
                      <span className="text-[10px] text-mono-500 font-mono">
                        @{msg.user?.username || "reader"}
                      </span>
                      {msg.chapter_reference && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-medium">
                          {msg.chapter_reference}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-mono-400 font-mono">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-xs text-mono-800 pl-8 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Message Composer Footer */}
          <footer className="p-4 bg-mono-50 border-t border-[#d3c9b5]">
            {user ? (
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chapterRef}
                    onChange={(e) => setChapterRef(e.target.value)}
                    placeholder="Chapter / Page tag (e.g. Ch. 12)"
                    className="w-44 text-xs rounded-lg border border-[#d3c9b5] bg-mono-100 px-2.5 py-1.5 outline-none focus:border-mono-600 transition-colors"
                  />
                  <span className="text-[11px] text-mono-500">
                    Posting as <strong>{user.display_name}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message, quote, or discussion thought..."
                    className="flex-1 text-xs rounded-lg border border-[#d3c9b5] bg-mono-100 px-3 py-2 outline-none focus:border-mono-600 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mono-800 text-mono-50 text-xs font-semibold hover:bg-mono-700 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="size-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <LogIn className="size-4 text-amber-700" />
                  <span>Join the conversation by signing in to your Papyrbound account.</span>
                </div>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-amber-800 text-mono-50 font-medium hover:bg-amber-700 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
