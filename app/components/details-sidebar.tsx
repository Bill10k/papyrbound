import type { ReactNode } from "react";
import { motion } from "framer-motion";

type DetailsSidebarProps = {
  children: ReactNode;
  ariaLabel: string;
  contentKey?: string;
  variant?: "inline" | "overlay";
  reduceMotion?: boolean | null;
  className?: string;
};

const sidebarClasses = {
  inline: "sticky top-1 m-1 min-w-0",
  overlay: "fixed right-1 top-1 z-30 w-[min(360px,calc(100vw-2rem))]",
};

/** Shared shell for contextual book and collection metadata. */
export default function DetailsSidebar({
  children,
  ariaLabel,
  contentKey,
  variant = "inline",
  reduceMotion = false,
  className = "",
}: DetailsSidebarProps) {
  return (
    <motion.aside
      key={contentKey}
      aria-label={ariaLabel}
      initial={reduceMotion ? false : { opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`${sidebarClasses[variant]} flex h-[calc(100dvh-0.5rem)] flex-col overflow-y-auto rounded-lg border border-sidebar-border bg-sidebar px-6 pb-8 pt-7 text-sidebar-foreground shadow-xs ${className}`}
    >
      {children}
    </motion.aside>
  );
}
