"use client";

import { motion } from "framer-motion";
import { ChevronRight, Plus, BookOpen, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BookCover from "@/app/components/book-cover";
import { useApp } from "../context/AppContext";

export default function Home() {
  const [hover, setHover] = useState(false);
  const [seeMoreHover, setSeeMoreHover] = useState(false);
  const { books, openBook, importNewBook, isImporting } = useApp();

  return (
    <main
      className="min-h-dvh bg-mono-100 text-mono-800"
      aria-label="Papyrbound home"
    >
      <div className="grid gap-20 px-8 pb-8 pt-6 xl:grid-cols-[1.25fr_0.75fr] xl:gap-26">
        {/* Recent Reads Section */}
        <section className="flex min-h-[calc(100dvh-4rem)] flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-serif font-bold">Recent Reads</h3>
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
            <div className="my-auto flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-mono-300/70 rounded-2xl p-8 bg-mono-50/50">
              <BookOpen className="size-10 text-mono-400 mb-3" />
              <h4 className="text-lg font-serif font-bold text-mono-800">No books opened yet</h4>
              <p className="text-xs text-mono-500 max-w-xs mt-1 mb-4">
                Import an EPUB or Comic archive to start building your library.
              </p>
              <button
                onClick={importNewBook}
                disabled={isImporting}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-mono-800 text-mono-50 hover:bg-mono-700 shadow-sm cursor-pointer"
              >
                Import EPUB or Manga
              </button>
            </div>
          ) : (
            <div className="my-auto grid max-w-5xl grid-cols-2 sm:grid-cols-4 gap-5 py-8">
              {books.slice(0, 5).map((book, i) => {
                const isHero = i === 0 && books.length > 1;
                return (
                  <div
                    key={book.id}
                    onClick={() => openBook(book.id)}
                    className={`group cursor-pointer flex flex-col ${
                      isHero ? "col-span-2 row-span-2" : ""
                    }`}
                  >
                    <BookCover
                      src={book.cover_image || "/covers/ashfall-01.webp"}
                      title={book.title}
                      sizes="(max-width: 1280px) 25vw, 20vw"
                      variant="home"
                      preload={i === 0}
                      className="w-full flex-1"
                    />
                    <div className="mt-2 px-0.5 truncate text-xs font-semibold text-mono-900 group-hover:text-amber-800 transition-colors">
                      {book.title}
                    </div>
                    <div className="text-[10px] text-mono-500 truncate">
                      {book.author || "Unknown Author"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            href="/library"
            className="flex w-fit items-center gap-2 text-2xl pb-12 font-serif"
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
        </section>

        {/* Favourite / Active Books Section */}
        <section className="flex min-h-[calc(100dvh-4rem)] flex-col">
          <h3 className="text-3xl font-serif font-bold">Favourite Books</h3>

          {books.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-mono-300/70 rounded-2xl p-8 bg-mono-50/50">
              <Heart className="size-8 text-mono-400 mb-2" />
              <p className="text-xs text-mono-500">Your favorite titles will appear here.</p>
            </div>
          ) : (
            <div className="my-auto grid max-w-85 grid-cols-2 gap-5 py-8">
              {books.slice(0, 4).map((book) => (
                <div
                  key={`fav-${book.id}`}
                  onClick={() => openBook(book.id)}
                  className="group cursor-pointer flex flex-col"
                >
                  <BookCover
                    src={book.cover_image || "/covers/ashfall-01.webp"}
                    title={book.title}
                    sizes="(max-width: 1280px) 20vw, 16vw"
                    variant="home"
                  />
                  <div className="mt-2 px-0.5 truncate text-xs font-semibold text-mono-900 group-hover:text-amber-800 transition-colors">
                    {book.title}
                  </div>
                  <div className="text-[10px] text-mono-500 truncate">
                    {book.author || "Unknown Author"}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            onMouseEnter={() => setSeeMoreHover(true)}
            onMouseLeave={() => setSeeMoreHover(false)}
            href="/library"
            className="mb-12 flex w-fit items-center gap-2 text-2xl font-serif"
          >
            <span className="relative inline-block">
              See more
              <motion.span
                animate={{ width: seeMoreHover ? "100%" : "0%" }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 h-px bg-current"
              />
            </span>
            <motion.span
              animate={{ x: seeMoreHover ? 3 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-flex"
            >
              <ChevronRight aria-hidden="true" className="mt-1.5" />
            </motion.span>
          </Link>
        </section>
      </div>
    </main>
  );
}


