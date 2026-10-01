"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookCopy,
  FolderPlus,
  Heart,
  Pencil,
  RotateCwClock,
  Trash2,
  X,
  Share2,
  Sparkles,
  Search,
  Globe,
  Lock,
  Plus,
  Bookmark,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import BookCover from "@/app/components/book-cover";
import ContextMenu from "@/app/components/context-menu";
import { useApp } from "../context/AppContext";
import {
  SharedCollection,
  fetchPublicCollections,
  fetchMyCollections,
  fetchCollection,
  deleteSharedCollection,
  toggleSharedCollectionLike,
} from "@/app/lib/collections-api";
import CreateCollectionModal from "@/app/components/collections/CreateCollectionModal";
import ShareCollectionModal from "@/app/components/collections/ShareCollectionModal";
import CollectionDetailModal from "@/app/components/collections/CollectionDetailModal";

interface LocalCollection {
  id: string;
  name: string;
  description: string;
  updated: string;
  books: Array<{
    title: string;
    cover: string;
    author: string;
    progress: number;
  }>;
}

export default function CollectionsPage() {
  const { books, openBook, isFavorite, user, setAuthModalOpen } = useApp();
  const reduceMotion = useReducedMotion();

  // Tab State
  const [activeTab, setActiveTab] = useState<"my-collections" | "discover">("my-collections");

  // Community / Shared Collections
  const [publicCollections, setPublicCollections] = useState<SharedCollection[]>([]);
  const [mySharedCollections, setMySharedCollections] = useState<SharedCollection[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareCodeInput, setShareCodeInput] = useState("");
  const [shareCodeError, setShareCodeError] = useState<string | null>(null);

  // Modals & Active Selections
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeShareCollection, setActiveShareCollection] = useState<SharedCollection | null>(null);
  const [selectedSharedCollection, setSelectedSharedCollection] = useState<SharedCollection | null>(null);

  // Local Custom Collections
  const [customCollections, setCustomCollections] = useState<LocalCollection[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Load custom local collections from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("papyrbound_custom_collections");
      if (saved) {
        setCustomCollections(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Fetch Community Collections
  useEffect(() => {
    loadPublicCollections();
    if (user) {
      loadMySharedCollections();
    }
  }, [user]);

  // Check URL query params for ?share=CODE
  useEffect(() => {
    const handleUrlParams = async () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const shareCode = params.get("share");
      if (shareCode) {
        try {
          const col = await fetchCollection(shareCode);
          setSelectedSharedCollection(col);
        } catch {
          // ignore if invalid
        }
      }
    };
    handleUrlParams();
  }, []);

  const loadPublicCollections = async (search?: string) => {
    setLoadingPublic(true);
    try {
      const data = await fetchPublicCollections(search);
      setPublicCollections(data);
    } catch (err) {
      console.warn("Failed to load community collections:", err);
    } finally {
      setLoadingPublic(false);
    }
  };

  const loadMySharedCollections = async () => {
    try {
      const data = await fetchMyCollections();
      setMySharedCollections(data);
    } catch (err) {
      console.warn("Failed to load user shared collections:", err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPublicCollections(searchQuery.trim() || undefined);
  };

  const handleOpenByShareCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareCodeError(null);
    const code = shareCodeInput.trim().toUpperCase().replace(/^#/, "");
    if (!code) return;

    try {
      const col = await fetchCollection(code);
      setSelectedSharedCollection(col);
      setShareCodeInput("");
    } catch {
      setShareCodeError(`No collection found with code #${code}`);
    }
  };

  const handleDeleteSharedCollection = async (id: string) => {
    try {
      await deleteSharedCollection(id);
      setPublicCollections((prev) => prev.filter((c) => c.id !== id));
      setMySharedCollections((prev) => prev.filter((c) => c.id !== id));
      if (selectedSharedCollection?.id === id) {
        setSelectedSharedCollection(null);
      }
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  const handleLikeChange = (collectionId: string, isLiked: boolean, count: number) => {
    setPublicCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, is_liked: isLiked, likes_count: count } : c))
    );
    setMySharedCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, is_liked: isLiked, likes_count: count } : c))
    );
  };

  // Dynamically generated smart collections
  const dynamicCollections: LocalCollection[] = books.length > 0 ? [
    {
      id: "favorites",
      name: "Favourites",
      description: "Your hand-picked favorite volumes and series.",
      updated: "Updated recently",
      books: books
        .filter((b) => isFavorite(b.id))
        .map((b) => ({
          title: b.title,
          cover: b.cover_image || "/covers/ashfall-01.webp",
          author: b.author || "Unknown Author",
          progress: b.progress_percent,
        })),
    },
    {
      id: "all-volumes",
      name: "All Volumes",
      description: "Complete catalog of imported books and comics.",
      updated: "Updated just now",
      books: books.map((b) => ({
        title: b.title,
        cover: b.cover_image || "/covers/ashfall-01.webp",
        author: b.author || "Unknown Author",
        progress: b.progress_percent,
      })),
    },
    {
      id: "reading-now",
      name: "Currently Reading",
      description: "Books in active progress.",
      updated: "Updated recently",
      books: (books.filter((b) => b.progress_percent > 0 && b.progress_percent < 99).length > 0
        ? books.filter((b) => b.progress_percent > 0 && b.progress_percent < 99)
        : books
      ).map((b) => ({
        title: b.title,
        cover: b.cover_image || "/covers/ashfall-01.webp",
        author: b.author || "Unknown Author",
        progress: b.progress_percent,
      })),
    },
    {
      id: "comics-manga",
      name: "Comics & Manga",
      description: "Graphic novels, CBZ and Manga spreads.",
      updated: "Updated recently",
      books: (books.filter((b) => 
        b.file_path.toLowerCase().endsWith(".cbz") || 
        b.file_path.toLowerCase().endsWith(".zip") ||
        b.author === "Comic / Manga"
      ).length > 0 
        ? books.filter((b) => 
            b.file_path.toLowerCase().endsWith(".cbz") || 
            b.file_path.toLowerCase().endsWith(".zip") ||
            b.author === "Comic / Manga"
          )
        : books
      ).map((b) => ({
        title: b.title,
        cover: b.cover_image || "/covers/ashfall-01.webp",
        author: b.author || "Unknown Author",
        progress: b.progress_percent,
      })),
    },
  ] : [];

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
    <main className="min-h-dvh bg-mono-100 px-6 sm:px-10 pb-16 pt-8 text-mono-800" aria-label="Collections">
      {/* Header Banner */}
      <header className="mb-8 border-b border-[#d3c9b5] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono font-semibold">
            <Sparkles className="size-3.5 text-amber-700" />
            Spotify-Style Book Playlists
          </div>
          <h1 className="mt-2 text-3xl font-serif font-bold text-mono-900 tracking-tight">
            Book Collections & Playlists
          </h1>
          <p className="text-xs text-mono-600 mt-1">
            Curate your library, create shareable reading playlists, and discover collections from the community.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!user) {
                setAuthModalOpen(true);
              } else {
                setCreateModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-mono-900 px-4 py-2.5 text-xs font-semibold text-mono-50 hover:bg-mono-800 transition-all shadow-sm cursor-pointer"
          >
            <FolderPlus className="size-4" strokeWidth={1.5} />
            Curate New Playlist
          </button>
        </div>
      </header>

      {/* Tabs & Search Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-mono-200/80 border border-[#d3c9b5] w-fit">
          <button
            onClick={() => setActiveTab("my-collections")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "my-collections"
                ? "bg-white text-mono-900 shadow-xs"
                : "text-mono-600 hover:text-mono-900"
            }`}
          >
            <Bookmark className="size-3.5" />
            My Playlists ({dynamicCollections.length + mySharedCollections.length})
          </button>

          <button
            onClick={() => setActiveTab("discover")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "discover"
                ? "bg-white text-mono-900 shadow-xs"
                : "text-mono-600 hover:text-mono-900"
            }`}
          >
            <Compass className="size-3.5" />
            Discover Community ({publicCollections.length})
          </button>
        </div>

        {/* Quick Open Share Code Input */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleOpenByShareCode} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={shareCodeInput}
                onChange={(e) => setShareCodeInput(e.target.value)}
                placeholder="Enter Share Code (#PAPYR-9421)..."
                className="w-56 pl-3 pr-3 py-1.5 text-xs rounded-xl border border-[#d3c9b5] bg-white font-mono text-mono-800 placeholder:text-mono-400 outline-none focus:border-mono-600 transition-colors shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl border border-[#d3c9b5] bg-mono-50 hover:bg-mono-200 text-xs font-semibold text-mono-800 transition-colors cursor-pointer"
            >
              Open
            </button>
          </form>
        </div>
      </div>

      {shareCodeError && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{shareCodeError}</span>
          <button onClick={() => setShareCodeError(null)} className="cursor-pointer font-bold">
            ×
          </button>
        </div>
      )}

      {/* TAB 1: MY PLAYLISTS */}
      {activeTab === "my-collections" && (
        <div className="space-y-8">
          {/* User's Created Online Shareable Collections */}
          {mySharedCollections.length > 0 && (
            <div>
              <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-mono-600 mb-4 flex items-center gap-2">
                <Globe className="size-3.5 text-emerald-700" />
                My Curated Community Playlists ({mySharedCollections.length})
              </h2>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {mySharedCollections.map((col) => (
                  <article
                    key={col.id}
                    onClick={() => setSelectedSharedCollection(col)}
                    className="group relative rounded-2xl border border-[#d3c9b5] bg-white p-4 shadow-sm hover:shadow-md hover:border-mono-400 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Visual Spotify Header */}
                      <div
                        className={`h-36 rounded-xl bg-gradient-to-br ${getGradientClass(
                          col.theme_color
                        )} p-3.5 text-white flex flex-col justify-between relative overflow-hidden mb-3 shadow-xs`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-white/80">
                          <span>PLAYLIST</span>
                          <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
                            #{col.share_code}
                          </span>
                        </div>

                        {/* Collage Thumbnails */}
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {col.items.slice(0, 3).map((item, i) => (
                            <div
                              key={i}
                              className="size-11 rounded-md overflow-hidden bg-black/40 border border-white/20 shrink-0 shadow-sm"
                            >
                              {item.cover_image ? (
                                <img
                                  src={item.cover_image}
                                  alt={item.title}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="size-full grid place-items-center text-white/50 text-[10px]">
                                  <BookOpen className="size-3.5" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <h3 className="text-base font-serif font-bold text-mono-900 truncate">
                        {col.name}
                      </h3>
                      <p className="text-xs text-mono-600 line-clamp-2 mt-1">
                        {col.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#d3c9b5]/50 flex items-center justify-between text-xs text-mono-500 font-mono">
                      <span>{col.items.length} Books</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveShareCollection(col);
                          }}
                          className="p-1 rounded-full hover:bg-mono-100 text-mono-700 transition-colors"
                          title="Share"
                        >
                          <Share2 className="size-3.5" />
                        </button>
                        <span className="flex items-center gap-1 text-red-600 font-sans font-semibold">
                          <Heart className="size-3 fill-red-500" />
                          {col.likes_count}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Local Smart Playlists (Favourites, Reading Now, etc.) */}
          <div>
            <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-mono-600 mb-4">
              Local Library Shelves & Smart Collections
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {dynamicCollections.map((col) => (
                <article
                  key={col.id}
                  className="group relative rounded-2xl border border-[#d3c9b5] bg-white p-4 shadow-sm hover:shadow-md hover:border-mono-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Collage */}
                    <div className="grid h-36 grid-cols-3 gap-2 overflow-hidden rounded-xl p-2 bg-mono-100/70 border border-[#d3c9b5]/40 mb-3">
                      {col.books.length === 0 ? (
                        <div className="col-span-3 flex flex-col items-center justify-center text-mono-400 text-xs gap-1.5 h-full">
                          <Heart className="size-5 text-mono-400 stroke-[1.5]" />
                          <span className="text-[11px] font-sans text-mono-500">
                            No books added yet
                          </span>
                        </div>
                      ) : (
                        col.books.slice(0, 3).map((book) => (
                          <div
                            key={book.title}
                            onClick={() => {
                              const local = books.find((b) => b.title === book.title);
                              if (local) openBook(local.id);
                            }}
                            className="h-full cursor-pointer"
                          >
                            <BookCover
                              src={book.cover}
                              title={book.title}
                              sizes="96px"
                              className="h-full"
                              zoomOnHover={false}
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <h3 className="text-base font-serif font-bold text-mono-900 truncate">
                      {col.name}
                    </h3>
                    <p className="text-xs text-mono-600 line-clamp-2 mt-1">{col.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#d3c9b5]/50 flex items-center justify-between text-xs text-mono-500">
                    <span className="font-mono text-[11px]">{col.books.length} Books</span>
                    <span className="text-[10px] text-mono-400 font-mono">{col.updated}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISCOVER COMMUNITY PLAYLISTS */}
      {activeTab === "discover" && (
        <div className="space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="size-4 text-mono-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community playlists by title or keyword..."
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#d3c9b5] bg-white shadow-2xs outline-none focus:border-mono-600 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-mono-900 text-mono-50 hover:bg-mono-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Grid of Public Collections */}
          {loadingPublic ? (
            <div className="py-16 text-center text-mono-500 text-xs font-mono">
              Loading community playlists...
            </div>
          ) : publicCollections.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#d3c9b5] rounded-2xl p-8 bg-mono-50">
              <Compass className="size-8 text-mono-400 mx-auto mb-2" />
              <h3 className="text-base font-serif font-bold text-mono-900">
                No Community Playlists Yet
              </h3>
              <p className="text-xs text-mono-500 max-w-sm mx-auto mt-1 mb-4">
                Be the first to curate and share a book playlist with readers across the world!
              </p>
              <button
                onClick={() => {
                  if (!user) setAuthModalOpen(true);
                  else setCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-mono-900 text-mono-50 text-xs font-semibold hover:bg-mono-800 transition-colors cursor-pointer"
              >
                <Plus className="size-3.5" />
                Create First Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {publicCollections.map((col) => (
                <article
                  key={col.id}
                  onClick={() => setSelectedSharedCollection(col)}
                  className="group relative rounded-2xl border border-[#d3c9b5] bg-white p-4 shadow-sm hover:shadow-md hover:border-mono-400 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Visual Spotify Playlist Card */}
                    <div
                      className={`h-36 rounded-xl bg-gradient-to-br ${getGradientClass(
                        col.theme_color
                      )} p-3.5 text-white flex flex-col justify-between relative overflow-hidden mb-3 shadow-xs`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-white/80">
                        <span>PLAYLIST</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
                          #{col.share_code}
                        </span>
                      </div>

                      {/* Collage Thumbnails */}
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {col.items.slice(0, 3).map((item, i) => (
                          <div
                            key={i}
                            className="size-11 rounded-md overflow-hidden bg-black/40 border border-white/20 shrink-0 shadow-sm"
                          >
                            {item.cover_image ? (
                              <img
                                src={item.cover_image}
                                alt={item.title}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full grid place-items-center text-white/50 text-[10px]">
                                <BookOpen className="size-3.5" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-base font-serif font-bold text-mono-900 truncate">
                      {col.name}
                    </h3>
                    <p className="text-xs text-mono-600 line-clamp-2 mt-1">
                      {col.description || "No description provided."}
                    </p>

                    {/* Curator Pill */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-mono-700">
                      <div className="size-5 rounded-full bg-amber-700 text-white font-bold text-[10px] grid place-items-center">
                        {col.curator.display_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-medium truncate">
                        By {col.curator.display_name}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#d3c9b5]/50 flex items-center justify-between text-xs text-mono-500 font-mono">
                    <span>{col.items.length} Books</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveShareCollection(col);
                        }}
                        className="p-1 rounded-full hover:bg-mono-100 text-mono-700 transition-colors"
                        title="Share Link"
                      >
                        <Share2 className="size-3.5" />
                      </button>
                      <span className="flex items-center gap-1 text-red-600 font-sans font-semibold">
                        <Heart
                          className={`size-3 ${col.is_liked ? "fill-red-500" : ""}`}
                        />
                        {col.likes_count}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE COLLECTION MODAL */}
      <CreateCollectionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newCol) => {
          setMySharedCollections((prev) => [newCol, ...prev]);
          setPublicCollections((prev) => [newCol, ...prev]);
          setSelectedSharedCollection(newCol);
        }}
      />

      {/* SHARE MODAL */}
      <ShareCollectionModal
        collection={activeShareCollection}
        onClose={() => setActiveShareCollection(null)}
      />

      {/* PLAYLIST DETAIL MODAL (SPOTIFY TRACKLIST VIEW) */}
      <CollectionDetailModal
        collection={selectedSharedCollection}
        onClose={() => setSelectedSharedCollection(null)}
        onShare={(col) => setActiveShareCollection(col)}
        onDelete={handleDeleteSharedCollection}
        onLikeChange={handleLikeChange}
      />
    </main>
  );
}
