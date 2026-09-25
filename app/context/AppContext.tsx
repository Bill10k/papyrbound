"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getLibrary,
  importBook,
  openBookFileDialog,
  deleteBook,
  getBookDetails,
  getAllHighlights,
  getAllBookmarks,
} from "../lib/api";
import type { BookDetails, Bookmark, BookSummary, Highlight } from "../types/epub";

interface AppContextType {
  books: BookSummary[];
  highlights: Highlight[];
  bookmarks: Bookmark[];
  isLoading: boolean;
  isImporting: boolean;
  errorMessage: string | null;
  activeReadingBook: BookDetails | null;
  initialChapterIndex?: number;
  openBook: (bookOrId: BookDetails | string, chapterIdx?: number) => Promise<void>;
  closeReader: () => void;
  importNewBook: () => Promise<void>;
  refreshData: () => Promise<void>;
  deleteBookById: (bookId: string) => Promise<void>;
  setErrorMessage: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeReadingBook, setActiveReadingBook] = useState<BookDetails | null>(null);
  const [initialChapterIndex, setInitialChapterIndex] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [libData, hls, bms] = await Promise.all([
        getLibrary().catch(() => []),
        getAllHighlights().catch(() => []),
        getAllBookmarks().catch(() => []),
      ]);
      setBooks(libData);
      setHighlights(hls);
      setBookmarks(bms);
    } catch (err) {
      console.warn("Failed to load data from SQLite:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const openBook = async (bookOrId: BookDetails | string, chapterIdx?: number) => {
    try {
      setInitialChapterIndex(chapterIdx);
      if (typeof bookOrId === "string") {
        const details = await getBookDetails(bookOrId);
        setActiveReadingBook(details);
      } else {
        setActiveReadingBook(bookOrId);
      }
    } catch (err) {
      console.error("Failed to open book:", err);
      setErrorMessage("Could not load book content");
    }
  };

  const closeReader = () => {
    setActiveReadingBook(null);
    setInitialChapterIndex(undefined);
    refreshData();
  };

  const importNewBook = async () => {
    setIsImporting(true);
    setErrorMessage(null);
    try {
      const filePath = await openBookFileDialog();
      if (!filePath) {
        setIsImporting(false);
        return;
      }
      const newBook = await importBook(filePath);
      await refreshData();
      await openBook(newBook);
    } catch (err) {
      console.error("Import failed:", err);
      setErrorMessage(typeof err === "string" ? err : "Failed to import book");
    } finally {
      setIsImporting(false);
    }
  };

  const deleteBookById = async (bookId: string) => {
    try {
      await deleteBook(bookId);
      await refreshData();
    } catch (err) {
      console.error("Delete failed:", err);
      setErrorMessage("Failed to delete book");
    }
  };

  return (
    <AppContext.Provider
      value={{
        books,
        highlights,
        bookmarks,
        isLoading,
        isImporting,
        errorMessage,
        activeReadingBook,
        initialChapterIndex,
        openBook,
        closeReader,
        importNewBook,
        refreshData,
        deleteBookById,
        setErrorMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
