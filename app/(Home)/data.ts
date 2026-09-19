export const recentReads = [
  { title: "Ashfall", author: "Mina Osei", cover: "/covers/ashfall-01.webp", featured: true },
  { title: "The Odyssey", author: "Homer", cover: "/covers/glass-garden-01.webp" },
  { title: "A New Garden", author: "R. Ito", cover: "/covers/red-kites-01.webp" },
  { title: "Night Signal", author: "Eli Navarro", cover: "/covers/night-signal-01.webp" },
  { title: "Bedtime Stories", author: "Uncle Amon", cover: "/covers/room-193-01.webp" },
];

export const favourites = [
  { title: "Glass Garden", author: "R. Ito", cover: "/covers/glass-garden-01.webp" },
  { title: "Tidebound", author: "Mina Osei", cover: "/covers/tidebound-01.webp" },
  { title: "Red Kites", author: "Eli Navarro", cover: "/covers/red-kites-01.webp" },
];



  {/* <section aria-labelledby="recent-heading">
          <motion.h1 variants={fadeUp} custom={0} id="recent-heading" className="mb-8 text-[clamp(1.75rem,2.5vw,2.5rem)] tracking-[-0.055em]">Recent Reads</motion.h1>
          <div className="grid grid-cols-3 gap-5">
            {recentReads.map((book, index) => (
              <motion.article key={book.title} variants={fadeUp} custom={index + 1} whileHover={{ y: -4 }} transition={{ duration: 0.22, ease: "easeOut" }} className={book.featured ? "group row-span-2" : "group"}>
                <div className={`relative overflow-hidden rounded-md border-2 border-mono-50 bg-mono-200 shadow-md ${book.featured ? "aspect-[3/4]" : "aspect-[3/4]"}`}><Image src={book.cover} alt={`${book.title} cover`} fill sizes="(max-width: 1280px) 25vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-x-0 bottom-0 bg-mono-900/80 px-3 py-2 text-mono-50"><p className="text-sm leading-tight">{book.title}</p><p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-mono-300">{book.author}</p></div></div>
              </motion.article>
            ))}
          </div>
          <motion.a variants={fadeUp} custom={6} href="/library" className="mt-16 inline-flex items-center gap-2 text-xl tracking-[-0.04em] transition-colors hover:text-mono-500">Open Library <ArrowRight aria-hidden="true" className="size-5" strokeWidth={1.5} /></motion.a>
        </section> */}


        //  <section aria-labelledby="favourites-heading" className="xl:pl-4">
        //   <motion.h2 variants={fadeUp} custom={1} id="favourites-heading" className="mb-8 text-[clamp(1.75rem,2.5vw,2.5rem)] tracking-[-0.055em]">Favourite Books</motion.h2>
        //   <div className="grid max-w-xl grid-cols-2 gap-5">
        //     {favourites.map((book, index) => (
        //       <motion.article key={book.title} variants={fadeUp} custom={index + 2} whileHover={{ y: -4 }} transition={{ duration: 0.22, ease: "easeOut" }} className="group">
        //         <div className="relative aspect-[3/4] overflow-hidden rounded-md border-2 border-mono-50 bg-mono-200 shadow-md"><Image src={book.cover} alt={`${book.title} cover`} fill sizes="(max-width: 1280px) 20vw, 16vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /><div className="absolute inset-x-0 bottom-0 bg-mono-900/80 px-3 py-2 text-mono-50"><p className="text-sm leading-tight">{book.title}</p><p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-mono-300">{book.author}</p></div></div>
        //       </motion.article>
        //     ))}
        //   </div>
        //   <motion.a variants={fadeUp} custom={6} href="/library#favorites" className="mt-16 inline-flex items-center gap-2 text-xl tracking-[-0.04em] transition-colors hover:text-mono-500">See more <ArrowRight aria-hidden="true" className="size-5" strokeWidth={1.5} /></motion.a>
        // </section>