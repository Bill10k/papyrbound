"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import BookCover from "@/app/components/book-cover";
import ContextMenu from "@/app/components/context-menu";
import DetailsSidebar from "@/app/components/details-sidebar";
import { BookOpen, Check, Eye, Heart, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function LibraryPage() {
  const { books, openBook, deleteBookById, importNewBook, isImporting } = useApp();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const activeId = selectedBookId || (books.length > 0 ? books[0].id : null);
  const selectedDetails = books.find((b) => b.id === activeId) ?? books[0];

  return (
    <main
      className="min-h-dvh overflow-hidden text-[#24231f]"
      aria-label="Library"
    >
      <div className="grid min-h-dvh grid-cols-[minmax(0,1fr)_minmax(320px,0.36fr)]">
        <section className="min-w-0 px-7 pb-12 pt-16 xl:px-8">
          <div className="h-4" />
          <div className="mb-5 flex items-end justify-between border-b border-[#d3c9b5] pb-3">
            <span className="flex items-center gap-2 text-2xl tracking-[-0.045em] font-serif">
              <h1 className="font-bold">All books</h1>
              <span className="text-base font-mono text-sidebar-muted">({books.length})</span>
            </span>
            <button
              onClick={importNewBook}
              disabled={isImporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-mono-800 text-mono-50 hover:bg-mono-700 transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
              Import Book
            </button>
          </div>

          {books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-mono-200 flex items-center justify-center text-mono-600 mb-4">
                <BookOpen className="size-8" />
              </div>
              <h2 className="text-xl font-serif font-bold text-mono-800">Your library is empty</h2>
              <p className="text-sm text-mono-500 max-w-sm mt-1 mb-6">
                Import your favorite EPUB books or CBZ / ZIP comic volumes to begin reading.
              </p>
              <button
                onClick={importNewBook}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-mono-800 text-mono-50 hover:bg-mono-700 shadow-sm cursor-pointer"
              >
                <Plus className="size-4" />
                Select File to Import
              </button>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 xl:grid-cols-5"
              initial="hidden"
              animate="show"
            >
              {books.map((book, index) => {
                const progress = Math.round(book.progress_percent || 0);

                return (
                  <motion.article
                    key={book.id}
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
                      onClick={() => {
                        setSelectedBookId(book.id);
                      }}
                      onDoubleClick={() => openBook(book.id)}
                      className="group block w-full text-left cursor-pointer"
                      aria-label={`View details for ${book.title}`}
                    >
                      <BookCover
                        src={book.cover_image || "/covers/ashfall-01.webp"}
                        title={book.title}
                        sizes="(max-width: 640px) 42vw, (max-width: 1280px) 22vw, 180px"
                      />
                    </motion.button>
                    <div className="mt-2 text-xs font-semibold truncate text-mono-900">
                      {book.title}
                    </div>
                    <div className="text-[11px] text-mono-500 truncate">
                      {book.author || "Unknown Author"}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sidebar-muted">
                      <div className="inline-block rounded-full text-[10px]">
                        {progress === 0 ? (
                          <span className="border rounded-full text-mono-600 px-1.5 py-0.5 text-[9px] bg-mono-200/60">
                            New
                          </span>
                        ) : progress >= 99 ? (
                          <span className="text-emerald-700 font-medium">Finished</span>
                        ) : (
                          <span className="font-mono">{progress}%</span>
                        )}
                      </div>

                      <ContextMenu
                        ariaLabel={`Actions for ${book.title}`}
                        menuId={`book-actions-${index}`}
                        open={activeMenu === book.id}
                        onOpenChange={(open) => setActiveMenu(open ? book.id : null)}
                        alignmentClassName={index % 2 === 0 ? "left-0 right-auto" : "left-auto right-0"}
                        items={[
                          {
                            label: "Read Book",
                            icon: <BookOpen aria-hidden="true" className="size-4 text-sidebar-muted" strokeWidth={1.5} />,
                            onSelect: () => openBook(book.id),
                          },
                          {
                            label: "View details",
                            icon: <Eye aria-hidden="true" className="size-4 text-sidebar-muted" strokeWidth={1.5} />,
                            onSelect: () => setSelectedBookId(book.id),
                          },
                          {
                            label: "Delete",
                            icon: <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.5} />,
                            onSelect: () => deleteBookById(book.id),
                            destructive: true,
                            dividerBefore: true,
                          },
                        ]}
                      />
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </section>

        {selectedDetails && (
          <DetailsSidebar contentKey={selectedDetails.id} ariaLabel={`${selectedDetails.title} details`}>
            <div className="mt-5 flex flex-col gap-4">
              <BookCover
                src={selectedDetails.cover_image || "/covers/ashfall-01.webp"}
                title={selectedDetails.title}
                sizes="144px"
                variant="detail"
                className="w-full shrink-0"
              />
              <div className="min-w-0 pt-1">
                <h2 className="text-xl font-serif font-bold leading-[1.15] tracking-[-0.035em]">
                  {selectedDetails.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-sidebar-muted">
                  {selectedDetails.author || "Unknown Author"}
                </p>
              </div>

              {/* Read Now Button */}
              <button
                onClick={() => openBook(selectedDetails.id)}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-mono-800 text-mono-50 hover:bg-mono-700 font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <BookOpen className="size-4" />
                Read Volume
              </button>
            </div>

            <div className="mt-6 border-t border-sidebar-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-sidebar-muted">Reading progress</span>
                <span className="font-mono text-[11px] font-semibold text-sidebar-foreground">
                  {Math.round(selectedDetails.progress_percent || 0)}%
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sidebar-foreground/8">
                <div
                  className="h-full rounded-full bg-sidebar-foreground transition-all duration-300"
                  style={{ width: `${Math.min(100, selectedDetails.progress_percent || 0)}%` }}
                />
              </div>
            </div>

            <dl className="mt-5 text-sm leading-relaxed">
              <div className="border-t border-sidebar-border py-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">
                  Chapters / Pages
                </dt>
                <dd className="mt-1 font-mono text-xs">
                  {selectedDetails.current_chapter + 1} of {selectedDetails.total_chapters || 1}
                </dd>
              </div>
              <div className="border-t border-sidebar-border py-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">
                  Format / File
                </dt>
                <dd className="mt-1 font-mono text-xs truncate text-sidebar-muted">
                  {selectedDetails.file_path.split(/[\\/]/).pop()}
                </dd>
              </div>
              <div className="border-t border-sidebar-border py-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">
                  Date Added
                </dt>
                <dd className="mt-1 text-xs text-sidebar-muted">
                  {new Date(selectedDetails.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </DetailsSidebar>
        )}
      </div>
    </main>
  );
}

