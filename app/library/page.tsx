"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { recentReads, favourites } from "../(Home)/data";
import BookCover from "@/app/components/book-cover";

const shelfBooks = [
  { ...favourites[0], title: "A Passage to India", author: "E. M. Forster" },
  { ...recentReads[2], title: "From the Earth to the Moon", author: "Jules Verne" },
  { ...recentReads[0], title: "Indian Fairy Tales", author: "Joseph Jacobs" },
  { ...favourites[2], title: "On a Chinese Screen", author: "W. Somerset Maugham" },
  { ...recentReads[3], title: "Short Fiction", author: "Ray Bradbury" },
  { ...recentReads[1], title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle" },
  { ...favourites[1], title: "The Gambler", author: "Fyodor Dostoevsky" },
  { ...favourites[0], title: "The Jungle Book", author: "Rudyard Kipling" },
  { ...recentReads[1], title: "The Odyssey", author: "Homer" },
];

const details = shelfBooks[5];

export default function LibraryPage() {
  const [selectedBook, setSelectedBook] = useState(details.title);
  const selectedDetails = shelfBooks.find((book) => book.title === selectedBook) ?? details;

  return (
    <main className="min-h-dvh overflow-hidden text-[#24231f]" aria-label="Library">
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

          <motion.div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 xl:grid-cols-5" initial="hidden" animate="show">
            {shelfBooks.map((book, index) => (
              <motion.button
                type="button"
                key={`${book.title}-${index}`}
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { delay: index * 0.045, duration: 0.35, ease: [0.22, 1, 0.36, 1] } } }}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedBook(book.title)}
                className="group text-left"
              >
                <BookCover
                  src={book.cover}
                  title={book.title}
                  sizes="(max-width: 640px) 42vw, (max-width: 1280px) 22vw, 180px"
                />
                <p className="mt-3 truncate text-sm">{book.title}</p>
                <p className="mt-1 truncate text-xs text-[#777063]">{book.author}</p>
              </motion.button>
            ))}
          </motion.div>
        </section>

        <motion.aside
          key={selectedBook}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-1 m-1 flex h-[calc(100dvh-0.5rem)] min-w-0 flex-col overflow-y-auto rounded-lg border border-sidebar-border bg-sidebar px-6 pb-8 pt-7 text-sidebar-foreground shadow-xs"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-muted">
            Book details
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <BookCover
              src={selectedDetails.cover}
              title={selectedDetails.title}
              sizes="144px"
              variant="detail"
              className="w-full shrink-0"
            />
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
              <span className="font-mono text-[11px] text-sidebar-foreground">76%</span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-sidebar-foreground/8">
              <div className="h-full w-[76%] rounded-full bg-sidebar-foreground" />
            </div>
          </div>

          <dl className="mt-6 text-sm leading-relaxed">
            <div className="border-t border-sidebar-border py-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">Last read</dt>
              <dd className="mt-1">11/7/2021 2:56:48 PM</dd>
            </div>
            <div className="border-t border-sidebar-border py-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">Date added</dt>
              <dd className="mt-1">11/7/2021 2:14:40 PM</dd>
            </div>
            <div className="border-t border-sidebar-border py-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-muted">About this book</dt>
              <dd className="mt-1 text-sidebar-muted">The world’s first consulting detective investigates a variety of intriguing cases in the first Holmes short story collection.</dd>
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
