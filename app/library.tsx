"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";

type IconName = "arrowLeft" | "arrowRight" | "book" | "bookmark" | "check" | "chevron" | "clock" | "folder" | "grid" | "heart" | "list" | "menu" | "more" | "plus" | "search" | "settings" | "sparkles";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrowLeft: <path d="m15 18-6-6 6-6" />,
    arrowRight: <path d="m9 18 6-6-6-6" />,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    folder: <path d="M3 7h7l2 2h9v10H3V7Zm0 0V5h7l2 2" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l7.8-7.5a5.5 5.5 0 0 0-.2-7.9Z" />,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l-2.8 2.8a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6h-4a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-2.8-2.8a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14v-4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L7.1 4.3a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l2.8 2.8a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1v4a1.7 1.7 0 0 0-1.6 1Z" /></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" /><path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

type Book = { id: number; title: string; series: string; author: string; cover: string; issue: string; pages: number; year: number; progress: number; rating: number; genre: string; format: string; size: string; added: string; favorite?: boolean; description: string };

const books: Book[] = [
  { id: 1, title: "The Black Sun", series: "Ashfall", author: "Mara Voss", cover: "/covers/ashfall-01.webp", issue: "Vol. 01", pages: 188, year: 2025, progress: 68, rating: 5, genre: "Science fantasy", format: "CBZ", size: "84.2 MB", added: "Today", favorite: true, description: "A cartographer crosses the salt wastes to chart an eclipse that has lasted for a generation." },
  { id: 2, title: "Salt Meridian", series: "Ashfall", author: "Mara Voss", cover: "/covers/ashfall-01.webp", issue: "Vol. 02", pages: 204, year: 2025, progress: 12, rating: 4, genre: "Science fantasy", format: "CBZ", size: "91.7 MB", added: "Today", description: "The expedition reaches a city built along the shadow line, where every map tells a different story." },
  { id: 3, title: "The Far Lantern", series: "Night Signal", author: "Eli Mercer", cover: "/covers/night-signal-01.webp", issue: "Book 01", pages: 156, year: 2024, progress: 100, rating: 5, genre: "Mystery", format: "PDF", size: "63.1 MB", added: "Yesterday", favorite: true, description: "A lighthouse keeper begins receiving signals from a station that vanished forty years ago." },
  { id: 4, title: "Low Water", series: "Night Signal", author: "Eli Mercer", cover: "/covers/night-signal-01.webp", issue: "Book 02", pages: 172, year: 2025, progress: 0, rating: 4, genre: "Mystery", format: "CBR", size: "72.8 MB", added: "Yesterday", description: "At the lowest tide of the year, a road appears beneath the sea." },
  { id: 5, title: "Glass Garden", series: "Verdant City", author: "Noa Kitamura", cover: "/covers/glass-garden-01.webp", issue: "Part 01", pages: 196, year: 2026, progress: 35, rating: 5, genre: "Solarpunk", format: "CBZ", size: "102 MB", added: "3 days ago", favorite: true, description: "In the concrete remains of an empty city, a greenhouse continues to tend itself." },
  { id: 6, title: "Root Memory", series: "Verdant City", author: "Noa Kitamura", cover: "/covers/glass-garden-01.webp", issue: "Part 02", pages: 184, year: 2026, progress: 0, rating: 0, genre: "Solarpunk", format: "CBZ", size: "96.4 MB", added: "3 days ago", description: "The gardeners uncover a living archive threaded through the roots below the city." },
  { id: 7, title: "A Road of Kites", series: "Paper Skies", author: "Ana Bell", cover: "/covers/red-kites-01.webp", issue: "Chapter 01", pages: 144, year: 2023, progress: 100, rating: 4, genre: "Literary", format: "PDF", size: "48.7 MB", added: "Last week", description: "Two sisters follow a procession of red kites across a changing countryside." },
  { id: 8, title: "Where Wind Waits", series: "Paper Skies", author: "Ana Bell", cover: "/covers/red-kites-01.webp", issue: "Chapter 02", pages: 152, year: 2024, progress: 81, rating: 5, genre: "Literary", format: "PDF", size: "51.9 MB", added: "Last week", favorite: true, description: "The road ends, but the kites carry on toward a village absent from every atlas." },
  { id: 9, title: "Room 193", series: "The Meridian Hotel", author: "Jonas Grey", cover: "/covers/room-193-01.webp", issue: "Case 01", pages: 212, year: 2025, progress: 23, rating: 4, genre: "Noir", format: "CBZ", size: "108 MB", added: "Sep 08", description: "A night clerk investigates a hotel room that occupies a different floor after midnight." },
  { id: 10, title: "The Missing Floor", series: "The Meridian Hotel", author: "Jonas Grey", cover: "/covers/room-193-01.webp", issue: "Case 02", pages: 220, year: 2026, progress: 0, rating: 0, genre: "Noir", format: "CBZ", size: "114 MB", added: "Sep 08", description: "The hotel's blueprints reveal a thirteenth floor drawn in invisible ink." },
  { id: 11, title: "The Drowned Index", series: "Tidebound", author: "Iris Okafor", cover: "/covers/tidebound-01.webp", issue: "Archive 01", pages: 176, year: 2024, progress: 100, rating: 5, genre: "Fantasy", format: "CBR", size: "88.3 MB", added: "Aug 29", favorite: true, description: "Divers descend into a submerged library where the books remember their readers." },
  { id: 12, title: "Letters Below", series: "Tidebound", author: "Iris Okafor", cover: "/covers/tidebound-01.webp", issue: "Archive 02", pages: 192, year: 2025, progress: 7, rating: 4, genre: "Fantasy", format: "CBR", size: "93.6 MB", added: "Aug 29", description: "Loose pages rise with the tide, carrying messages written decades apart." },
];

