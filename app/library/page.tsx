"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { recentReads, favourites } from "../(Home)/data";
import BookCover from "@/app/components/book-cover";
import { Ellipsis } from "lucide-react";

const shelfBooks = [
  {
    ...favourites[0],
    title: "A Passage to India",
    author: "E. M. Forster",
    progress: 0,
  },
  {
    ...recentReads[2],
    title: "From the Earth to the Moon",
    author: "Jules Verne",
    progress: 38,
  },
  {
    ...recentReads[0],
    title: "Indian Fairy Tales",
    author: "Joseph Jacobs",
    progress: 0,
  },
  {
    ...favourites[2],
    title: "On a Chinese Screen",
    author: "W. Somerset Maugham",
    progress: 100,
  },
  {
    ...recentReads[3],
    title: "Short Fiction",
    author: "Ray Bradbury",
    progress: 25,
  },
  {
    ...recentReads[1],
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    progress: 2,
  },
  {
    ...favourites[1],
    title: "The Gambler",
    author: "Fyodor Dostoevsky",
    progress: 54,
  },
  {
    ...favourites[0],
    title: "The Jungle Book",
    author: "Rudyard Kipling",
    progress: 0,
  },
  { ...recentReads[1], title: "The Odyssey", author: "Homer", progress: 100 },
];

const details = shelfBooks[5];

