"use client";

import React from "react";
import { AppProvider, useApp } from "../context/AppContext";
import Sidebar from "./sidebar/sidebar";
import Reader from "./Reader";

function InnerShell({ children }: { children: React.ReactNode }) {
  const { activeReadingBook, initialChapterIndex, closeReader, errorMessage, setErrorMessage } = useApp();

  return (
    <div className="grid min-h-dvh grid-cols-[288px_minmax(0,1fr)] bg-mono-100">
      <div className="pl-1">
        <Sidebar />
      </div>
      <div className="min-w-0 pl-0 flex flex-col relative overflow-hidden">
        {errorMessage && (
          <div className="flex items-center justify-between bg-red-100 dark:bg-red-950/80 border-b border-red-200 dark:border-red-900 px-6 py-2.5 text-xs text-red-700 dark:text-red-300 shrink-0 z-10">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-semibold underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>

      {/* Live Reader Fullscreen Overlay */}
      {activeReadingBook && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <Reader
            book={activeReadingBook}
            initialChapterIndex={initialChapterIndex}
            onClose={closeReader}
          />
        </div>
      )}
    </div>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <InnerShell>{children}</InnerShell>
    </AppProvider>
  );
}
