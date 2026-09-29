"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Plus,
  BookOpen,
  MessageSquare,
  Users,
  Sparkles,
  Calendar,
  Heart,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  Globe,
  ShieldAlert,
  Flame,
  X,
  Share2,
} from "lucide-react";
import Link from "next/link";
import BookCover from "@/app/components/book-cover";
import { useApp } from "../context/AppContext";

interface DiscussionComment {
  id: string;
  bookId?: string;
  bookTitle: string;
  chapterIndex: number;
  chapterTitle: string;
  userName: string;
  userHandle: string;
  avatarColor: string;
  content: string;
  isSpoiler: boolean;
  spoilerWarning?: string;
  likes: number;
  replies: number;
  timeAgo: string;
  isLiked?: boolean;
}

interface BookClub {
  id: string;
  name: string;
  category: string;
  membersCount: number;
  currentBook: string;
  nextMeeting: string;
  description: string;
  isJoined?: boolean;
}

const INITIAL_DISCUSSIONS: DiscussionComment[] = [
  {
    id: "disc-1",
    bookTitle: "20th Century Boys Vol. 05",
    chapterIndex: 42,
    chapterTitle: "Chapter 42: The Revelation",
    userName: "Kofi Mensah",
    userHandle: "kofi_m",
    avatarColor: "bg-amber-600",
    content: "This scene completely changes how I see 'Friend'. The visual foreshadowing from Chapter 12 finally clicked!",
    isSpoiler: true,
    spoilerWarning: "Contains major Chapter 42 plot revelation",
    likes: 24,
    replies: 8,
    timeAgo: "15m ago",
  },
  {
    id: "disc-2",
    bookTitle: "The Hobbit",
    chapterIndex: 5,
    chapterTitle: "Chapter 5: Riddles in the Dark",
    userName: "Alice Vance",
    userHandle: "alice_v",
    avatarColor: "bg-emerald-600",
    content: "I didn't expect Bilbo to actually outsmart Gollum with the riddle in his pocket. The tension throughout this dialogue is legendary.",
    isSpoiler: false,
    likes: 19,
    replies: 12,
    timeAgo: "42m ago",
  },
  {
    id: "disc-3",
    bookTitle: "Red Rising",
    chapterIndex: 14,
    chapterTitle: "Chapter 14: The Institute",
    userName: "John Doe",
    userHandle: "johnd",
    avatarColor: "bg-rose-600",
    content: "Darrow's test of survival had my heart beating so fast. The societal caste system Pierce Brown built is incredibly brutal.",
    isSpoiler: false,
    likes: 31,
    replies: 5,
    timeAgo: "2h ago",
  },
  {
    id: "disc-4",
    bookTitle: "Shadow Slave",
    chapterIndex: 88,
    chapterTitle: "Chapter 88: Forgotten Shore",
    userName: "Ama Serwaa",
    userHandle: "ama_s",
    avatarColor: "bg-purple-600",
    content: "Sunny's flaw is both the most hilarious and terrifying curse. How he navigates deceit without lying is pure genius.",
    isSpoiler: false,
    likes: 47,
    replies: 16,
    timeAgo: "3h ago",
  },
];

const INITIAL_CLUBS: BookClub[] = [
  {
    id: "club-1",
    name: "Fantasy Readers Guild",
    category: "High Fantasy & Epics",
    membersCount: 142,
    currentBook: "The Name of the Wind",
    nextMeeting: "Friday, 8:00 PM GMT",
    description: "Weekly deep dives into worldbuilding, magic systems, and epic journeys.",
    isJoined: false,
  },
  {
    id: "club-2",
    name: "Manga & Graphic Novel Circle",
    category: "Manga & Comics",
    membersCount: 289,
    currentBook: "20th Century Boys",
    nextMeeting: "Sunday, 6:30 PM GMT",
    description: "Analyzing panel flow, artwork, and suspense in serialized graphic fiction.",
    isJoined: true,
  },
  {
    id: "club-3",
    name: "Sci-Fi & Cyberpunk Frontiers",
    category: "Science Fiction",
    membersCount: 98,
    currentBook: "Red Rising (Iron Gold)",
    nextMeeting: "Next Tuesday, 7:00 PM GMT",
    description: "Exploring dystopian futures, space operas, and hard sci-fi themes.",
    isJoined: false,
  },
];

