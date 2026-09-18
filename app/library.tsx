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
  const selectedIndex = Math.max(0, filteredBooks.findIndex((book) => book.id === selected.id));
  const flowBooks = filteredBooks.length > 0
    ? Array.from({ length: Math.min(6, filteredBooks.length) }, (_, index) => filteredBooks[(selectedIndex + index) % filteredBooks.length])
    : [];

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

        <section className="grid min-w-0 grid-rows-[52px_minmax(0,1fr)_32px]">
          <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b bg-card px-3 max-[700px]:grid-cols-[auto_1fr]">
            <div className="flex items-center gap-0.5">
              <button className={iconButtonClass} aria-label="Previous book"><Icon name="arrowLeft" size={19} /></button>
              <button className={iconButtonClass} aria-label="Next book"><Icon name="arrowRight" size={19} /></button>
              <span className="mx-1 h-5 w-px bg-border" />
              <button className={iconButtonClass} aria-label="Library settings"><Icon name="settings" size={18} /></button>
              <button className={`${iconButtonClass} max-[700px]:hidden`} aria-label="Book information"><Icon name="book" size={17} /></button>
            </div>
            <div className="text-center max-[700px]:text-left"><strong className="block text-base font-semibold tracking-[-0.02em]">{onlyFavorites ? "Favorites" : activeFolder}</strong><span className="text-[9px] text-muted-foreground">{query ? `${filteredBooks.length} search results` : `${filteredBooks.length} volumes`}</span></div>
            <div className="flex items-center justify-end gap-2 max-[700px]:col-span-2 max-[700px]:mt-2 max-[700px]:hidden">
              <button className={iconButtonClass} aria-label="Cover flow view"><Icon name="grid" size={17} /></button>
              <label className="flex h-8 w-[230px] items-center gap-2 rounded-md border bg-background px-2.5 text-muted-foreground focus-within:border-ring max-[1000px]:w-[180px]">
                <Icon name="search" size={15} /><input className="w-full min-w-0 bg-transparent text-[10px] text-foreground outline-none placeholder:text-muted-foreground/50" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type to search" aria-label="Search your library" />
              </label>
            </div>
          </header>

          <div className="grid min-h-0 grid-rows-[minmax(280px,1fr)_minmax(250px,1.15fr)] bg-background max-[700px]:grid-rows-[310px_minmax(300px,1fr)]">
            <section className="relative min-h-0 overflow-hidden border-b bg-mono-950 [perspective:1200px]" aria-label="Cover flow">
              <div className="absolute top-3 left-3 z-30 font-mono text-2xl font-light text-muted-foreground">{filteredBooks.length ? selectedIndex + 1 : 0}<span className="text-base text-mono-700">/{filteredBooks.length}</span></div>
              {filteredBooks.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col items-center justify-center text-muted-foreground"><Icon name="search" size={30} /><h2 className="mt-3 text-sm text-foreground">No books found</h2><p className="mt-1 text-[10px]">Try another title, creator, or genre.</p></motion.div>
              ) : (
                <div className="absolute inset-0">
                  {flowBooks.map((book, offset) => {
                    const isSelected = offset === 0;
                    return (
                      <motion.button
                        key={book.id}
                        className="absolute top-1/2 left-[56%] aspect-[2/3] w-[176px] origin-center overflow-visible border-0 bg-transparent p-0 text-left max-[1050px]:w-[154px] max-[700px]:left-[48%] max-[700px]:w-[132px]"
                        style={{ zIndex: 20 - offset, transformStyle: "preserve-3d" }}
                        initial={reduceMotion ? false : { opacity: 0, x: 120, y: -145, scale: .86 }}
                        animate={{
                          opacity: isSelected ? 1 : Math.max(.18, .67 - offset * .1),
                          x: isSelected ? -88 : 95 + offset * 48,
                          y: isSelected ? -154 : -142 + offset * 3,
                          scale: isSelected ? 1 : Math.max(.68, .94 - offset * .045),
                          rotateY: isSelected ? 0 : -17,
                        }}
                        transition={{ duration: reduceMotion ? 0 : .48, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => setSelectedId(book.id)}
                        aria-label={`Select ${book.title}`}
                      >
                        <span className={`relative block h-full w-full overflow-hidden border bg-card shadow-[0_18px_45px_rgb(0_0_0/0.45)] ${isSelected ? "border-foreground/60" : "border-border"}`}>
                          <Image src={book.cover} alt={`${book.title} cover`} fill sizes="176px" className="object-cover" priority={isSelected} />
                          <span className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
                          <span className="absolute bottom-12 left-3 text-[8px] font-bold uppercase tracking-[0.13em] text-white/70">{book.series}</span>
                          <span className="absolute bottom-4 left-3 max-w-[calc(100%-24px)] font-serif text-xl leading-none font-semibold text-white">{book.title}</span>
                          {book.favorite && <span className="absolute top-0 right-3 flex h-9 w-6 items-center justify-center bg-primary text-primary-foreground"><Icon name="bookmark" size={13} /></span>}
                        </span>
                        {isSelected && <span className="pointer-events-none absolute top-[calc(100%+2px)] left-0 block h-full w-full origin-top scale-y-[-1] overflow-hidden opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]"><Image src={book.cover} alt="" fill sizes="176px" className="object-cover" /></span>}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="grid min-h-0 grid-rows-[42px_31px_minmax(0,1fr)] bg-card" aria-label="Library table">
              <div className="flex items-center justify-between border-b px-2.5">
                <div className="flex items-center gap-0.5">
                  <button className={iconButtonClass} aria-label="Add note"><Icon name="more" size={17} /></button>
                  <button className={iconButtonClass} aria-label="Edit metadata"><Icon name="settings" size={16} /></button>
                  <button className={iconButtonClass} aria-label="Mark as read"><Icon name="check" size={17} /></button>
                  <button className={iconButtonClass} aria-label="Add to favorites"><Icon name="heart" size={16} /></button>
                  <button className={iconButtonClass} aria-label="Add to reading list"><Icon name="bookmark" size={16} /></button>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground"><span>{selected.title}</span><button className="flex h-7 items-center gap-1.5 rounded-md border bg-background px-2 text-foreground"><Icon name="book" size={14} /> Open</button></div>
              </div>

              <div className="overflow-hidden border-b bg-muted/50">
                <div className="grid h-full min-w-[980px] grid-cols-[42px_minmax(170px,1.4fr)_minmax(230px,2fr)_100px_70px_80px_110px_60px_100px] items-center px-2 text-[9px] text-muted-foreground"><span>#</span><span>Title</span><span>File name</span><span>Current page</span><span>Pages</span><span>Size</span><span>Publication date</span><span>Read</span><span>Rating</span></div>
              </div>

              <div className="min-h-0 overflow-auto">
                <div className="min-w-[980px]">
                  {filteredBooks.map((book, index) => {
                    const isSelected = selected.id === book.id;
                    const currentPage = book.progress > 0 ? Math.max(1, Math.round(book.pages * book.progress / 100)) : "–";
                    return (
                      <motion.button
                        layout
                        key={book.id}
                        onClick={() => setSelectedId(book.id)}
                        className={`grid h-[34px] w-full grid-cols-[42px_minmax(170px,1.4fr)_minmax(230px,2fr)_100px_70px_80px_110px_60px_100px] items-center border-b px-2 text-left text-[10px] text-muted-foreground transition-colors hover:bg-accent/50 ${isSelected ? "bg-accent text-accent-foreground" : index % 2 ? "bg-muted/20" : "bg-background"}`}
                      >
                        <span className="font-mono text-[9px]">{String(index + 1).padStart(2, "0")}</span>
                        <span className="truncate font-medium text-foreground">{book.title}</span>
                        <span className="truncate">{book.series.replaceAll(" ", "_")}_{book.issue.replaceAll(" ", "-")}.{book.format.toLowerCase()}</span>
                        <span>{currentPage}</span><span>{book.pages}</span><span>{book.size}</span><span>{book.year}</span><span>{book.progress === 100 ? "yes" : "no"}</span>
                        <span className="tracking-[0.2em] text-foreground">{"•".repeat(book.rating)}<span className="text-muted-foreground/30">{"•".repeat(5 - book.rating)}</span></span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          <footer className="flex items-center justify-between border-t bg-card px-3 text-[9px] text-muted-foreground"><span className="flex items-center gap-1.5"><Icon name="sparkles" size={14} /> {filteredBooks.length} items · {filteredBooks.reduce((sum, book) => sum + book.pages, 0).toLocaleString()} pages</span><span className="flex items-center gap-2"><Icon name="list" size={14} /><span className="h-1 w-28 rounded-full bg-muted"><span className="block h-full w-2/5 rounded-full bg-primary" /></span><Icon name="grid" size={14} /></span></footer>
        </section>
      </div>
    </main>
  );
}
