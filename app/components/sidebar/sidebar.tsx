"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  Asterisk,
  // EllipsisVertical,
  House,
  LibraryBig,
  Settings,
  BookCopy,
  type LucideIcon,
} from "lucide-react";
import { links, type SidebarLinkName } from "./links";

const navIcons: Record<SidebarLinkName, LucideIcon> = {
  Home: House,
  Library: LibraryBig,
  Collection: BookCopy,
  Settings,
};

export default function Sidebar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 };

  return (
    <aside className="sticky top-1 flex h-[calc(100dvh-0.5rem)] w-70 flex-col overflow-hidden rounded-lg border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
      <header className="flex items-center justify-between px-6 pb-8 pt-7">
        <Link href="/" className="text-xl font-medium uppercase tracking-[-0.08em]" aria-label="Papyrbound home">
          Papyrbound
        </Link>
        <motion.button
          type="button"
          aria-label="Add a book"
          className="grid size-9 place-items-center rounded-md text-sidebar-foreground transition-colors duration-(--duration-fast) hover:bg-sidebar-accent"
          whileHover={reduceMotion ? undefined : { rotate: 45, scale: 1.04 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          transition={spring}
        >
          <Asterisk aria-hidden="true" className="size-6" strokeWidth={1.5} />
        </motion.button>
      </header>

      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3">
        {/* <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-muted">Workspace</p> */}
        <LayoutGroup id="sidebar-navigation">
          <div className="space-y-1">
            {links.map((link) => {
              const active = link.path === "/" ? pathname === "/" : pathname.startsWith(link.path);
              const Icon = navIcons[link.name];

              return (
                <motion.div
                  key={link.path}
                  layout="position"
                  transition={{ layout: spring }}
                >
                  <motion.div
                    whileHover={reduceMotion ? undefined : { x: 2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    transition={spring}
                  >
                    <Link
                      href={link.path}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex h-11 items-center gap-3 overflow-hidden rounded-md px-3 text-base transition-colors duration-(--duration-fast) ${
                        active
                          ? "font-medium text-sidebar-foreground"
                          : "text-sidebar-muted hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-item"
                          className="absolute inset-0 bg-sidebar-accent"
                          transition={spring}
                        />
                      )}
                      <Icon aria-hidden="true" className="relative z-10 size-4.5 shrink-0" strokeWidth={1.5} />
                      <span className="relative z-10">{link.name}</span>
                      {link.name === "Library" && (
                        <span className="relative z-10 ml-auto rounded-full bg-sidebar-foreground/8 px-2 py-0.5 font-mono text-[10px] text-sidebar-muted">
                          24
                        </span>
                      )}
                    </Link>
                  </motion.div>

                      {/* filter section */}
                  <AnimatePresence initial={false}>
                    {link.name === "Library" && active && (
                      <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="ml-5.25 mt-4 border-l border-sidebar-border pb-4 pl-6">
                          <Link href="/library" className=" rounded-full bg-sidebar-accent px-3 py-1.5 text-xs text-sidebar-foreground">
                            All books
                          </Link>
                          <Link href="/library#favorites" className="mt-1 block px-3 py-1.5 text-xs text-sidebar-muted transition-colors hover:text-sidebar-foreground">
                            Favorites
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </LayoutGroup>

        {/* <div className="mx-3 my-5 border-t border-sidebar-border" />

        <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-muted">Collections</p>
        <div className="space-y-1">
          {shelves.map((shelf, index) => (
            <Link
              key={shelf.name}
              href={`/library#shelf-${index + 1}`}
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
            >
              <shelf.icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.5} />
              {shelf.name}
            </Link>
          ))}
        </div> */}
      </nav>

      {/* <footer className="m-3 flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-sidebar-accent">
        <span className="grid size-8 place-items-center rounded-full bg-sidebar-foreground text-xs font-semibold text-sidebar">
          J
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Joshua&apos;s library</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-sidebar-muted">Stored locally</p>
        </div>
        <EllipsisVertical aria-hidden="true" className="size-4 text-sidebar-muted" strokeWidth={1.5} />
      </footer> */}
    </aside>
  );
}
