"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
import {
  addButtonVariants,
  dropdownItemVariants,
  dropdownVariants,
  navigationItemVariants,
  sidebarLayoutTransition,
  sidebarSpring,
} from "./animations";

const navIcons: Record<SidebarLinkName, LucideIcon> = {
  Home: House,
  Library: LibraryBig,
  Collection: BookCopy,
  Settings,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const reduceMotion = useReducedMotion();
  const spring = reduceMotion ? { duration: 0 } : sidebarSpring;

  return (
    <aside className="sticky top-1 flex h-[calc(100dvh-0.5rem)] w-70 flex-col overflow-hidden rounded-lg border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xs">
      <header className="flex items-center justify-between px-6 pb-8 pt-7">
        <Link href="/" className="text-xl font-medium uppercase tracking-[-0.08em]" aria-label="Papyrbound home">
          Papyrbound
        </Link>
        <motion.button
          type="button"
          aria-label="Add a book"
          className="grid size-9 place-items-center rounded-md text-sidebar-foreground transition-colors duration-(--duration-fast) hover:bg-sidebar-accent"
          variants={addButtonVariants}
          whileHover={reduceMotion ? undefined : "hover"}
          whileTap={reduceMotion ? undefined : "tap"}
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
              const libraryOpen = link.name === "Library" && active && !libraryCollapsed;
              const Icon = navIcons[link.name];

              return (
                <motion.div
                  key={link.path}
                  layout={link.name === "Library" ? false : "position"}
                  transition={
                    link.name === "Library"
                      ? undefined
                      : { layout: reduceMotion ? { duration: 0 } : sidebarLayoutTransition }
                  }
                  className="relative"
                >
                  <motion.div
                    variants={navigationItemVariants}
                    whileHover={reduceMotion ? undefined : "hover"}
                    whileTap={reduceMotion ? undefined : "tap"}
                    transition={spring}
                  >
                    <Link
                      href={link.path}
                      aria-current={active ? "page" : undefined}
                      aria-expanded={link.name === "Library" ? libraryOpen : undefined}
                      aria-controls={link.name === "Library" ? "library-filters" : undefined}
                      onClick={() => {
                        if (link.name === "Library") {
                          setLibraryCollapsed(active ? !libraryCollapsed : false);
                        }
                      }}
                      className={`group relative flex h-11 items-center gap-3 overflow-hidden rounded-md px-3 text-base transition-colors duration-(--duration-fast) ${
                        active
                          ? "font-medium text-sidebar-foreground"
                          : "text-sidebar-muted hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-0 bg-sidebar-accent" />
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

                  {/* Library filters */}
                  <AnimatePresence initial={false} mode="popLayout">
                    {libraryOpen && (
                      <motion.div
                        id="library-filters"
                        initial={reduceMotion ? false : "close"}
                        animate="open"
                        exit={reduceMotion ? undefined : "close"}
                        variants={dropdownVariants}
                      >
                        <div className="ml-5.25 mt-2 border-l border-sidebar-border pb-4 pl-6">
                          <motion.div variants={dropdownItemVariants}>
                            <Link href="/library" className="rounded-full bg-sidebar-accent px-3 py-1.5 text-xs text-sidebar-foreground">
                              All
                            </Link>
                          </motion.div>
                          <motion.div variants={dropdownItemVariants}>
                            <Link href="/library#favorites" className="mt-1 block px-3 py-1.5 text-xs text-sidebar-muted transition-colors hover:text-sidebar-foreground">
                              Favorites
                            </Link>
                          </motion.div>
                          <motion.div variants={dropdownItemVariants}>
                            <Link href="/library#authors" className="mt-1 block px-3 py-1.5 text-xs text-sidebar-muted transition-colors hover:text-sidebar-foreground">
                              Authors
                            </Link>
                          </motion.div>
                          <motion.div variants={dropdownItemVariants}>
                            <Link href="/library#finished" className="mt-1 block px-3 py-1.5 text-xs text-sidebar-muted transition-colors hover:text-sidebar-foreground">
                              Finished
                            </Link>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </LayoutGroup>
      </nav>
    </aside>
  );
}
