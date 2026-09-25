"use client";

import { motion } from "framer-motion";
import { ChevronRight, Plus, BookOpen } from "lucide-react";
import { favourites as dummyFavourites, recentReads as dummyRecentReads } from "./data";
import Link from "next/link";
import { useState } from "react";
import BookCover from "@/app/components/book-cover";
import { useApp } from "../context/AppContext";

export default function Home() {
  const [hover, setHover] = useState(false);
  const [seeMoreHover, setSeeMoreHover] = useState(false);
  const { books, openBook, importNewBook, isImporting } = useApp();

  // Map real books if present, otherwise fallback to template demo covers
  const displayedReads =
    books.length > 0
      ? books.slice(0, 5).map((b) => ({
          id: b.id,
          title: b.title,
          cover: b.cover_image || "/covers/ashfall-01.webp",
          progress: b.progress_percent,
        }))
      : dummyRecentReads.map((d, i) => ({
          id: `dummy-${i}`,
          title: d.title,
          cover: d.cover,
          progress: d.progress,
        }));

  const displayedFavourites =
    books.length > 3
      ? books.slice(1, 5).map((b) => ({
          id: b.id,
          title: b.title,
          cover: b.cover_image || "/covers/ashfall-01.webp",
        }))
      : dummyFavourites.map((d, i) => ({
          id: `dummy-fav-${i}`,
          title: d.title,
          cover: d.cover,
        }));

  const handleBookClick = (bookId: string) => {
    if (bookId.startsWith("dummy-")) {
      // If clicking dummy placeholder, open file importer
      importNewBook();
    } else {
      openBook(bookId);
    }
  };

  return (
    <main
      className="min-h-dvh bg-mono-100 text-mono-800"
      aria-label="Papyrbound home"
    >
      <div className="grid gap-20 px-8 pb-8 pt-6 xl:grid-cols-[1.25fr_0.75fr] xl:gap-26">
        <section className="flex min-h-[calc(100dvh-4rem)] flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-serif">Recent Reads</h3>
            {books.length === 0 && (
              <button
                onClick={importNewBook}
                disabled={isImporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-mono-800 text-mono-50 hover:bg-mono-700 transition-colors cursor-pointer"
              >
                <Plus className="size-3.5" />
                Import Book
              </button>
            )}
          </div>

          <div className="my-auto grid max-w-5xl grid-cols-4 grid-rows-2 gap-5 py-8">
            {displayedReads.map((read, i) => {
              return (
                <div
                  key={read.id}
                  onClick={() => handleBookClick(read.id)}
                  className={`group cursor-pointer ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <BookCover
                    src={read.cover}
                    title={read.title}
                    sizes="(max-width: 1280px) 25vw, 20vw"
                    variant="home"
                    preload={i === 0}
                    className="h-full"
                  />
                  <div className="mt-1.5 px-0.5 truncate text-xs font-medium text-mono-700">
                    {read.title}
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            href="/library"
            className="flex w-fit items-center gap-2 text-2xl pb-12"
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

        <section className="flex min-h-[calc(100dvh-4rem)] flex-col">
          <h3 className="text-3xl font-serif">Favourite Books</h3>
          <div className="my-auto grid max-w-85 grid-cols-2 gap-5 py-8">
            {displayedFavourites.map((favourite) => (
              <div
                key={favourite.id}
                onClick={() => handleBookClick(favourite.id)}
                className="group cursor-pointer"
              >
                <BookCover
                  src={favourite.cover}
                  title={favourite.title}
                  sizes="(max-width: 1280px) 20vw, 16vw"
                  variant="home"
                />
                <div className="mt-1.5 px-0.5 truncate text-xs font-medium text-mono-700">
                  {favourite.title}
                </div>
              </div>
            ))}
          </div>
          <Link
            onMouseEnter={() => setSeeMoreHover(true)}
            onMouseLeave={() => setSeeMoreHover(false)}
            href="/library#favorites"
            className="mb-12 flex w-fit items-center gap-2 text-2xl"
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

