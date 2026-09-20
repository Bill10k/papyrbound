"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { recentReads, favourites } from "../(Home)/data";

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
            <h1 className="text-2xl tracking-[-0.045em]">All books</h1>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-">09 books</span>
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
                <div className="relative aspect-2/3 overflow-hidden rounded-[5px] border-[3px] border-background bg-[#e4dccb] shadow-[0_5px_12px_rgba(42,37,26,0.28)]">
                  <Image src={book.cover} alt={`${book.title} cover`} fill sizes="(max-width: 640px) 42vw, (max-width: 1280px) 22vw, 180px" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                </div>
                <p className="mt-3 truncate text-sm">{book.title}</p>
                <p className="mt-1 truncate text-xs text-[#777063]">{book.author}</p>
              </motion.button>
            ))}
          </motion.div>
        </section>

        <motion.aside key={selectedBook} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="border-l border-[#bfb5a2] px-7 pb-12 pt-8 xl:px-8">
          <div className="flex gap-5">
            <div className="relative aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-[6px] border-[3px] border-[#fffdf6] bg-[#e4dccb] shadow-[0_5px_12px_rgba(42,37,26,0.3)]"><Image src={selectedDetails.cover} alt={`${selectedDetails.title} cover`} fill sizes="176px" className="object-cover" /></div>
            <div className="pt-1"><h2 className="max-w-[220px] text-xl leading-[1.1] tracking-[-0.035em]">{selectedDetails.title}</h2><p className="mt-2 text-sm">by<br />{selectedDetails.author}</p></div>
          </div>
          <dl className="mt-10 space-y-3 text-sm leading-relaxed">
            <div><dt className="inline font-semibold">Percentage read : </dt><dd className="inline">76 %</dd></div>
            <div><dt className="inline font-semibold">Date added : </dt><dd className="inline">11/7/2021 2:14:40 PM</dd></div>
            <div><dt className="inline font-semibold">Last read : </dt><dd className="inline">11/7/2021 2:56:48 PM</dd></div>
            <div><dt className="inline font-semibold">Word count : </dt><dd className="inline">101562</dd></div>
            <div><dt className="inline font-semibold">Line count : </dt><dd className="inline">6838</dd></div>
            <div><dt className="font-semibold">Description :</dt><dd className="mt-1">The world’s first consulting detective investigates a variety of intriguing cases in the first Holmes short story collection.</dd></div>
            <div><dt className="inline font-semibold">Language : </dt><dd className="inline">en-GB</dd></div>
            <div><dt className="inline font-semibold">Publisher : </dt><dd className="inline">Standard Ebooks</dd></div>
            <div><dt className="inline font-semibold">Genre : </dt><dd className="inline">Fiction, Detective and mystery stories</dd></div>
          </dl>
        </motion.aside>
      </div>
    </main>
  );
}
