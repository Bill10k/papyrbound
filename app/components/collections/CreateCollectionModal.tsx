"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Check,
  Search,
  Globe,
  Lock,
  Loader2,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import {
  createSharedCollection,
  CreateCollectionItemPayload,
  SharedCollection,
} from "@/app/lib/collections-api";
import BookCover from "@/app/components/book-cover";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCollection: SharedCollection) => void;
}

const THEME_OPTIONS = [
  { id: "amber", label: "Warm Amber", gradient: "from-amber-600 to-stone-900" },
  { id: "indigo", label: "Cyberpunk Indigo", gradient: "from-indigo-600 to-slate-900" },
  { id: "emerald", label: "Forest Emerald", gradient: "from-emerald-600 to-teal-950" },
  { id: "rose", label: "Rose Twilight", gradient: "from-rose-600 to-slate-950" },
  { id: "slate", label: "Dark Slate", gradient: "from-slate-700 to-zinc-950" },
];

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCollectionModalProps) {
  const { books, user, setAuthModalOpen } = useApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [themeColor, setThemeColor] = useState("amber");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedBooks, setSelectedBooks] = useState<
    Array<{
      title: string;
      author?: string;
      cover_image?: string;
      curator_note?: string;
    }>
  >([]);
  const [librarySearch, setLibrarySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleBookSelection = (book: (typeof books)[0]) => {
    const isSelected = selectedBooks.some(
      (b) => b.title.toLowerCase() === book.title.toLowerCase()
    );
    if (isSelected) {
      setSelectedBooks((prev) =>
        prev.filter((b) => b.title.toLowerCase() !== book.title.toLowerCase())
      );
    } else {
      setSelectedBooks((prev) => [
        ...prev,
        {
          title: book.title,
          author: book.author || "Unknown Author",
          cover_image: book.cover_image || undefined,
          curator_note: "",
        },
      ]);
    }
  };

  const updateCuratorNote = (title: string, note: string) => {
    setSelectedBooks((prev) =>
      prev.map((b) => (b.title === title ? { ...b, curator_note: note } : b))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const itemsPayload: CreateCollectionItemPayload[] = selectedBooks.map(
        (b, idx) => ({
          title: b.title,
          author: b.author,
          cover_image: b.cover_image,
          curator_note: b.curator_note,
          order_index: idx,
        })
      );

      const created = await createSharedCollection({
        name: name.trim(),
        description: description.trim() || undefined,
        theme_color: themeColor,
        is_public: isPublic,
        items: itemsPayload,
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLibrary = books.filter(
    (b) =>
      b.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(librarySearch.toLowerCase()))
  );

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
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#d3c9b5] bg-mono-50 p-6 sm:p-8 shadow-2xl z-10 text-mono-800"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 size-8 rounded-full bg-mono-200/80 text-mono-600 grid place-items-center hover:bg-mono-300 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>

          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Spotify-Style Playlist
              </span>
              <h2 className="text-2xl font-serif font-bold text-mono-900 mt-2">
                Curate a Shareable Collection
              </h2>
              <p className="text-xs text-mono-600 mt-1">
                Bundle your favorite volumes with custom notes and share your reading playlist with the community.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Collection Title */}
              <div>
                <label className="text-xs font-semibold text-mono-800 block mb-1">
                  Playlist / Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Essential Cyberpunk, Rainy Sunday Manga, Hard Sci-Fi"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#d3c9b5] bg-mono-100 outline-none focus:border-mono-600 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-mono-800 block mb-1">
                  Description & Curator Note
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Give readers an overview of why these titles go together..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#d3c9b5] bg-mono-100 outline-none focus:border-mono-600 transition-colors resize-none"
                />
              </div>

              {/* Vibe / Theme Gradient */}
              <div>
                <label className="text-xs font-semibold text-mono-800 block mb-2">
                  Theme & Vibe
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      type="button"
                      key={theme.id}
                      onClick={() => setThemeColor(theme.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        themeColor === theme.id
                          ? "border-mono-900 bg-white shadow-xs font-semibold ring-1 ring-mono-900"
                          : "border-[#d3c9b5] bg-mono-100/60 hover:bg-white"
                      }`}
                    >
                      <div
                        className={`size-4 rounded-full bg-gradient-to-br ${theme.gradient} shrink-0`}
                      />
                      <span className="text-[11px] truncate text-mono-800">
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Book Selection from Library */}
              <div className="space-y-3 pt-2 border-t border-[#d3c9b5]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-mono-800">
                    Add Books from Your Library ({selectedBooks.length} Selected)
                  </label>
                  <div className="relative w-48">
                    <Search className="size-3 text-mono-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={librarySearch}
                      onChange={(e) => setLibrarySearch(e.target.value)}
                      placeholder="Search books..."
                      className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg border border-[#d3c9b5] bg-white outline-none"
                    />
                  </div>
                </div>

                {filteredLibrary.length === 0 ? (
                  <p className="text-xs text-mono-500 py-4 text-center border border-dashed border-[#d3c9b5] rounded-xl">
                    No books found. Import EPUBs to add them to your collection!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {filteredLibrary.map((book) => {
                      const isSelected = selectedBooks.some(
                        (b) => b.title.toLowerCase() === book.title.toLowerCase()
                      );
                      return (
                        <div
                          key={book.id}
                          onClick={() => toggleBookSelection(book)}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-700 bg-amber-50/70 shadow-xs"
                              : "border-[#d3c9b5] bg-white hover:bg-mono-100/80"
                          }`}
                        >
                          <div className="size-10 shrink-0 overflow-hidden rounded bg-mono-200">
                            {book.cover_image ? (
                              <img
                                src={book.cover_image}
                                alt={book.title}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full grid place-items-center text-mono-400">
                                <BookOpen className="size-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-mono-900 truncate">
                              {book.title}
                            </p>
                            <p className="text-[10px] text-mono-500 truncate">
                              {book.author || "Unknown"}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="size-3.5 text-amber-800 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Books Custom Notes */}
              {selectedBooks.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#d3c9b5]">
                  <label className="text-xs font-semibold text-mono-800 block">
                    Curator Notes for Tracklist (Optional)
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedBooks.map((book) => (
                      <div
                        key={book.title}
                        className="flex items-center gap-2 p-2 rounded-xl bg-mono-100 border border-[#d3c9b5]"
                      >
                        <span className="text-[11px] font-semibold text-mono-900 w-1/3 truncate">
                          {book.title}
                        </span>
                        <input
                          type="text"
                          value={book.curator_note || ""}
                          onChange={(e) => updateCuratorNote(book.title, e.target.value)}
                          placeholder="Add curator recommendation note..."
                          className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-[#d3c9b5] bg-white outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Public vs Private Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#d3c9b5] bg-mono-100/60">
                <div className="flex items-center gap-2.5">
                  {isPublic ? (
                    <Globe className="size-4 text-emerald-700" />
                  ) : (
                    <Lock className="size-4 text-mono-500" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-mono-900">
                      {isPublic ? "Public Playlist" : "Private Playlist"}
                    </p>
                    <p className="text-[10px] text-mono-500">
                      {isPublic
                        ? "Visible in Discover and shareable via link or code."
                        : "Only accessible to you on this device."}
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="size-4 accent-mono-900 cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-mono-600 hover:bg-mono-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedBooks.length === 0}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-mono-900 text-mono-50 hover:bg-mono-800 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  Publish & Share Collection
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
