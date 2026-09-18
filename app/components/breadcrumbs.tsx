"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, House } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/library": "Library",
  "/collection": "Collection",
  "/settings": "Settings",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const currentLabel = routeLabels[pathname] ?? "Home";
  const isHome = pathname === "/";

  return (
    <nav aria-label="Breadcrumb" className="flex h-11 items-center gap-2 px-5 text-xs text-mono-500">
      <Link
        href="/"
        aria-label="Home"
        className="inline-flex items-center gap-1.5 transition-colors hover:text-mono-800"
      >
        <House aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
        <span className={isHome ? "text-mono-800" : undefined}>Home</span>
      </Link>
      {!isHome && (
        <>
          <ChevronRight aria-hidden="true" className="size-3 text-mono-400" strokeWidth={1.5} />
          <span aria-current="page" className="text-mono-800">
            {currentLabel}
          </span>
        </>
      )}
    </nav>
  );
}
