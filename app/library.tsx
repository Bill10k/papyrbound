"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import styles from "./library.module.css";

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

  return <main className={styles.desktop}>
    <div className={styles.titlebar}>
      <div className={styles.trafficLights} aria-hidden="true"><span /><span /><span /></div>
      <div className={styles.titlebarName}><span className={styles.miniMark}>P</span> Papyrbound</div>
      <button className={styles.titlebarButton} aria-label="Application menu"><Icon name="menu" size={15} /></button>
    </div>
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}><div><span className={styles.eyebrow}>Local library</span><h1>My collection</h1></div><button className={styles.iconButton} aria-label="Add library"><Icon name="plus" size={16} /></button></div>
        <nav className={styles.navigation} aria-label="Library folders">
          <p className={styles.sectionLabel}>Browse</p>
          {folders.map((folder, index) => <button key={folder} aria-current={activeFolder === folder && !onlyFavorites ? "page" : undefined} onClick={() => { setActiveFolder(folder); setOnlyFavorites(false); }} className={`${styles.navItem} ${activeFolder === folder && !onlyFavorites ? styles.activeNav : ""}`}><Icon name={index === 0 ? "book" : "folder"} size={16} /><span>{folder}</span><span className={styles.navCount}>{index === 0 ? 12 : [8, 2, 2, 2][index - 1]}</span></button>)}
          <p className={styles.sectionLabel}>Reading lists</p>
          <button onClick={() => setOnlyFavorites(true)} className={`${styles.navItem} ${onlyFavorites ? styles.activeNav : ""}`}><Icon name="heart" size={16} /><span>Favorites</span><span className={styles.navCount}>5</span></button>
          <button className={styles.navItem}><Icon name="bookmark" size={16} /><span>Reading now</span><span className={styles.navCount}>6</span></button>
          <button className={styles.navItem}><Icon name="clock" size={16} /><span>Recently added</span></button>
        </nav>
        <div className={styles.sidebarFoot}><div className={styles.storageTop}><span>Library storage</span><span>4.8 / 12 GB</span></div><div className={styles.storageTrack}><span /></div><div className={styles.profile}><span className={styles.avatar}>JD</span><div><strong>Joshua&apos;s library</strong><small>Last scan 2m ago</small></div><button aria-label="Library settings"><Icon name="settings" size={17} /></button></div></div>
      </aside>
      <section className={styles.mainPanel}>
        <header className={styles.toolbar}>
          <div className={styles.historyButtons}><button aria-label="Go back"><Icon name="arrowLeft" size={19} /></button><button aria-label="Go forward" disabled><Icon name="arrowRight" size={19} /></button></div>
          <div className={styles.collectionTitle}><span>Collection</span><strong>{onlyFavorites ? "Favorites" : activeFolder}</strong><small>{filteredBooks.length} books</small></div>
          <div className={styles.toolbarActions}>
            <label className={styles.searchBox}><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your library" aria-label="Search your library" /><kbd>⌘K</kbd></label>
            <div className={styles.viewToggle} aria-label="View style"><button aria-pressed={view === "grid"} onClick={() => setView("grid")} className={view === "grid" ? styles.selectedToggle : ""} aria-label="Grid view"><Icon name="grid" size={16} /></button><button aria-pressed={view === "list"} onClick={() => setView("list")} className={view === "list" ? styles.selectedToggle : ""} aria-label="List view"><Icon name="list" size={17} /></button></div>
            <button className={styles.addButton}><Icon name="plus" size={16} /> Add books</button>
          </div>
        </header>
        <div className={styles.contentArea}>
          <div className={styles.libraryContent}>
            <div className={styles.contentHeading}><div><p>{onlyFavorites ? "Reading list" : "Your shelves"}</p><h2>{query ? `Results for “${query}”` : "Continue exploring"}</h2></div><button className={styles.sortButton}>Recently added <Icon name="chevron" size={14} /></button></div>
            {filteredBooks.length === 0 ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.emptyState}><Icon name="search" size={28} /><h2>No books found</h2><p>Try another title, creator, or genre.</p></motion.div> : view === "grid" ?
              <motion.div layout className={styles.bookGrid}>{filteredBooks.map((book, index) => <motion.button aria-pressed={selected.id === book.id} layout key={book.id} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay: reduceMotion ? 0 : Math.min(index * .025, .2), ease: [0.22, 1, 0.36, 1] }} whileTap={reduceMotion ? undefined : { scale: .985 }} onClick={() => setSelectedId(book.id)} className={`${styles.bookCard} ${selected.id === book.id ? styles.selectedCard : ""}`}>
                <span className={styles.coverWrap}><Image src={book.cover} alt={`${book.series}: ${book.title} cover`} fill sizes="(max-width: 700px) 42vw, (max-width: 1200px) 22vw, 170px" className={styles.coverImage} /><span className={styles.coverShade} /><span className={styles.coverSeries}>{book.series}</span><span className={styles.coverTitle}>{book.title}</span><span className={styles.issueBadge}>{book.issue}</span>{book.favorite && <span className={styles.favoriteBadge}><Icon name="heart" size={13} /></span>}{book.progress > 0 && book.progress < 100 && <span className={styles.progressBar}><span style={{ width: `${book.progress}%` }} /></span>}{book.progress === 100 && <span className={styles.readBadge}><Icon name="check" size={12} /> Read</span>}</span>
                <span className={styles.cardText}><strong>{book.title}</strong><span>{book.series} · {book.issue}</span></span></motion.button>)}</motion.div> :
              <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }} className={styles.bookList}><div className={styles.listHeader}><span>Title</span><span>Series</span><span>Pages</span><span>Progress</span><span>Added</span></div>{filteredBooks.map((book) => <motion.button layout key={book.id} whileTap={reduceMotion ? undefined : { scale: .997 }} onClick={() => setSelectedId(book.id)} className={`${styles.listRow} ${selected.id === book.id ? styles.selectedRow : ""}`}><span className={styles.listTitle}><span className={styles.listThumb}><Image src={book.cover} alt="" fill sizes="40px" /></span><span><strong>{book.title}</strong><small>{book.author}</small></span></span><span>{book.series}</span><span>{book.pages}</span><span>{book.progress}%</span><span>{book.added}</span></motion.button>)}</motion.div>}
          </div>
          <aside className={styles.inspector}>
            <div className={styles.inspectorTop}><span>Book details</span><button aria-label="More book actions"><Icon name="more" size={18} /></button></div>
            <AnimatePresence mode="wait" initial={false}><motion.div key={`cover-${selected.id}`} initial={reduceMotion ? false : { opacity: 0, y: 8, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5, scale: .99 }} transition={{ duration: .22, ease: [0.22, 1, 0.36, 1] }} className={styles.detailCover}><Image src={selected.cover} alt={`${selected.title} cover`} fill sizes="210px" className={styles.coverImage} /><span className={styles.coverShade} /><span className={styles.detailCoverSeries}>{selected.series}</span><span className={styles.detailCoverTitle}>{selected.title}</span></motion.div></AnimatePresence>
            <motion.div key={`title-${selected.id}`} initial={reduceMotion ? false : { opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .22 }} className={styles.detailTitle}><span>{selected.issue}</span><h2>{selected.title}</h2><p>{selected.author}</p></motion.div>
            <div className={styles.rating} aria-label={`${selected.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <span key={star} className={star <= selected.rating ? styles.starOn : ""}>★</span>)}</div>
            <p className={styles.description}>{selected.description}</p>
            <dl className={styles.metadata}><div><dt>Year</dt><dd>{selected.year}</dd></div><div><dt>Genre</dt><dd>{selected.genre}</dd></div><div><dt>Pages</dt><dd>{selected.pages}</dd></div><div><dt>Format</dt><dd>{selected.format}</dd></div><div><dt>File size</dt><dd>{selected.size}</dd></div><div><dt>Added</dt><dd>{selected.added}</dd></div></dl>
            <div className={styles.detailActions}><button className={styles.readButton}>{selected.progress > 0 ? "Continue reading" : "Start reading"}<Icon name="arrowRight" size={16} /></button><button className={styles.secondaryButton} aria-label="Add to reading list"><Icon name="bookmark" size={17} /></button></div>
            {selected.progress > 0 && <div className={styles.readingProgress}><div><span>Reading progress</span><strong>{selected.progress}%</strong></div><div className={styles.detailTrack}><span style={{ width: `${selected.progress}%` }} /></div></div>}
          </aside>
        </div>
        <footer className={styles.statusbar}><span><Icon name="sparkles" size={14} /> Library is up to date</span><span>{filteredBooks.length} items · {filteredBooks.reduce((sum, book) => sum + book.pages, 0).toLocaleString()} pages</span></footer>
      </section>
    </div>
  </main>;
}
