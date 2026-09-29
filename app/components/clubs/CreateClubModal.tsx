"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen, Calendar, Users, BookmarkPlus } from "lucide-react";
import { createClub, BookClub } from "@/app/lib/clubs-api";
import { useApp } from "@/app/context/AppContext";

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClubCreated: (newClub: BookClub) => void;
}

const CATEGORIES = [
  "High Fantasy & Epics",
  "Science Fiction",
  "Manga & Comics",
  "Classics",
  "Mystery & Thriller",
  "Non-Fiction & Philosophy",
  "Romance & Drama",
  "General Fiction",
];

export default function CreateClubModal({
  isOpen,
  onClose,
  onClubCreated,
}: CreateClubModalProps) {
  const { user, setAuthModalOpen } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [currentBookTitle, setCurrentBookTitle] = useState("");
  const [currentBookAuthor, setCurrentBookAuthor] = useState("");
  const [currentChapterTarget, setCurrentChapterTarget] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a club name.");
      return;
    }

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const club = await createClub({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        current_book_title: currentBookTitle.trim() || undefined,
        current_book_author: currentBookAuthor.trim() || undefined,
        current_chapter_target: currentChapterTarget.trim() || undefined,
        meeting_schedule: meetingSchedule.trim() || undefined,
        cover_image: "/covers/ashfall-01.webp",
      });

      onClubCreated(club);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create club");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-lg rounded-2xl border border-[#d3c9b5] bg-mono-50 p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-mono-800 text-mono-50 grid place-items-center">
                <BookmarkPlus className="size-4.5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-mono-900">
                  Create a Book Club
                </h3>
                <p className="text-xs text-mono-500">
                  Read books together and set community discussion schedules.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="size-7 rounded-full bg-mono-200 text-mono-600 grid place-items-center hover:bg-mono-300 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-mono-800 mb-1">
                Club Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brandon Sanderson Society"
                className="w-full rounded-lg border border-[#d3c9b5] bg-mono-100 p-2.5 outline-none focus:border-mono-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-mono-800 mb-1">
                  Genre / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-[#d3c9b5] bg-mono-100 p-2.5 outline-none focus:border-mono-600"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-mono-800 mb-1">
                  Meeting Schedule
                </label>
                <input
                  type="text"
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                  placeholder="e.g. Sundays 7:00 PM GMT"
                  className="w-full rounded-lg border border-[#d3c9b5] bg-mono-100 p-2.5 outline-none focus:border-mono-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-mono-800 mb-1">
                  First Reading Title
                </label>
                <input
                  type="text"
                  value={currentBookTitle}
                  onChange={(e) => setCurrentBookTitle(e.target.value)}
                  placeholder="e.g. The Way of Kings"
                  className="w-full rounded-lg border border-[#d3c9b5] bg-mono-100 p-2.5 outline-none focus:border-mono-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-mono-800 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={currentBookAuthor}
                  onChange={(e) => setCurrentBookAuthor(e.target.value)}
                  placeholder="e.g. Brandon Sanderson"
                  className="w-full rounded-lg border border-[#d3c9b5] bg-mono-100 p-2.5 outline-none focus:border-mono-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-mono-800 mb-1">
                Target Milestone
              </label>
              <input
                type="text"
                value={currentChapterTarget}
                onChange={(e) => setCurrentChapterTarget(e.target.value)}
                placeholder="e.g. Chapters 1 to 10 for Week 1"
                className="w-full rounded-lg border border-[#d3c9b5] bg-mono-100 p-2.5 outline-none focus:border-mono-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-mono-800 mb-1">
                Club Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this club about? Who should join?"
                className="w-full rounded-lg border border-[#d3c9b5] bg-mono-100 p-2.5 outline-none focus:border-mono-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-mono-600 hover:bg-mono-200 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-mono-800 text-mono-50 hover:bg-mono-700 font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Club"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
