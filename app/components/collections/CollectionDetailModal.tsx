"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Heart,
  BookOpen,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import { SharedCollection, toggleSharedCollectionLike } from "@/app/lib/collections-api";
import { useApp } from "@/app/context/AppContext";
import BookCover from "@/app/components/book-cover";

interface CollectionDetailModalProps {
  collection: SharedCollection | null;
  onClose: () => void;
  onShare: (collection: SharedCollection) => void;
  onDelete?: (collectionId: string) => void;
  onLikeChange?: (collectionId: string, isLiked: boolean, count: number) => void;
}

export default function CollectionDetailModal({
  collection,
  onClose,
  onShare,
  onDelete,
  onLikeChange,
}: CollectionDetailModalProps) {
  const { books, openBook, user, setAuthModalOpen } = useApp();

  const [isLiked, setIsLiked] = useState(collection?.is_liked || false);
  const [likesCount, setLikesCount] = useState(collection?.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  if (!collection) return null;

  const isCurator = user && user.id === collection.curator.id;

  const handleLike = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setIsLiking(true);
    try {
      const res = await toggleSharedCollectionLike(collection.id);
      setIsLiked(res.is_liked);
      setLikesCount(res.likes_count);
      if (onLikeChange) {
        onLikeChange(collection.id, res.is_liked, res.likes_count);
      }
    } catch (err) {
      console.warn("Could not toggle like:", err);
    } finally {
      setIsLiking(false);
    }
  };

  const getGradientClass = (theme: string) => {
    switch (theme) {
      case "indigo":
        return "from-indigo-600 via-indigo-900 to-slate-900";
      case "emerald":
        return "from-emerald-600 via-teal-900 to-slate-900";
      case "rose":
        return "from-rose-600 via-pink-900 to-slate-900";
      case "slate":
        return "from-slate-700 via-slate-800 to-zinc-950";
      case "amber":
      default:
        return "from-amber-600 via-orange-950 to-stone-900";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#d3c9b5] bg-mono-50 shadow-2xl z-10 text-mono-800 flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 size-8 rounded-full bg-black/30 hover:bg-black/50 text-white grid place-items-center transition-colors cursor-pointer z-30 backdrop-blur-xs"
          >
            <X className="size-4" />
          </button>

          {/* Spotify-style Dynamic Playlist Hero */}
          <div
            className={`relative bg-gradient-to-br ${getGradientClass(
              collection.theme_color
            )} p-6 sm:p-8 text-white shrink-0 overflow-hidden`}
          >
            <div className="absolute -right-10 -bottom-10 size-60 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-end">
              {/* Stacked Cover Collage */}
              <div className="size-36 sm:size-44 rounded-xl bg-black/30 border border-white/20 p-2 shadow-2xl grid grid-cols-2 gap-1.5 shrink-0 overflow-hidden">
                {collection.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="size-full overflow-hidden rounded bg-white/10">
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full grid place-items-center text-white/40">
                        <BookOpen className="size-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Playlist Meta */}
              <div className="space-y-2 flex-1 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/70 font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-3 text-amber-300" />
                  Public Curated Collection
                </span>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                  {collection.name}
                </h1>

                {collection.description && (
                  <p className="text-xs text-white/85 line-clamp-2 leading-relaxed">
                    {collection.description}
                  </p>
                )}

                {/* Curator & Stats */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-white/90">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-white/30 text-white font-bold text-[10px] grid place-items-center">
                      {collection.curator.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold">{collection.curator.display_name}</span>
                  </div>
                  <span>•</span>
                  <span>{collection.items.length} Books</span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">#{collection.share_code}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/15">
              <div className="flex items-center gap-2.5">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer ${
                    isLiked
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                >
                  <Heart className={`size-3.5 ${isLiked ? "fill-white" : ""}`} />
                  <span>{likesCount} Likes</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => onShare(collection)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-all cursor-pointer"
                >
                  <Share2 className="size-3.5" />
                  Share Playlist
                </button>
              </div>

              {isCurator && onDelete && (
                <button
                  onClick={() => onDelete(collection.id)}
                  className="p-1.5 rounded-full text-white/60 hover:text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
                  title="Delete Collection"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Book Tracklist (Spotify Table Style) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-mono-500 mb-2">
              Collection Tracklist ({collection.items.length} Titles)
            </h3>

            <div className="space-y-2">
              {collection.items.map((item, index) => {
                // Check if user has this book locally
                const localBook = books.find(
                  (b) => b.title.toLowerCase() === item.title.toLowerCase()
                );

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (localBook) {
                        openBook(localBook.id);
                        onClose();
                      }
                    }}
                    className={`flex items-center justify-between gap-4 p-3 rounded-xl border transition-all ${
                      localBook
                        ? "border-[#d3c9b5] bg-white hover:bg-amber-50/50 hover:border-amber-600 cursor-pointer shadow-xs"
                        : "border-[#d3c9b5]/60 bg-mono-100/50 text-mono-600"
                    }`}
                  >
                    {/* Track Number & Cover */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="font-mono text-xs text-mono-400 w-5 text-right font-medium">
                        {index + 1}
                      </span>

                      <div className="size-12 rounded bg-mono-200 shrink-0 overflow-hidden shadow-xs">
                        {item.cover_image || localBook?.cover_image ? (
                          <img
                            src={item.cover_image || localBook?.cover_image || ""}
                            alt={item.title}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full grid place-items-center text-mono-400">
                            <BookOpen className="size-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-mono-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-mono-500 truncate">
                          {item.author || "Unknown Author"}
                        </p>
                        {item.curator_note && (
                          <p className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 mt-1 inline-block">
                            💬 {item.curator_note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {localBook ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="size-3" />
                          In Library
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-mono-200 text-mono-600">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
