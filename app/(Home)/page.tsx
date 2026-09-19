"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Menu, Plus } from "lucide-react";
import { favourites, recentReads } from "./data";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [hover, setHover] = useState(false);

  return (
    <main
      className="min-h-dvh bg-mono-100 text-mono-800"
      aria-label="Papyrbound home"
    >
      {/* <header className="flex h-12 items-center justify-between bg-mono-800 px-4 text-mono-50">
        <div className="flex items-center gap-5"><Menu aria-hidden="true" className="size-5" strokeWidth={1.5} /><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mono-300">Papyrbound reader</span></div>
        <button type="button" aria-label="Add a book" className="grid size-8 place-items-center transition-colors hover:bg-mono-700"><Plus aria-hidden="true" className="size-5" strokeWidth={1.5} /></button>
      </header> */}

      <div className="grid gap-12 px-8 pb-8 pt-6 xl:grid-cols-[1.25fr_0.75fr] xl:gap-20">
        <section className="flex min-h-[calc(100dvh-4rem)] flex-col">
          <h3 className="text-3xl">Recent Reads</h3>
          <div className="my-auto grid max-w-5xl grid-cols-4 grid-rows-2 gap-7 py-8">
            {recentReads.map((recentRead, i) => {
              return (
                <div
                  className={`relative aspect-3/4 rounded-md shadow-xl overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                  key={i}
                >
                  <Image
                    src={recentRead.cover}
                    alt={recentRead.title}
                    fill
                    objectFit="cover"
                    objectPosition="center"
                  />
                </div>
              );
            })}
          </div>

          <Link
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            href="/library"
            className="flex w-fit items-center  gap-2 text-2xl pb-12"
          >
            Open Library
            <motion.span
              animate={{ x: hover ? 3 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-flex"
            >
              <ChevronRight aria-hidden="true" className="mt-1.5" />
            </motion.span>
          </Link>
        </section>

        <section className="bg-blue-300 w-full"></section>
      </div>
    </main>
  );
}
