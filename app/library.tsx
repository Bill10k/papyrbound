"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeFolder, setActiveFolder] = useState("All books");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const filteredBooks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesQuery = !needle || `${book.title} ${book.series} ${book.author} ${book.genre}`.toLowerCase().includes(needle);
      const matchesFolder = activeFolder === "All books"
        || (activeFolder === "Graphic novels" && !["Paper Skies", "Verdant City"].includes(book.series))
        || (activeFolder === "Manga" && book.series === "Ashfall")
        || (activeFolder === "Art books" && book.series === "Verdant City")
        || (activeFolder === "PDF library" && book.format === "PDF");
      return matchesQuery && (onlyFavorites ? Boolean(book.favorite) : matchesFolder);
    });
  }, [activeFolder, query, onlyFavorites]);
  const selected = filteredBooks.find((book) => book.id === selectedId) ?? filteredBooks[0] ?? books[0];

  const eyebrowClass = "text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground";
  const iconButtonClass = "inline-flex size-[30px] items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";
  const navItemClass = "grid min-h-9 w-full grid-cols-[20px_1fr_auto] items-center rounded-md border-0 px-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-accent-foreground";

  return (
    <main className="h-dvh min-h-[680px] overflow-hidden bg-background text-foreground tracking-[-0.01em] max-[820px]:h-auto max-[820px]:min-h-dvh max-[820px]:overflow-visible">
      <div className="grid h-9 grid-cols-[1fr_auto_1fr] items-center border-b bg-card px-3.5 select-none">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-mono-500" />
          <span className="size-2 rounded-full bg-mono-600" />
          <span className="size-2 rounded-full bg-mono-700" />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.02em] text-muted-foreground">
          <span className="inline-flex size-4 items-center justify-center rounded-sm bg-primary text-[9px] font-extrabold text-primary-foreground">P</span>
          Papyrbound
        </div>
        <button className="justify-self-end p-1 text-muted-foreground hover:text-foreground" aria-label="Application menu"><Icon name="menu" size={15} /></button>
      </div>

      <div className="grid h-[calc(100dvh-36px)] min-h-[644px] grid-cols-[232px_minmax(0,1fr)] max-[1100px]:grid-cols-[205px_minmax(0,1fr)] max-[820px]:block max-[820px]:h-auto max-[820px]:min-h-[calc(100dvh-36px)]">
        <aside className="flex min-w-0 flex-col border-r bg-card max-[820px]:hidden">
          <div className="flex h-[78px] items-center justify-between border-b px-[18px]">
            <div><span className={eyebrowClass}>Local library</span><h1 className="mt-1 text-base font-semibold tracking-[-0.025em]">My collection</h1></div>
            <button className={`${iconButtonClass} border`} aria-label="Add library"><Icon name="plus" size={16} /></button>
          </div>

          <nav className="flex-1 overflow-y-auto p-2.5" aria-label="Library folders">
            <p className={`${eyebrowClass} mx-2.5 mt-3.5 mb-2`}>Browse</p>
            {folders.map((folder, index) => {
              const isActive = activeFolder === folder && !onlyFavorites;
              return <button key={folder} aria-current={isActive ? "page" : undefined} onClick={() => { setActiveFolder(folder); setOnlyFavorites(false); }} className={`${navItemClass} ${isActive ? "bg-accent text-accent-foreground" : ""}`}><Icon name={index === 0 ? "book" : "folder"} size={16} /><span>{folder}</span><span className="text-[10px] opacity-60">{index === 0 ? 12 : [8, 2, 2, 2][index - 1]}</span></button>;
            })}
            <p className={`${eyebrowClass} mx-2.5 mt-5 mb-2`}>Reading lists</p>
            <button onClick={() => setOnlyFavorites(true)} className={`${navItemClass} ${onlyFavorites ? "bg-accent text-accent-foreground" : ""}`}><Icon name="heart" size={16} /><span>Favorites</span><span className="text-[10px] opacity-60">5</span></button>
            <button className={navItemClass}><Icon name="bookmark" size={16} /><span>Reading now</span><span className="text-[10px] opacity-60">6</span></button>
            <button className={navItemClass}><Icon name="clock" size={16} /><span>Recently added</span></button>
          </nav>

          <div className="border-t px-4 pt-3.5 pb-3">
            <div className="flex justify-between text-[9px] text-muted-foreground"><span>Library storage</span><span>4.8 / 12 GB</span></div>
            <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-muted"><span className="block h-full w-2/5 rounded-full bg-primary" /></div>
            <div className="mt-4 grid grid-cols-[30px_1fr_auto] items-center gap-2.5">
              <span className="flex size-[30px] items-center justify-center rounded-full border bg-muted text-[9px] font-bold text-muted-foreground">JD</span>
              <div><strong className="block text-[10px] font-semibold text-card-foreground">Joshua&apos;s library</strong><small className="mt-0.5 block text-[9px] text-muted-foreground">Last scan 2m ago</small></div>
              <button className="p-1 text-muted-foreground hover:text-foreground" aria-label="Library settings"><Icon name="settings" size={17} /></button>
            </div>
          </div>
        </aside>

        <section className="grid min-w-0 grid-rows-[78px_minmax(0,1fr)_27px] max-[820px]:grid-rows-[auto_auto_27px]">
          <header className="flex items-center gap-3.5 border-b bg-card px-[18px] max-[820px]:h-auto max-[820px]:flex-wrap max-[820px]:gap-2 max-[820px]:px-3.5 max-[820px]:py-3">
            <div className="flex gap-0.5 max-[820px]:hidden"><button className={iconButtonClass} aria-label="Go back"><Icon name="arrowLeft" size={19} /></button><button className={iconButtonClass} aria-label="Go forward" disabled><Icon name="arrowRight" size={19} /></button></div>
            <div className="min-w-36 max-[820px]:min-w-28"><strong className="block text-[15px] font-semibold">{onlyFavorites ? "Favorites" : activeFolder}</strong><small className="mt-0.5 block text-[9px] text-muted-foreground">{filteredBooks.length} books</small></div>
            <div className="ml-auto flex items-center gap-2 max-[820px]:flex-1 max-[560px]:basis-full">
              <label className="flex h-[34px] w-[min(23vw,250px)] items-center gap-2 rounded-lg border bg-background px-2.5 text-muted-foreground focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 max-[820px]:flex-1">
                <Icon name="search" size={16} /><input className="w-full min-w-0 bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground/50" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your library" aria-label="Search your library" /><kbd className="rounded border bg-muted px-1 py-0.5 font-sans text-[9px] text-muted-foreground max-[820px]:hidden">⌘K</kbd>
              </label>
              <div className="flex rounded-lg border bg-background p-0.5 max-[560px]:hidden" aria-label="View style"><button aria-pressed={view === "grid"} onClick={() => setView("grid")} className={`inline-flex size-7 items-center justify-center rounded-md ${view === "grid" ? "bg-accent text-accent-foreground shadow-xs" : "text-muted-foreground"}`} aria-label="Grid view"><Icon name="grid" size={16} /></button><button aria-pressed={view === "list"} onClick={() => setView("list")} className={`inline-flex size-7 items-center justify-center rounded-md ${view === "list" ? "bg-accent text-accent-foreground shadow-xs" : "text-muted-foreground"}`} aria-label="List view"><Icon name="list" size={17} /></button></div>
              <button className="flex h-[34px] items-center gap-1.5 rounded-lg bg-primary px-3 text-[11px] font-bold text-primary-foreground hover:opacity-90 max-[1100px]:w-[34px] max-[1100px]:justify-center max-[1100px]:px-0 max-[1100px]:text-0"><Icon name="plus" size={16} /><span className="max-[1100px]:hidden">Add books</span></button>
            </div>
          </header>

          <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_272px] max-[1100px]:grid-cols-[minmax(0,1fr)_238px] max-[820px]:block">
            <div className="min-w-0 overflow-y-auto bg-background px-6 pt-[22px] pb-10 max-[820px]:overflow-visible max-[820px]:px-4 max-[820px]:pt-5 max-[820px]:pb-8">
              <div className="mb-5 flex items-end justify-between"><div><p className={`${eyebrowClass} mb-1`}>{onlyFavorites ? "Reading list" : "Your shelves"}</p><h2 className="text-xl font-semibold tracking-[-0.035em] max-[560px]:text-lg">{query ? `Results for “${query}”` : "Continue exploring"}</h2></div><button className="flex items-center gap-1 py-1.5 text-[10px] text-muted-foreground hover:text-foreground max-[560px]:hidden">Recently added <Icon name="chevron" size={14} /></button></div>

              {filteredBooks.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[55vh] flex-col items-center justify-center text-center text-muted-foreground"><Icon name="search" size={28} /><h2 className="mt-2.5 text-[15px] text-foreground">No books found</h2><p className="mt-1 text-[10px]">Try another title, creator, or genre.</p></motion.div>
              ) : view === "grid" ? (
                <motion.div layout className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-x-4 gap-y-6 max-[1100px]:grid-cols-[repeat(auto-fill,minmax(122px,1fr))] max-[560px]:grid-cols-2 max-[560px]:gap-x-3 max-[560px]:gap-y-5">
                  {filteredBooks.map((book, index) => {
                    const isSelected = selected.id === book.id;
                    return <motion.button aria-pressed={isSelected} layout key={book.id} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay: reduceMotion ? 0 : Math.min(index * .025, .2), ease: [0.22, 1, 0.36, 1] }} whileTap={reduceMotion ? undefined : { scale: .985 }} onClick={() => setSelectedId(book.id)} className="group min-w-0 border-0 bg-transparent p-0 text-left">
                      <span className={`relative block aspect-[2/3] overflow-hidden rounded-md border bg-muted shadow-[0_9px_18px_rgb(0_0_0/0.28)] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-foreground/25 group-hover:shadow-[0_13px_25px_rgb(0_0_0/0.38)] ${isSelected ? "border-primary ring-2 ring-primary/20" : ""}`}>
                        <Image src={book.cover} alt={`${book.series}: ${book.title} cover`} fill sizes="(max-width: 700px) 42vw, (max-width: 1200px) 22vw, 170px" className="object-cover" />
                        <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/90" />
                        <span className="absolute bottom-11 left-2.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/70">{book.series}</span>
                        <span className="absolute bottom-4 left-2.5 max-w-[calc(100%-20px)] font-serif text-[clamp(15px,1.2vw,19px)] leading-none font-semibold tracking-[-0.035em] text-white">{book.title}</span>
                        <span className="absolute top-2 left-2 rounded-sm border border-white/15 bg-black/70 px-1.5 py-1 text-[8px] text-white backdrop-blur-sm">{book.issue}</span>
                        {book.favorite && <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm"><Icon name="heart" size={13} /></span>}
                        {book.progress > 0 && book.progress < 100 && <span className="absolute bottom-0 left-0 z-10 block h-[3px] w-full bg-black/60"><span className="block h-full bg-primary" style={{ width: `${book.progress}%` }} /></span>}
                        {book.progress === 100 && <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded-sm bg-primary px-1.5 py-1 text-[8px] font-bold text-primary-foreground"><Icon name="check" size={12} /> Read</span>}
                      </span>
                      <span className="block px-0.5 pt-2.5"><strong className="block truncate text-[11px] font-medium text-foreground">{book.title}</strong><span className="mt-0.5 block truncate text-[9px] text-muted-foreground">{book.series} · {book.issue}</span></span>
                    </motion.button>;
                  })}
                </motion.div>
              ) : (
                <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }} className="overflow-hidden rounded-lg border">
                  <div className="grid h-[30px] grid-cols-[minmax(190px,2fr)_minmax(120px,1fr)_70px_80px_90px] items-center bg-card px-3 text-[8px] uppercase text-muted-foreground max-[1100px]:grid-cols-[minmax(180px,2fr)_minmax(100px,1fr)_60px_70px] max-[560px]:hidden"><span>Title</span><span>Series</span><span>Pages</span><span>Progress</span><span className="max-[1100px]:hidden">Added</span></div>
                  {filteredBooks.map((book) => {
                    const isSelected = selected.id === book.id;
                    return <motion.button layout key={book.id} whileTap={reduceMotion ? undefined : { scale: .997 }} onClick={() => setSelectedId(book.id)} className={`grid min-h-[52px] w-full grid-cols-[minmax(190px,2fr)_minmax(120px,1fr)_70px_80px_90px] items-center border-t bg-background px-3 py-1 text-left text-[10px] text-muted-foreground hover:bg-accent/40 max-[1100px]:grid-cols-[minmax(180px,2fr)_minmax(100px,1fr)_60px_70px] max-[560px]:grid-cols-[1fr_45px] ${isSelected ? "bg-accent/60 shadow-[inset_2px_0_var(--primary)]" : ""}`}>
                      <span className="flex min-w-0 items-center gap-2.5"><span className="relative h-10 w-[27px] shrink-0 overflow-hidden rounded-sm"><Image src={book.cover} alt="" fill sizes="40px" className="object-cover" /></span><span className="min-w-0"><strong className="block truncate text-[11px] font-medium text-foreground">{book.title}</strong><small className="mt-0.5 block truncate text-[9px] text-muted-foreground">{book.author}</small></span></span>
                      <span className="max-[560px]:hidden">{book.series}</span><span className="max-[560px]:hidden">{book.pages}</span><span>{book.progress}%</span><span className="max-[1100px]:hidden max-[560px]:hidden">{book.added}</span>
                    </motion.button>;
                  })}
                </motion.div>
              )}
            </div>

            <aside className="min-w-0 overflow-y-auto border-l bg-card px-[23px] pb-7 max-[1100px]:px-[18px] max-[820px]:grid max-[820px]:grid-cols-[140px_1fr] max-[820px]:gap-x-5 max-[820px]:overflow-visible max-[820px]:border-t max-[820px]:border-l-0 max-[820px]:p-5 max-[560px]:grid-cols-[110px_1fr] max-[560px]:p-4">
              <div className="flex h-[52px] items-center justify-between text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground max-[820px]:hidden"><span>Book details</span><button className={iconButtonClass} aria-label="More book actions"><Icon name="more" size={18} /></button></div>
              <AnimatePresence mode="wait" initial={false}><motion.div key={`cover-${selected.id}`} initial={reduceMotion ? false : { opacity: 0, y: 8, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5, scale: .99 }} transition={{ duration: .22, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto mt-1 mb-5 aspect-[2/3] w-full max-w-[178px] overflow-hidden rounded-md border shadow-[0_14px_30px_rgb(0_0_0/0.42)] max-[820px]:row-span-6 max-[820px]:m-0 max-[820px]:w-[140px] max-[560px]:w-[110px]"><Image src={selected.cover} alt={`${selected.title} cover`} fill sizes="210px" className="object-cover" /><span className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/90" /><span className="absolute bottom-[55px] left-3 text-[8px] font-bold uppercase tracking-[0.13em] text-white/75">{selected.series}</span><span className="absolute bottom-5 left-3 max-w-[150px] font-serif text-2xl leading-[0.9] font-semibold text-white max-[560px]:text-lg">{selected.title}</span></motion.div></AnimatePresence>
              <motion.div key={`title-${selected.id}`} initial={reduceMotion ? false : { opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .22 }} className="max-[820px]:self-end"><span className="text-[9px] font-bold uppercase tracking-[0.09em] text-muted-foreground">{selected.issue}</span><h2 className="mt-1 text-xl font-semibold tracking-[-0.035em]">{selected.title}</h2><p className="mt-0.5 text-[11px] text-muted-foreground">{selected.author}</p></motion.div>
              <div className="mt-2.5 flex gap-0.5 text-xs text-muted" aria-label={`${selected.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <span key={star} className={star <= selected.rating ? "text-foreground" : "text-muted"}>★</span>)}</div>
              <p className="mt-3.5 text-[10px] leading-relaxed text-muted-foreground max-[820px]:col-start-2 max-[560px]:hidden">{selected.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-2.5 gap-y-3 border-y py-4 max-[820px]:col-start-2">{[["Year", selected.year], ["Genre", selected.genre], ["Pages", selected.pages], ["Format", selected.format], ["File size", selected.size], ["Added", selected.added]].map(([label, value]) => <div key={label}><dt className="mb-0.5 text-[8px] uppercase text-muted-foreground">{label}</dt><dd className="text-[10px] text-card-foreground">{value}</dd></div>)}</dl>
              <div className="mt-4 grid grid-cols-[1fr_34px] gap-2 max-[820px]:col-start-2"><button className="flex h-[34px] items-center justify-center gap-2 rounded-md bg-primary text-[10px] font-bold text-primary-foreground hover:opacity-90">{selected.progress > 0 ? "Continue reading" : "Start reading"}<Icon name="arrowRight" size={16} /></button><button className="inline-flex items-center justify-center rounded-md border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground" aria-label="Add to reading list"><Icon name="bookmark" size={17} /></button></div>
              {selected.progress > 0 && <div className="mt-[18px] border-t pt-3.5 max-[820px]:col-start-2"><div className="flex justify-between text-[9px] text-muted-foreground"><span>Reading progress</span><strong className="font-semibold text-foreground">{selected.progress}%</strong></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-primary" style={{ width: `${selected.progress}%` }} /></div></div>}
            </aside>
          </div>

          <footer className="flex items-center justify-between border-t bg-card px-3.5 text-[8px] text-muted-foreground"><span className="flex items-center gap-1.5"><Icon name="sparkles" size={14} /> Library is up to date</span><span className="max-[560px]:hidden">{filteredBooks.length} items · {filteredBooks.reduce((sum, book) => sum + book.pages, 0).toLocaleString()} pages</span></footer>
        </section>
      </div>
    </main>
  );
}