export default function Home() {
  const [hover, setHover] = useState(false);
  const { books, openBook, importNewBook, isImporting } = useApp();

  // Social & Community State
  const [discussions, setDiscussions] = useState<DiscussionComment[]>(INITIAL_DISCUSSIONS);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [bookClubs, setBookClubs] = useState<BookClub[]>(INITIAL_CLUBS);
  const [activeDiscussBook, setActiveDiscussBook] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSpoilerChecked, setIsSpoilerChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my-reads" | "clubs">("all");
  
  // Google / Online Account Mock State
  const [isConnectedGoogle, setIsConnectedGoogle] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const heroBook = books.length > 0 ? books[0] : null;

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLike = (id: string) => {
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              likes: d.isLiked ? d.likes - 1 : d.likes + 1,
              isLiked: !d.isLiked,
            }
          : d
      )
    );
  };

  const toggleJoinClub = (clubId: string) => {
    setBookClubs((prev) =>
      prev.map((c) =>
        c.id === clubId
          ? {
              ...c,
              isJoined: !c.isJoined,
              membersCount: c.isJoined ? c.membersCount - 1 : c.membersCount + 1,
            }
          : c
      )
    );
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const bookTitle = activeDiscussBook || (heroBook ? heroBook.title : "Community Discussion");
    const newComment: DiscussionComment = {
      id: `disc-${Date.now()}`,
      bookTitle,
      chapterIndex: heroBook ? heroBook.current_chapter + 1 : 1,
      chapterTitle: heroBook
        ? `Chapter ${heroBook.current_chapter + 1}`
        : "General Reading Note",
      userName: isConnectedGoogle ? "Bill (You)" : "Reader (You)",
      userHandle: isConnectedGoogle ? "bill_gh" : "you",
      avatarColor: "bg-mono-800",
      content: newCommentText.trim(),
      isSpoiler: isSpoilerChecked,
      spoilerWarning: isSpoilerChecked ? "User marked this comment as a spoiler" : undefined,
      likes: 1,
      replies: 0,
      timeAgo: "Just now",
      isLiked: true,
    };

    setDiscussions([newComment, ...discussions]);
    setNewCommentText("");
    setIsSpoilerChecked(false);
  };

  return (
    <main
      className="min-h-dvh bg-mono-100 text-mono-800 pb-20"
      aria-label="Papyrbound home"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 space-y-10">
        
        {/* Top Header & Live Community Status */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d3c9b5]/60 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-serif font-bold tracking-tight text-mono-900">
                Papyrbound
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                1,420 Online Readers
              </span>
            </div>
            <p className="text-xs text-mono-600 mt-1">
              Your offline-first reader and reading community platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isConnectedGoogle ? (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-mono-200/80 border border-[#d3c9b5] text-xs">
                <div className="size-6 rounded-full bg-amber-700 text-mono-50 grid place-items-center font-bold text-[11px]">
                  B
                </div>
                <div className="text-left">
                  <p className="font-semibold text-mono-900 leading-none">Bill</p>
                  <p className="text-[10px] text-emerald-700 flex items-center gap-1 leading-none mt-0.5">
                    <CheckCircle2 className="size-2.5" /> Google Connected
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-mono-50 border border-[#d3c9b5] text-mono-800 hover:bg-mono-200/60 transition-all shadow-xs cursor-pointer"
              >
                <Globe className="size-3.5 text-mono-600" />
                Connect Google Account
              </button>
            )}

            <button
              onClick={importNewBook}
              disabled={isImporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-mono-800 text-mono-50 hover:bg-mono-700 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="size-3.5" />
              Import Book
            </button>
          </div>
        </header>

        {/* Hero "Continue Reading & Discuss" Widget */}
        {heroBook ? (
          <section className="relative overflow-hidden rounded-2xl border border-[#d3c9b5] bg-gradient-to-br from-mono-50 via-mono-100 to-[#ebd8b7]/40 p-6 sm:p-8 shadow-sm">
            <div className="grid md:grid-cols-[160px_1fr] gap-6 items-center">
              <div
                onClick={() => openBook(heroBook.id)}
                className="cursor-pointer group relative max-w-[160px] mx-auto md:mx-0"
              >
                <BookCover
                  src={heroBook.cover_image || "/covers/ashfall-01.webp"}
                  title={heroBook.title}
                  sizes="160px"
                  variant="home"
                  className="w-full aspect-[2/3] shadow-lg group-hover:shadow-xl transition-all group-hover:scale-[1.02]"
                />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-mono-800 text-mono-50">
                      Currently Reading
                    </span>
                    <span className="text-xs text-mono-500 font-mono">
                      Chapter {heroBook.current_chapter + 1} of {heroBook.total_chapters || 1}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-mono-900 mt-2">
                    {heroBook.title}
                  </h2>
                  <p className="text-sm text-mono-600 mt-0.5">
                    by {heroBook.author || "Unknown Author"}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 max-w-md">
                    <div className="flex justify-between text-xs font-mono text-mono-600 mb-1.5">
                      <span>Reading Progress</span>
                      <span>{Math.round(heroBook.progress_percent || 0)}% completed</span>
                    </div>
                    <div className="h-2 w-full bg-mono-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mono-800 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round(heroBook.progress_percent || 0))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Dual CTAs: Continue Reading + Discuss */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => openBook(heroBook.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-mono-800 text-mono-50 hover:bg-mono-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <BookOpen className="size-4" />
                    Continue Reading
                  </button>

                  <button
                    onClick={() => setActiveDiscussBook(heroBook.title)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-mono-50 border border-[#d3c9b5] text-mono-900 hover:bg-mono-200/80 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <MessageSquare className="size-4 text-amber-700" />
                    Discuss this Book
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono">
                      124 readers
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Community Nav Tabs */}
        <div className="flex items-center gap-2 border-b border-[#d3c9b5]/60 pb-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-mono-800 text-mono-50"
                : "text-mono-600 hover:text-mono-900 hover:bg-mono-200/50"
            }`}
          >
            All Discussions
          </button>
          <button
            onClick={() => setActiveTab("my-reads")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "my-reads"
                ? "bg-mono-800 text-mono-50"
                : "text-mono-600 hover:text-mono-900 hover:bg-mono-200/50"
            }`}
          >
            My Recent Reads
          </button>
          <button
            onClick={() => setActiveTab("clubs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "clubs"
                ? "bg-mono-800 text-mono-50"
                : "text-mono-600 hover:text-mono-900 hover:bg-mono-200/50"
            }`}
          >
            Book Clubs ({bookClubs.filter((c) => c.isJoined).length} Joined)
          </button>
        </div>

        {/* Main Grid: Discussions & Recent Library vs Book Clubs */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
          
          {/* Left Column: Live Book Discussions Feed */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-mono-900 flex items-center gap-2">
                  <Flame className="size-4 text-amber-600" />
                  Live Chapter & Book Discussions
                </h3>
                <p className="text-xs text-mono-500">
                  Real-time commentary with chapter-aware spoiler protection.
                </p>
              </div>
            </div>

            {/* Quick Discussion Poster */}
            <form
              onSubmit={handlePostComment}
              className="rounded-xl border border-[#d3c9b5] bg-mono-50/70 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2 text-xs text-mono-600">
                <span className="font-semibold text-mono-800">
                  Discussing:
                </span>
                <span className="px-2 py-0.5 rounded bg-mono-200 text-mono-800 text-[11px] font-medium truncate max-w-xs">
                  {activeDiscussBook || (heroBook ? heroBook.title : "General Reading Discussion")}
                </span>
                {activeDiscussBook && (
                  <button
                    type="button"
                    onClick={() => setActiveDiscussBook(null)}
                    className="text-mono-400 hover:text-mono-800"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Share your thoughts on this chapter, highlight, or scene..."
                rows={2}
                className="w-full text-xs rounded-lg border border-[#d3c9b5] bg-mono-100 p-2.5 outline-none focus:border-mono-500 transition-colors"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-mono-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSpoilerChecked}
                    onChange={(e) => setIsSpoilerChecked(e.target.checked)}
                    className="rounded text-amber-600 cursor-pointer"
                  />
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShieldAlert className="size-3 text-amber-600" />
                    Contains Spoilers
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-mono-800 text-mono-50 text-xs font-medium hover:bg-mono-700 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Send className="size-3" />
                  Post Comment
                </button>
              </div>
            </form>

            {/* Discussions List */}
            <div className="space-y-4">
              {discussions.map((disc) => {
                const isRevealed = revealedSpoilers[disc.id];

                return (
                  <motion.article
                    key={disc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-[#d3c9b5] bg-mono-50 p-4.5 shadow-xs space-y-3 transition-all hover:border-mono-400"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`size-7 rounded-full text-mono-50 grid place-items-center font-bold text-xs ${disc.avatarColor}`}
                        >
                          {disc.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-mono-900">
                              {disc.userName}
                            </span>
                            <span className="text-[10px] text-mono-500">
                              @{disc.userHandle}
                            </span>
                            <span className="text-[10px] text-mono-400">• {disc.timeAgo}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-amber-900 bg-amber-100/80 px-1.5 py-0.2 rounded">
                              {disc.bookTitle}
                            </span>
                            <span className="text-[10px] font-mono text-mono-500">
                              {disc.chapterTitle}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content & Spoiler Shield */}
                    {disc.isSpoiler && !isRevealed ? (
                      <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-amber-900">
                          <ShieldAlert className="size-4 text-amber-600 shrink-0" />
                          <span>
                            <strong>Spoiler Protection:</strong>{" "}
                            {disc.spoilerWarning || "Contains content from a later chapter"}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleSpoiler(disc.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-200 text-amber-950 hover:bg-amber-300 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          <Eye className="size-3" />
                          Reveal
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-xs text-mono-800 leading-relaxed">
                          {disc.content}
                        </p>
                        {disc.isSpoiler && isRevealed && (
                          <button
                            onClick={() => toggleSpoiler(disc.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-mono-400 hover:text-mono-600 cursor-pointer"
                          >
                            <EyeOff className="size-2.5" /> Hide spoiler
                          </button>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-[#d3c9b5]/40 pt-2 text-xs text-mono-500">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(disc.id)}
                          className={`flex items-center gap-1 text-xs transition-colors cursor-pointer ${
                            disc.isLiked ? "text-rose-600 font-semibold" : "hover:text-mono-800"
                          }`}
                        >
                          <Heart
                            className="size-3.5"
                            fill={disc.isLiked ? "currentColor" : "none"}
                          />
                          <span>{disc.likes}</span>
                        </button>

                        <button
                          onClick={() => setActiveDiscussBook(disc.bookTitle)}
                          className="flex items-center gap-1 text-xs hover:text-mono-800 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="size-3.5" />
                          <span>{disc.replies} replies</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setActiveDiscussBook(disc.bookTitle)}
                        className="text-[11px] font-medium text-mono-700 hover:text-amber-800 cursor-pointer"
                      >
                        Join Thread →
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* Right Column: Book Clubs & Recent Library */}
          <aside className="space-y-8">
            
            {/* Book Clubs Spotlight */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold text-mono-900 flex items-center gap-2">
                  <Users className="size-4 text-emerald-700" />
                  Community Book Clubs
                </h3>
                <span className="text-xs text-mono-500 font-mono">
                  {bookClubs.length} Active
                </span>
              </div>

              <div className="space-y-3">
                {bookClubs.map((club) => (
                  <div
                    key={club.id}
                    className="rounded-xl border border-[#d3c9b5] bg-mono-50 p-4 shadow-xs space-y-2.5 transition-all hover:border-mono-400"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-serif font-bold text-mono-900">
                          {club.name}
                        </h4>
                        <span className="text-[10px] text-mono-500 font-mono uppercase tracking-wider">
                          {club.category} • {club.membersCount} members
                        </span>
                      </div>

                      <button
                        onClick={() => toggleJoinClub(club.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          club.isJoined
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-mono-800 text-mono-50 hover:bg-mono-700"
                        }`}
                      >
                        {club.isJoined ? "Joined ✓" : "Join Club"}
                      </button>
                    </div>

                    <p className="text-xs text-mono-600 leading-snug">
                      {club.description}
                    </p>

                    <div className="pt-2 border-t border-[#d3c9b5]/40 flex flex-col gap-1 text-[11px] text-mono-700 font-mono">
                      <div className="flex items-center gap-1.5 text-mono-800">
                        <BookOpen className="size-3 text-amber-700" />
                        <span>Currently reading: <strong>{club.currentBook}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-mono-500">
                        <Calendar className="size-3" />
                        <span>Next discussion: {club.nextMeeting}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Recent Library Grid */}
            <div className="space-y-4 pt-4 border-t border-[#d3c9b5]/60">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif font-bold text-mono-900">
                  Your Library Reads
                </h3>
                <Link
                  href="/library"
                  className="text-xs text-amber-800 hover:underline font-medium"
                >
                  View all ({books.length})
                </Link>
              </div>

              {books.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[#d3c9b5] rounded-xl p-4 bg-mono-50/50">
                  <BookOpen className="size-6 text-mono-400 mx-auto mb-2" />
                  <p className="text-xs text-mono-500">No books imported yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {books.slice(0, 3).map((book) => (
                    <div
                      key={book.id}
                      onClick={() => openBook(book.id)}
                      className="cursor-pointer group flex flex-col"
                    >
                      <BookCover
                        src={book.cover_image || "/covers/ashfall-01.webp"}
                        title={book.title}
                        sizes="100px"
                        variant="home"
                        className="w-full aspect-[2/3] shadow-xs group-hover:shadow-md transition-shadow"
                      />
                      <span className="mt-1.5 text-[11px] font-semibold text-mono-900 truncate">
                        {book.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </aside>
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-[#d3c9b5]/40 flex items-center justify-between">
          <Link
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            href="/library"
            className="flex w-fit items-center gap-2 text-xl font-serif text-mono-900 hover:text-amber-800 transition-colors"
          >
            <span className="relative inline-block">
              Open Full Library
              <motion.span
                animate={{ width: hover ? "100%" : "0%" }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 h-px bg-current"
              />
            </span>
            <motion.span
              animate={{ x: hover ? 3 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-flex"
            >
              <ChevronRight aria-hidden="true" className="mt-1" />
            </motion.span>
          </Link>
        </div>

      </div>

      {/* Google Authentication Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-2xl border border-[#d3c9b5] bg-mono-50 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-mono-900">
                    Welcome to Papyrbound
                  </h3>
                  <p className="text-xs text-mono-500 mt-0.5">
                    Sync your library and join chapter discussions.
                  </p>
                </div>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="size-7 rounded-full bg-mono-200 text-mono-600 grid place-items-center hover:bg-mono-300"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsConnectedGoogle(true);
                    setAuthModalOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#d3c9b5] bg-white hover:bg-mono-100 text-mono-900 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="relative text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#d3c9b5]" />
                  </div>
                  <span className="relative bg-mono-50 px-2 text-[10px] text-mono-400 font-mono">
                    OFFLINE FIRST
                  </span>
                </div>

                <p className="text-[11px] text-mono-500 text-center leading-relaxed">
                  Your local books and reading settings always remain securely on your computer in SQLite.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}