export default function LibraryPage() {
  const [selectedBook, setSelectedBook] = useState(details.title);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hiddenBookTitles, setHiddenBookTitles] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [progressByTitle, setProgressByTitle] = useState<Record<string, number>>(
    () => Object.fromEntries(shelfBooks.map((book) => [book.title, book.progress])),
  );
  const visibleBooks = shelfBooks.filter(
    (book) => !hiddenBookTitles.includes(book.title),
  );
  const selectedDetails =
    visibleBooks.find((book) => book.title === selectedBook) ??
    visibleBooks[0] ??
    details;
  const selectedProgress = progressByTitle[selectedDetails.title] ?? selectedDetails.progress;

  const removeBook = (title: string) => {
    setHiddenBookTitles((current) => [...current, title]);
    setActiveMenu(null);

    if (title === selectedBook) {
      const nextBook = visibleBooks.find((book) => book.title !== title);
      if (nextBook) setSelectedBook(nextBook.title);
    }
  };

  useEffect(() => {
    if (!activeMenu) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveMenu(null);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeMenu]);

  return (
    <main
      className="min-h-dvh overflow-hidden text-[#24231f]"
      aria-label="Library"
    >
      <div className="grid min-h-dvh grid-cols-[minmax(0,1fr)_minmax(320px,0.36fr)]">
        <section className="min-w-0 px-7 pb-12 pt-16 xl:px-8">
          <div className="h-16" />
          <div className="mb-5 flex items-end justify-between border-b border-[#d3c9b5] pb-3">
            <span className="flex items-center gap-2 text-2xl tracking-[-0.045em]">
              <h1 className="">All books</h1>
              <span>(24)</span>
            </span>
            {/* <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-">09 books</span> */}
          </div>

          <motion.div
            className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 xl:grid-cols-5"
            initial="hidden"
            animate="show"
          >
            {visibleBooks.map((book, index) => {
              const progress = progressByTitle[book.title] ?? book.progress;

              return (
              <motion.article
                key={`${book.title}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: index * 0.045,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
                className="relative text-left"
              >
                <motion.button
                  type="button"
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedBook(book.title)}
                  className="group block w-full text-left"
                  aria-label={`View details for ${book.title}`}
                >
                  <BookCover
                    src={book.cover}
                    title={book.title}
                    sizes="(max-width: 640px) 42vw, (max-width: 1280px) 22vw, 180px"
                  />
                </motion.button>
                <div className="mt-1 grid grid-cols-[1fr_auto] items-center text-sidebar-muted">
                  <div className="inline-block rounded-full py-1 text-[11px] text-sidebar-background">
                    {progress === 0 ? (
                      <span className="border-2 rounded-full text-accent-foreground  px-1 py-px text-[9px] bg-input">
                        New
                      </span>
                    ) : progress === 100 ? (
                      <span className="">
                        Finished
                      </span>
                    ) : (
                      <span className="">
                        {progress}%
                      </span>
                    )}
                  </div>

                  <div
                    ref={activeMenu === book.title ? menuRef : undefined}
                    className="relative"
                  >
                    <button
                      type="button"
                      aria-label={`Actions for ${book.title}`}
                      aria-expanded={activeMenu === book.title}
                      aria-controls={`book-actions-${index}`}
                      onClick={() =>
                        setActiveMenu((current) =>
                          current === book.title ? null : book.title,
                        )
                      }
                      className="grid size-7 place-items-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    >
                      <Ellipsis aria-hidden="true" size={20} />
                    </button>

                    <AnimatePresence initial={false}>
                      {activeMenu === book.title && (
                        <motion.div
                          id={`book-actions-${index}`}
                          role="menu"
                          initial={reduceMotion ? false : { y: 12, opacity: 0, scale: 0.92 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          exit={reduceMotion ? { opacity: 0 } : { y: 8, opacity: 0, scale: 0.96 }}
                          transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-xl border border-sidebar-border bg-background p-2 text-sm text-sidebar-foreground shadow-[0_18px_44px_rgba(42,37,26,0.16)]"
                        >
                          <div className="space-y-1">
                            <motion.button
                              type="button"
                              role="menuitem"
                              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                              onClick={() => {
                                setSelectedBook(book.title);
                                setActiveMenu(null);
                              }}
                              className="w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
                            >
                              View details
                            </motion.button>
                            <motion.button
                              type="button"
                              role="menuitem"
                              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                              onClick={() => {
                                setProgressByTitle((current) => ({
                                  ...current,
                                  [book.title]: progress === 100 ? 0 : 100,
                                }));
                                setActiveMenu(null);
                              }}
                              className="w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
                            >
                              {progress === 100 ? "Mark as unread" : "Mark as finished"}
                            </motion.button>
                            <motion.button
                              type="button"
                              role="menuitem"
                              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                              onClick={() => removeBook(book.title)}
                              className="w-full rounded-md px-3 py-2.5 text-left text-destructive transition-colors hover:bg-destructive/10"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.article>
              );
            })}
          </motion.div>
        </section>

        <motion.aside
          key={selectedBook}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-1 m-1 flex h-[calc(100dvh-0.5rem)] min-w-0 flex-col overflow-y-auto rounded-lg border border-sidebar-border bg-sidebar px-6 pb-8 pt-7 text-sidebar-foreground shadow-xs"
        >
          <div className="mt-5 flex flex-col gap-4">
            <BookCover
              src={selectedDetails.cover}
              title={selectedDetails.title}
              sizes="144px"
              variant="detail"
              className="w-full shrink-0"
            />
            <div className=""></div>
            <div className="min-w-0 pt-1">
              <h2 className="text-xl leading-[1.1] tracking-[-0.035em]">
                {selectedDetails.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-sidebar-muted">
                {selectedDetails.author}
              </p>
            </div>
          </div>

          <div className="mt-7 border-t border-sidebar-border pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sidebar-muted">Reading progress</span>
              <span className="font-mono text-[11px] text-sidebar-foreground">
                {selectedProgress}%
              </span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-sidebar-foreground/8">
              <div
                className="h-full rounded-full bg-sidebar-foreground"
                style={{ width: `${selectedProgress}%` }}
              />
            </div>
          </div>

          <dl className="mt-6 text-sm leading-relaxed">
            <div className="border-t border-sidebar-border py-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">
                Last read
              </dt>
              <dd className="mt-1">11/7/2021 2:56:48 PM</dd>
            </div>
            <div className="border-t border-sidebar-border py-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">
                Date added
              </dt>
              <dd className="mt-1">11/7/2021 2:14:40 PM</dd>
            </div>
            <div className="border-t border-sidebar-border py-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">
                About this book
              </dt>
              <dd className="mt-1 text-sidebar-muted">
                The world’s first consulting detective investigates a variety of
                intriguing cases in the first Holmes short story collection.
              </dd>
            </div>
          </dl>

          <div className="mt-auto pt-7">
            <p className="rounded-md bg-sidebar-accent px-3 py-2 text-sm text-sidebar-muted">
              Fiction · Detective and mystery stories
            </p>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
