"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Book,
  BookCopy,
  Check,
  FolderPlus,
  Pencil,
  PlayingCards,
  PlayingCardsFan,
  RotateCcw,
  RotateCwClock,
  SquareLibrary,
  Trash2,
  X,
} from "lucide-react";
import BookCover from "@/app/components/book-cover";
import ContextMenu from "@/app/components/context-menu";
import DetailsSidebar from "@/app/components/details-sidebar";
import { favourites, recentReads } from "../(Home)/data";
import { initialCollections, type Collection } from "./data";
import { useApp } from "../context/AppContext";

type Dialog = "create" | "rename" | "delete" | null;

export default function CollectionsPage() {
  const { books, openBook } = useApp();
  const [customCollections, setCustomCollections] = useState<Collection[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const reduceMotion = useReducedMotion();

  // Dynamically generate collections from real books
  const dynamicCollections: Collection[] = books.length > 0 ? [
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
      description: "CBZ and ZIP graphic novels and Manga spreads.",
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
    {
      id: "completed",
      name: "Completed Books",
      description: "Finished titles and archives.",
      updated: "Updated recently",
      books: (books.filter((b) => b.progress_percent >= 99).length > 0
        ? books.filter((b) => b.progress_percent >= 99)
        : books
      ).map((b) => ({
        title: b.title,
        cover: b.cover_image || "/covers/ashfall-01.webp",
        author: b.author || "Unknown Author",
        progress: b.progress_percent,
      })),
    },
  ] : initialCollections;

  const collections: Collection[] = [...dynamicCollections, ...customCollections];

  const activeCollection = collections.find(
    (collection) => collection.id === activeCollectionId,
  );
  const selectedCollectionDetails = collections.find(
    (collection) => collection.id === selectedCollection,
  );

  const selectCollection = (collectionId: string) => {
    setSelectedCollection(collectionId);

    const url = new URL(window.location.href);
    url.searchParams.set("collection", collectionId);
    window.history.pushState({}, "", url);
  };

  const closeCollection = () => {
    setSelectedCollection(null);

    const url = new URL(window.location.href);
    url.searchParams.delete("collection");
    window.history.pushState({}, "", url);
  };

  useEffect(() => {
    const syncSelectedCollection = () => {
      const collectionId = new URLSearchParams(window.location.search).get("collection");
      setSelectedCollection(
        collectionId && collections.some((collection) => collection.id === collectionId)
          ? collectionId
          : null,
      );
    };

    syncSelectedCollection();
    window.addEventListener("popstate", syncSelectedCollection);
    return () => window.removeEventListener("popstate", syncSelectedCollection);
  }, [collections]);

  const openCreateDialog = () => {
    setCollectionName("");
    setActiveCollectionId(null);
    setDialog("create");
  };

  const openRenameDialog = (collection: Collection) => {
    setCollectionName(collection.name);
    setActiveCollectionId(collection.id);
    setDialog("rename");
  };

  const saveCollection = () => {
    const name = collectionName.trim();
    if (!name) return;

    if (dialog === "create") {
      const id = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setCustomCollections((current) => [
        {
          id: `${id}-${Date.now()}`,
          name,
          description: "A new place for the books you want to keep together.",
          updated: "Created just now",
          books: books.slice(0, 3).map((b) => ({
            title: b.title,
            cover: b.cover_image || "/covers/ashfall-01.webp",
            author: b.author || "Unknown Author",
            progress: b.progress_percent,
          })),
        },
        ...current,
      ]);
    }

    if (dialog === "rename" && activeCollectionId) {
      setCustomCollections((current) =>
        current.map((collection) =>
          collection.id === activeCollectionId
            ? { ...collection, name, updated: "Updated just now" }
            : collection,
        ),
      );
    }

    setDialog(null);
  };

  const deleteCollection = () => {
    if (!activeCollectionId) return;

    setCustomCollections((current) =>
      current.filter((collection) => collection.id !== activeCollectionId),
    );
    if (selectedCollection === activeCollectionId) {
      setSelectedCollection(null);
    }
    setDialog(null);
  };

  return (
    <main className="min-h-dvh bg-mono-100 px-7 pb-12 pt-16 text-mono-800 xl:px-8" aria-label="Collections">
      <div className="h-16" />
      <header className="mb-10 flex items-end justify-between border-b border-[#d3c9b5] pb-3">
        <div>
          <h1 className="mt-2 text-2xl tracking-[-0.045em]">Collections</h1>
        </div>
        <motion.button
          type="button"
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          onClick={openCreateDialog}
          className="inline-flex items-center gap-2 rounded-full bg-mono-800 px-4 py-2.5 text-sm text-mono-50 transition-colors hover:bg-mono-700"
        >
          <FolderPlus aria-hidden="true" className="size-4" strokeWidth={1.5} />
          New collection
        </motion.button>
      </header>

      <section aria-labelledby="collections-heading">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          initial="hidden"
          animate="show"
        >
          {collections.map((collection, index) => (
                  <motion.article
                    key={collection.id}
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
                    className={`group relative rounded-xl border p-4 shadow-md transition-colors ${
                      selectedCollection === collection.id
                        ? "border-mono-100 bg-mono-50"
                        : "border-sidebar-border bg-sidebar hover:border-mono-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectCollection(collection.id)}
                      className="w-full text-left"
                      aria-pressed={selectedCollection === collection.id}
                    >
                      <div className="grid h-44 grid-cols-3 gap-2 overflow-hidden rounded-lg p-2 bg-mono-150/40">
                        {collection.books.slice(0, 3).map((book) => (
                          <BookCover
                            key={book.title}
                            src={book.cover}
                            title={book.title}
                            sizes="(max-width: 640px) 28vw, (max-width: 1280px) 14vw, 120px"
                            className="h-full"
                            zoomOnHover={false}
                          />
                        ))}
                      </div>
                      <div className="mt-4 pr-9">
                        <h3 className="truncate text-lg tracking-[-0.035em]">{collection.name}</h3>
                        <p className="mt-1 truncate text-sm text-mono-600">{collection.description}</p>
                      </div>
                    </button>

                    <div className="mt-4 flex items-center justify-between border-t border-sidebar-border pt-3 text-xs text-mono-600">
                      <div className="flex items-center text-[10px] gap-2 bg-primary-foreground rounded-full px-2 py-1 text-mono-700">
                        <BookCopy  size="12" />
                        <span>{collection.books.length}</span>
                      </div>
                      <div className="flex items-center text-[10px] gap-2 bg-primary-foreground rounded-full px-2 py-1 text-mono-700">
                        <RotateCwClock  size="12" />
                        <span>{collection.books.length} days ago</span>
                      </div>
                    </div>

                    <div className="absolute right-3 top-3">
                      <ContextMenu
                        ariaLabel={`Actions for ${collection.name}`}
                        menuId={`collection-actions-${collection.id}`}
                        open={activeMenu === collection.id}
                        onOpenChange={(open) => setActiveMenu(open ? collection.id : null)}
                        alignmentClassName="right-0"
                        items={[
                          {
                            label: "Open collection",
                            icon: <BookCopy aria-hidden="true" className="size-4 text-sidebar-muted" strokeWidth={1.5} />,
                            onSelect: () => selectCollection(collection.id),
                          },
                          {
                            label: "Rename collection",
                            icon: <Pencil aria-hidden="true" className="size-4 text-sidebar-muted" strokeWidth={1.5} />,
                            onSelect: () => openRenameDialog(collection),
                          },
                          {
                            label: "Delete collection",
                            icon: <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.5} />,
                            onSelect: () => {
                              setActiveCollectionId(collection.id);
                              setDialog("delete");
                            },
                            destructive: true,
                            dividerBefore: true,
                          },
                        ]}
                      />
                    </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <AnimatePresence>
        {selectedCollectionDetails && (
          <DetailsSidebar
            contentKey={selectedCollectionDetails.id}
            ariaLabel={`${selectedCollectionDetails.name} details`}
            variant="overlay"
            reduceMotion={reduceMotion}
            className="shadow-[0_18px_44px_rgba(42,37,26,0.16)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-muted">Collection</p>
                <h2 className="mt-2 text-xl leading-[1.1] tracking-[-0.035em]">{selectedCollectionDetails.name}</h2>
              </div>
              <motion.button
                type="button"
                aria-label="Close collection"
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                onClick={closeCollection}
                className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar-accent text-mono-700 transition-colors hover:bg-mono-200"
              >
                <X aria-hidden="true" className="size-4" strokeWidth={1.5} />
              </motion.button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-sidebar-muted">{selectedCollectionDetails.description}</p>

            <div className="mt-6 flex items-center justify-between border-y border-sidebar-border py-4 text-sm">
              <span className="text-sidebar-muted">Books</span>
              <span className="font-mono text-[11px] text-sidebar-foreground">{selectedCollectionDetails.books.length}</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {selectedCollectionDetails.books.map((book) => {
                const matched = books.find((b) => b.title.toLowerCase() === book.title.toLowerCase());
                return (
                  <div
                    key={book.title}
                    onClick={() => {
                      if (matched) {
                        openBook(matched.id);
                      } else if (books.length > 0) {
                        openBook(books[0].id);
                      }
                    }}
                    className="cursor-pointer group"
                  >
                    <BookCover
                      src={matched?.cover_image || book.cover}
                      title={book.title}
                      sizes="96px"
                      className="h-36"
                      zoomOnHover={true}
                    />
                  </div>
                );
              })}
            </div>

            <dl className="mt-7 text-sm leading-relaxed">
              <div className="border-t border-sidebar-border py-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">Last updated</dt>
                <dd className="mt-1">{selectedCollectionDetails.updated.replace("Updated ", "")}</dd>
              </div>
              <div className="border-t border-sidebar-border py-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">Description</dt>
                <dd className="mt-1 text-sidebar-muted">{selectedCollectionDetails.description}</dd>
              </div>
            </dl>
          </DetailsSidebar>
        )}

        {dialog && (
          <>
            <motion.button
              type="button"
              aria-label="Close dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDialog(null)}
              className="fixed inset-0 z-40 cursor-default bg-mono-950/20 backdrop-blur-xs"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="collection-dialog-title"
              initial={reduceMotion ? false : { y: 20, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: 10, opacity: 0, scale: 0.96 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sidebar-border bg-background p-6 text-mono-800 shadow-[0_18px_44px_rgba(42,37,26,0.16)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  {/* <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mono-600">Collections</p> */}
                  <h2 id="collection-dialog-title" className="mt-1 text-xl tracking-[-0.035em]">
                    {dialog === "create" ? "New collection" : dialog === "rename" ? "Rename collection" : "Delete collection"}
                  </h2>
                </div>
                <motion.button
                  type="button"
                  aria-label="Close dialog"
                  whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                  onClick={() => setDialog(null)}
                  className="grid size-8 place-items-center rounded-full bg-sidebar-accent text-mono-700 transition-colors hover:bg-mono-200"
                >
                  <X aria-hidden="true" className="size-4" strokeWidth={1.5} />
                </motion.button>
              </div>

              {dialog === "delete" ? (
                <>
                  <p className="text-sm leading-relaxed text-mono-600">
                    Delete <span className="font-medium text-mono-800">{activeCollection?.name}</span>? This collection will be removed, but its books will stay in your library.
                  </p>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setDialog(null)} className="rounded-full px-4 py-2.5 text-sm text-mono-600 hover:bg-sidebar-accent">
                      Cancel
                    </button>
                    <motion.button type="button" whileTap={reduceMotion ? undefined : { scale: 0.96 }} onClick={deleteCollection} className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2.5 text-sm text-destructive-foreground hover:bg-destructive/90">
                      <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.5} />
                      Delete
                    </motion.button>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveCollection();
                  }}
                >
                  <label htmlFor="collection-name" className="text-sm text-mono-700">Collection name</label>
                  <input
                    id="collection-name"
                    autoFocus
                    value={collectionName}
                    onChange={(event) => setCollectionName(event.target.value)}
                    placeholder="e.g. Want to read"
                    className="mt-2 w-full rounded-xl border border-sidebar-border bg-sidebar-accent/50 px-3 py-3 text-sm outline-none transition-colors placeholder:text-mono-500 focus:border-mono-400"
                  />
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setDialog(null)} className="rounded-full px-4 py-2.5 text-sm text-mono-600 hover:bg-sidebar-accent">
                      Cancel
                    </button>
                    <motion.button type="submit" whileTap={reduceMotion ? undefined : { scale: 0.96 }} className="inline-flex items-center gap-2 rounded-full bg-mono-800 px-4 py-2.5 text-sm text-mono-50 hover:bg-mono-700">
                      {dialog === "create" ? <FolderPlus aria-hidden="true" className="size-4" strokeWidth={1.5} /> : <Check aria-hidden="true" className="size-4" strokeWidth={1.5} />}
                      {dialog === "create" ? "Create collection" : "Save changes"}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