const folders = ["All books", "Graphic novels", "Manga", "Art books", "PDF library"];

export default function Library() {
  const reduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState(1);
  const [query, setQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState("All books");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const filteredBooks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesQuery = !needle || `${book.title} ${book.series} ${book.author} ${book.genre}`.toLowerCase().includes(needle);
      const matchesFolder = activeFolder === "All books"
        || (activeFolder === "Graphic novels" && !["Paper Skies", "Verdant City"].includes(book.series))
        || (activeFolder === "Manga" && book.series === "Ashfall")
        || (activeFolder === "Art books" && book.series === "Verdant City")
        || (activeFolder === "PDF library" && book.format === "PDF");
      const matchesStatus = statusFilter === "All"
        || (statusFilter === "Reading" && book.progress > 0 && book.progress < 100)
        || (statusFilter === "Unread" && book.progress === 0)
        || (statusFilter === "Completed" && book.progress === 100)
        || (statusFilter === "Favorites" && Boolean(book.favorite));
      return matchesQuery && (onlyFavorites ? Boolean(book.favorite) : matchesFolder && matchesStatus);
    });
  }, [activeFolder, query, onlyFavorites, statusFilter]);
  const selected = filteredBooks.find((book) => book.id === selectedId) ?? filteredBooks[0] ?? books[0];
  const selectedIndex = Math.max(0, filteredBooks.findIndex((book) => book.id === selected.id));

  const eyebrowClass = "text-[10px] font-bold uppercase tracking-[0.18em] text-mono-400";
  const iconButtonClass = "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-mono-300 transition-colors hover:bg-white hover:text-mono-950";

  function stepSelection(direction: number) {
    if (filteredBooks.length < 2) return;
    const nextIndex = (selectedIndex + direction + filteredBooks.length) % filteredBooks.length;
    setSelectedId(filteredBooks[nextIndex].id);
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-mono-100 p-3 text-mono-50 tracking-[-0.02em] sm:p-5">
      <div className="mx-auto grid min-h-[calc(100dvh-24px)] max-w-[1800px] grid-cols-[244px_minmax(0,1fr)] overflow-hidden rounded-[28px] bg-mono-950 shadow-[0_30px_90px_rgb(0_0_0/0.18)] max-[860px]:block sm:min-h-[calc(100dvh-40px)]">
        <aside className="flex min-h-0 flex-col border-r border-white/10 bg-mono-900 px-5 py-6 max-[860px]:hidden">
          <div className="flex items-center justify-between px-2">
            <span className="text-[22px] font-black uppercase tracking-[-0.08em]">Papyr</span>
            <span className="grid size-9 place-items-center text-3xl font-light text-mono-50" aria-hidden="true">✦</span>
          </div>

          <nav className="mt-16" aria-label="Library folders">
            <p className={`${eyebrowClass} px-3`}>Collection</p>
            <div className="mt-4 space-y-1.5">
              {folders.map((folder, index) => {
                const isActive = activeFolder === folder && !onlyFavorites;
                return (
                  <button
                    key={folder}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => { setActiveFolder(folder); setOnlyFavorites(false); setStatusFilter("All"); }}
                    className={`group flex h-12 w-full items-center justify-between rounded-xl px-3 text-left text-[13px] transition-colors ${isActive ? "bg-mono-50 text-mono-950" : "text-mono-400 hover:bg-white/[0.06] hover:text-mono-50"}`}
                  >
                    <span className="flex items-center gap-3"><Icon name={index === 0 ? "book" : "folder"} size={17} />{folder}</span>
                    <span className={`text-[10px] ${isActive ? "text-mono-600" : "text-mono-600 group-hover:text-mono-400"}`}>{index === 0 ? 12 : [8, 2, 2, 2][index - 1]}</span>
                  </button>
                );
              })}
            </div>

            <p className={`${eyebrowClass} mt-10 px-3`}>Your space</p>
            <div className="mt-4 space-y-1.5">
              <button onClick={() => { setOnlyFavorites(true); setStatusFilter("Favorites"); }} className={`flex h-12 w-full items-center justify-between rounded-xl px-3 text-[13px] transition-colors ${onlyFavorites ? "bg-mono-50 text-mono-950" : "text-mono-400 hover:bg-white/[0.06] hover:text-mono-50"}`}>
                <span className="flex items-center gap-3"><Icon name="heart" size={17} />Favorites</span><span className="text-[10px] opacity-60">5</span>
              </button>
              <button className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-[13px] text-mono-400 transition-colors hover:bg-white/[0.06] hover:text-mono-50"><Icon name="bookmark" size={17} />Reading now</button>
              <button className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-[13px] text-mono-400 transition-colors hover:bg-white/[0.06] hover:text-mono-50"><Icon name="clock" size={17} />Recently added</button>
            </div>
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between text-[10px] text-mono-400"><span>Local library</span><span>40%</span></div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-2/5 rounded-full bg-mono-50" /></div>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-mono-50 text-[10px] font-bold text-mono-950">JD</span>
              <div className="min-w-0 flex-1"><strong className="block truncate text-xs font-semibold">Joshua&apos;s library</strong><span className="mt-0.5 block text-[9px] text-mono-500">Synced 2m ago</span></div>
              <Icon name="more" size={16} />
            </div>
          </div>
        </aside>

        <section id="library-scroll" className="min-w-0 overflow-y-auto">
          <header className="sticky top-0 z-50 flex h-[76px] items-center justify-between border-b border-white/10 bg-mono-950/90 px-5 backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-3 min-[861px]:hidden"><span className="text-lg font-black uppercase tracking-[-0.07em]">Papyr</span></div>
            <div className="flex items-center gap-4 max-[860px]:ml-auto">
              <button className="flex items-center gap-2 text-xs text-mono-300 hover:text-white"><Icon name="menu" size={17} /> <span className="max-[540px]:hidden">Menu</span></button>
              <span className="h-5 w-px bg-white/10" />
              <span className="text-xs text-mono-500">{books.length} titles</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex h-11 w-[240px] items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.05] px-4 text-mono-400 transition-colors focus-within:border-white/30 max-[600px]:w-11 max-[600px]:justify-center max-[600px]:px-0">
                <Icon name="search" size={16} />
                <input className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-mono-500 max-[600px]:hidden" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the archive" aria-label="Search your library" />
              </label>
              <button className={iconButtonClass} aria-label="Library settings"><Icon name="settings" size={17} /></button>
              <button className="ml-1 flex h-11 items-center gap-2 rounded-full bg-mono-50 px-5 text-xs font-bold text-mono-950 transition-transform hover:scale-[1.03] max-[480px]:hidden"><Icon name="plus" size={16} /> Add title</button>
            </div>
          </header>

          <div className="px-5 pt-12 pb-16 sm:px-8 lg:px-12 lg:pt-16">
            <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }} className="flex items-end justify-between gap-8">
              <div>
                <p className={eyebrowClass}>Private archive · Updated today</p>
                <h1 className="mt-3 text-[clamp(3.6rem,7.5vw,8.4rem)] leading-[0.78] font-semibold tracking-[-0.085em]">Your<br />library.</h1>
              </div>
              <div className="mb-1 grid grid-cols-2 gap-x-10 gap-y-5 max-[700px]:hidden">
                <div><strong className="block text-3xl font-semibold tracking-[-0.06em]">{books.length}</strong><span className="mt-1 block text-[10px] uppercase tracking-[0.15em] text-mono-500">Titles</span></div>
                <div><strong className="block text-3xl font-semibold tracking-[-0.06em]">06</strong><span className="mt-1 block text-[10px] uppercase tracking-[0.15em] text-mono-500">Series</span></div>
                <div><strong className="block text-3xl font-semibold tracking-[-0.06em]">31h</strong><span className="mt-1 block text-[10px] uppercase tracking-[0.15em] text-mono-500">Read</span></div>
                <div><strong className="block text-3xl font-semibold tracking-[-0.06em]">04</strong><span className="mt-1 block text-[10px] uppercase tracking-[0.15em] text-mono-500">Active</span></div>
              </div>
            </motion.div>

            <div className="mt-14 flex items-center gap-2 overflow-x-auto border-y border-white/10 py-3">
              {["All", "Reading", "Unread", "Completed", "Favorites"].map((filter) => (
                <button key={filter} onClick={() => { setOnlyFavorites(false); setStatusFilter(filter); }} className={`h-10 shrink-0 rounded-full px-5 text-xs transition-colors ${!onlyFavorites && statusFilter === filter ? "bg-mono-50 text-mono-950" : "text-mono-400 hover:bg-white/[0.06] hover:text-white"}`}>{filter}</button>
              ))}
              <span className="ml-auto hidden items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-mono-500 sm:flex"><Icon name="grid" size={14} /> Visual index</span>
            </div>

            {filteredBooks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[430px] flex-col items-center justify-center rounded-[28px] border border-white/10 text-mono-500"><Icon name="search" size={34} /><h2 className="mt-5 text-xl text-white">Nothing on this shelf</h2><p className="mt-2 text-xs">Try another title, creator, or genre.</p></motion.div>
            ) : (
              <>
                <motion.section layout className="mt-8 grid min-h-[520px] grid-cols-[minmax(270px,0.72fr)_minmax(360px,1.28fr)] overflow-hidden rounded-[30px] bg-mono-50 text-mono-950 max-[1050px]:grid-cols-[minmax(250px,.8fr)_1.2fr] max-[700px]:grid-cols-1" aria-label={`Featured book: ${selected.title}`}>
                  <div className="relative min-h-[520px] overflow-hidden bg-mono-200 max-[700px]:min-h-[430px]">
                    <motion.div key={`${selected.id}-backdrop`} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: .24 }} className="absolute inset-0 scale-110 blur-2xl"><Image src={selected.cover} alt="" fill sizes="50vw" className="object-cover" loading="eager" /></motion.div>
                    <motion.div key={selected.id} initial={reduceMotion ? false : { opacity: 0, y: 34, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: .5, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-x-[18%] top-[9%] bottom-[9%] overflow-hidden rounded-sm shadow-[0_25px_50px_rgb(0_0_0/0.32)]">
                      <Image src={selected.cover} alt={`${selected.title} cover`} fill sizes="360px" className="object-cover" priority />
                    </motion.div>
                    <span className="absolute top-5 left-5 rounded-full bg-mono-950 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">Now selected</span>
                  </div>

                  <div className="flex min-w-0 flex-col p-7 sm:p-10 lg:p-12">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-mono-500">{selected.series} · {selected.issue}</span>
                      <button className="grid size-10 place-items-center rounded-full border border-mono-300 text-mono-700 hover:bg-mono-950 hover:text-white" aria-label="Add to favorites"><Icon name="heart" size={17} /></button>
                    </div>
                    <motion.div key={`${selected.id}-copy`} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .42 }}>
                      <h2 className="mt-12 max-w-[680px] text-[clamp(2.8rem,5.2vw,6.6rem)] leading-[0.84] font-semibold tracking-[-0.075em]">{selected.title}</h2>
                      <p className="mt-6 max-w-xl text-sm leading-6 text-mono-600">{selected.description}</p>
                    </motion.div>
                    <div className="mt-auto pt-10">
                      <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-mono-300 pt-5 text-[10px] uppercase tracking-[0.13em] text-mono-500"><span>{selected.author}</span><span>{selected.genre}</span><span>{selected.pages} pages</span><span>{selected.year}</span></div>
                      <div className="mt-7 flex items-center justify-between gap-4">
                        <button className="flex h-12 items-center gap-3 rounded-full bg-mono-950 px-6 text-xs font-bold text-white transition-transform hover:scale-[1.02]"><Icon name="book" size={17} /> {selected.progress > 0 ? "Continue reading" : "Start reading"}</button>
                        <div className="flex gap-2">
                          <button onClick={() => stepSelection(-1)} className="grid size-12 place-items-center rounded-full border border-mono-300 hover:bg-mono-200" aria-label="Previous book"><Icon name="arrowLeft" size={18} /></button>
                          <button onClick={() => stepSelection(1)} className="grid size-12 place-items-center rounded-full border border-mono-300 hover:bg-mono-200" aria-label="Next book"><Icon name="arrowRight" size={18} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                <section className="mt-20" aria-labelledby="collection-heading">
                  <div className="flex items-end justify-between gap-6">
                    <div><p className={eyebrowClass}>Visual index</p><h2 id="collection-heading" className="mt-2 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">The collection</h2></div>
                    <p className="max-w-[280px] text-right text-xs leading-5 text-mono-500 max-[600px]:hidden">A quiet shelf for illustrated stories, strange worlds, and books worth returning to.</p>
                  </div>

                  <motion.div layout className="mt-9 grid grid-cols-4 gap-x-5 gap-y-12 max-[1250px]:grid-cols-3 max-[1040px]:grid-cols-2 max-[520px]:grid-cols-1">
                    {filteredBooks.map((book, index) => (
                      <motion.button
                        layout
                        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : Math.min(index * .035, .25), duration: .42 }}
                        key={book.id}
                        onClick={() => { setSelectedId(book.id); document.getElementById("library-scroll")?.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); }}
                        className="group min-w-0 text-left"
                      >
                        <span className="relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-mono-900">
                          <Image src={book.cover} alt={`${book.title} cover`} fill sizes="(max-width: 520px) 100vw, (max-width: 1040px) 50vw, 25vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
                          <span className="absolute top-4 left-4 rounded-full bg-black/65 px-3 py-1.5 text-[9px] uppercase tracking-[0.13em] text-white backdrop-blur-md">{book.issue}</span>
                          <span className="absolute right-4 bottom-4 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-mono-950 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><Icon name="arrowRight" size={18} /></span>
                        </span>
                        <span className="mt-4 flex items-start justify-between gap-3">
                          <span className="min-w-0"><strong className="block truncate text-base font-semibold tracking-[-0.035em]">{book.title}</strong><span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-mono-500">{book.series} · {book.author}</span></span>
                          <span className="pt-1 font-mono text-[10px] text-mono-600">{String(index + 1).padStart(2, "0")}</span>
                        </span>
                        <span className="mt-3 block h-px overflow-hidden bg-white/10"><motion.span initial={false} animate={{ width: `${book.progress}%` }} className="block h-full bg-mono-50" /></span>
                      </motion.button>
                    ))}
                  </motion.div>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
