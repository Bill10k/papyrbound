"use client";

import { motion } from "framer-motion";
import { ChevronRight, Plus, BookOpen, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BookCover from "@/app/components/book-cover";
import { useApp } from "../context/AppContext";

export default function Home() {
  const [hover, setHover] = useState(false);
  const { books, openBook, importNewBook, isImporting } = useApp();

  return (
    <main
      className="min-h-dvh bg-mono-100 text-mono-800"
      aria-label="Papyrbound home"
    >
      <div className="max-w-7xl mx-auto px-8 pb-12 pt-8">
        {/* Recent Reads Section */}
        <section className="flex min-h-[calc(100dvh-6rem)] flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#d3c9b5]/60 pb-4">
              <div>
                <h2 className="text-3xl font-serif font-bold tracking-tight">Recent Reads</h2>
                <p className="text-xs text-mono-500 mt-1">Pick up where you left off or open a new volume.</p>
              </div>
              <button
                onClick={importNewBook}
                disabled={isImporting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-mono-800 text-mono-50 hover:bg-mono-700 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="size-3.5" />
                Import Book
              </button>
            </div>

            {books.length === 0 ? (
              <div className="my-24 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-mono-300/70 rounded-2xl p-8 bg-mono-50/50">
                <BookOpen className="size-12 text-mono-400 mb-3 stroke-[1.5]" />
                <h4 className="text-lg font-serif font-bold text-mono-800">No books opened yet</h4>
                <p className="text-xs text-mono-500 max-w-sm mt-1 mb-5">
                  Import an EPUB or Comic archive (CBZ / ZIP) to start building your personal library.
                </p>
                <button
                  onClick={importNewBook}
                  disabled={isImporting}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium bg-mono-800 text-mono-50 hover:bg-mono-700 shadow-sm cursor-pointer"
                >
                  Import EPUB or Manga
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-8">
                {books.map((book, i) => {
                  return (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      onClick={() => openBook(book.id)}
                      className="group cursor-pointer flex flex-col"
                    >
                      <BookCover
                        src={book.cover_image || "/covers/ashfall-01.webp"}
                        title={book.title}
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
                        variant="home"
                        preload={i < 3}
                        className="w-full aspect-[2/3] shadow-md group-hover:shadow-lg transition-shadow"
                      />
                      <div className="mt-2.5 px-0.5 truncate text-xs font-semibold text-mono-900 group-hover:text-amber-800 transition-colors">
                        {book.title}
                      </div>
                      <div className="text-[11px] text-mono-500 truncate">
                        {book.author || "Unknown Author"}
                      </div>
                      {book.progress_percent > 0 && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <div className="h-1 flex-1 bg-mono-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mono-700 rounded-full"
                              style={{ width: `${Math.min(100, Math.round(book.progress_percent))}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-mono-500">
                            {Math.round(book.progress_percent)}%
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#d3c9b5]/40">
            <Link
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              href="/library"
              className="flex w-fit items-center gap-2 text-2xl font-serif text-mono-900 hover:text-amber-800 transition-colors"
            >
              <span className="relative inline-block">
                Open Library
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
                <ChevronRight aria-hidden="true" className="mt-1.5" />
              </motion.span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}


