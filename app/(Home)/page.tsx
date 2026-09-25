"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Menu, Plus } from "lucide-react";
import { favourites, recentReads } from "./data";
import Link from "next/link";
import { useState } from "react";
import BookCover from "@/app/components/book-cover";

export default function Home() {
  const [hover, setHover] = useState(false);
  const [seeMoreHover, setSeeMoreHover] = useState(false);

  return (
    <main
      className="min-h-dvh bg-mono-100 text-mono-800"
      aria-label="Papyrbound home"
    >
      {/* <header className="flex h-12 items-center justify-between bg-mono-800 px-4 text-mono-50">
        <div className="flex items-center gap-5"><Menu aria-hidden="true" className="size-5" strokeWidth={1.5} /><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mono-300">Papyrbound reader</span></div>
        <button type="button" aria-label="Add a book" className="grid size-8 place-items-center transition-colors hover:bg-mono-700"><Plus aria-hidden="true" className="size-5" strokeWidth={1.5} /></button>
      </header> */}

      <div className="grid gap-20 px-8 pb-8 pt-6 xl:grid-cols-[1.25fr_0.75fr] xl:gap-26">
        <section className="flex min-h-[calc(100dvh-4rem)] flex-col">
          <h3 className="text-3xl">Recent Reads</h3>
          <div className="my-auto grid max-w-5xl grid-cols-4 grid-rows-2 gap-5 py-8">
            {recentReads.map((recentRead, i) => {
              return (
                <BookCover
                  key={recentRead.title}
                  src={recentRead.cover}
                  title={recentRead.title}
                  sizes="(max-width: 1280px) 25vw, 20vw"
                  variant="home"
                  preload={i === 0}
                  className={i === 0 ? "col-span-2 row-span-2" : ""}
                />
              );
            })}
          </div>

          <Link
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            href="/library"
            className="flex w-fit items-center  gap-2 text-2xl pb-12"
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
          <h3 className="text-3xl">Favourite Books</h3>
          <div className="my-auto grid max-w-85 grid-cols-2 gap-5 py-8">
            {favourites.map((favourite, i) => (
              <BookCover
                key={favourite.title}
                src={favourite.cover}
                title={favourite.title}
                sizes="(max-width: 1280px) 20vw, 16vw"
                variant="home"
              />
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
