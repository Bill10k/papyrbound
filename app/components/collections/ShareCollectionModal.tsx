"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { SharedCollection } from "@/app/lib/collections-api";

interface ShareCollectionModalProps {
  collection: SharedCollection | null;
  onClose: () => void;
}

export default function ShareCollectionModal({ collection, onClose }: ShareCollectionModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!collection) return null;

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/collections?share=${encodeURIComponent(collection.share_code)}`
    : `http://localhost:3000/collections?share=${collection.share_code}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(collection.share_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
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
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#d3c9b5] bg-mono-50 p-6 shadow-2xl z-10 text-mono-800"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 size-8 rounded-full bg-mono-200/80 text-mono-600 grid place-items-center hover:bg-mono-300 transition-colors cursor-pointer z-20"
          >
            <X className="size-4" />
          </button>

          {/* Spotify-style Visual Playlist Card Preview */}
          <div
            className={`relative rounded-2xl bg-gradient-to-br ${getGradientClass(
              collection.theme_color
            )} p-6 text-white shadow-lg overflow-hidden mb-6`}
          >
            {/* Background Texture / Circles */}
            <div className="absolute -right-8 -bottom-8 size-40 rounded-full bg-white/5 blur-xl pointer-events-none" />
            <div className="absolute left-1/2 top-0 size-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono tracking-widest text-white/70 uppercase">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3 text-amber-300" />
                  Papyrbound Playlist
                </span>
                <span className="font-bold">{collection.items.length} Titles</span>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-white leading-tight">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-xs text-white/80 line-clamp-2 mt-1 leading-relaxed">
                    {collection.description}
                  </p>
                )}
              </div>

              {/* Curator Info */}
              <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-white/20 grid place-items-center font-bold text-[10px] text-white">
                    {collection.curator.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white/90 font-medium">
                    Curated by {collection.curator.display_name}
                  </span>
                </div>

                <span className="font-mono text-[10px] bg-white/15 px-2 py-0.5 rounded-full text-white font-semibold">
                  #{collection.share_code}
                </span>
              </div>
            </div>
          </div>

          {/* Actions & Sharing Options */}
          <div className="space-y-4">
            {/* Share Code Pill */}
            <div>
              <label className="text-[11px] font-medium text-mono-700 block mb-1.5 font-mono uppercase tracking-wider">
                Share Code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#d3c9b5] bg-mono-100 font-mono text-sm font-bold text-mono-900 select-all">
                  {collection.share_code}
                </div>
                <button
                  onClick={copyCode}
                  className="px-4 py-2.5 rounded-xl bg-mono-800 text-mono-50 hover:bg-mono-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedCode ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copiedCode ? "Copied" : "Copy Code"}
                </button>
              </div>
            </div>

            {/* Direct Link */}
            <div>
              <label className="text-[11px] font-medium text-mono-700 block mb-1.5 font-mono uppercase tracking-wider">
                Direct Web & Desktop Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#d3c9b5] bg-mono-100 text-mono-700 select-all outline-none font-mono truncate"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 rounded-xl border border-[#d3c9b5] bg-white hover:bg-mono-100 text-mono-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
                  {copiedLink ? "Link Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-mono-500 text-center pt-2">
              Readers with Papyrbound can enter the code or click your link to explore this collection.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
