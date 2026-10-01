"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Lock, BookmarkPlus, Sparkles } from "lucide-react";
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
  const [isPrivate, setIsPrivate] = useState(false);
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
        is_private: isPrivate,
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
          className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                <BookmarkPlus className="size-4.5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground">
                  Create a Book Club
                </h3>
                <p className="text-xs text-muted-foreground">
                  Read books together and set community discussion schedules.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="size-7 rounded-full bg-secondary text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Privacy Toggle */}
            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                Privacy & Access
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    !isPrivate
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-border/80"
                  }`}
                >
                  <Globe className={`size-4 shrink-0 mt-0.5 ${!isPrivate ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <span className="block text-xs font-bold text-foreground">Public Club</span>
                    <span className="text-[10px] text-muted-foreground font-normal leading-tight block">
                      Discoverable by all readers in the community.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    isPrivate
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-border/80"
                  }`}
                >
                  <Lock className={`size-4 shrink-0 mt-0.5 ${isPrivate ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <span className="block text-xs font-bold text-foreground">Private Circle</span>
                    <span className="text-[10px] text-muted-foreground font-normal leading-tight block">
                      Secret invite code only. Not listed publicly.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Club Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brandon Sanderson Society"
                className="w-full rounded-lg border border-border bg-secondary/50 p-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Genre / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 p-2.5 text-foreground outline-none focus:border-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Meeting Schedule
                </label>
                <input
                  type="text"
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                  placeholder="e.g. Sundays 7:00 PM GMT"
                  className="w-full rounded-lg border border-border bg-secondary/50 p-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Current Reading Title
                </label>
                <input
                  type="text"
                  value={currentBookTitle}
                  onChange={(e) => setCurrentBookTitle(e.target.value)}
                  placeholder="e.g. The Way of Kings"
                  className="w-full rounded-lg border border-border bg-secondary/50 p-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={currentBookAuthor}
                  onChange={(e) => setCurrentBookAuthor(e.target.value)}
                  placeholder="e.g. Brandon Sanderson"
                  className="w-full rounded-lg border border-border bg-secondary/50 p-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Target Milestone
              </label>
              <input
                type="text"
                value={currentChapterTarget}
                onChange={(e) => setCurrentChapterTarget(e.target.value)}
                placeholder="e.g. Chapters 1 to 10 for Week 1"
                className="w-full rounded-lg border border-border bg-secondary/50 p-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Club Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this club about? Who should join?"
                className="w-full rounded-lg border border-border bg-secondary/50 p-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creating..." : isPrivate ? "Create Private Circle" : "Create Public Club"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
