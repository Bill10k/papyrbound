"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  getLibrary,
  importBook,
  openBookFileDialog,
  deleteBook,
  getBookDetails,
  getAllHighlights,
  getAllBookmarks,
  deleteHighlight,
  deleteBookmark,
} from "./lib/api";
import type { BookDetails, Bookmark, BookSummary, Highlight } from "./types/epub";
import Reader from "./components/Reader";
import Sidebar, { PageTab } from "./components/Sidebar";
import HomeView from "./components/HomeView";
import LibraryView from "./components/LibraryView";
import CollectionsView from "./components/CollectionsView";
import AnnotationsView from "./components/AnnotationsView";
import InsightsView from "./components/InsightsView";
import SettingsView from "./components/SettingsView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<PageTab>("home");
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedBookDetails, setSelectedBookDetails] = useState<BookDetails | null>(null);
  const [activeReadingBook, setActiveReadingBook] = useState<BookDetails | null>(null);
  const [initialChapterIndex, setInitialChapterIndex] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [, startTransition] = useTransition();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [libData, hls, bms] = await Promise.all([
        getLibrary().catch(() => []),
        getAllHighlights().catch(() => []),
        getAllBookmarks().catch(() => []),
      ]);
      setBooks(libData);
      setHighlights(hls);
      setBookmarks(bms);
      if (libData.length > 0 && !selectedBookId) {
        setSelectedBookId(libData[0].id);
      }
    } catch (err) {
      console.warn("Error loading data from SQLite:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBookId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch book details when selection changes
  useEffect(() => {
    if (!selectedBookId) {
      setSelectedBookDetails(null);
      return;
    }

    let isMounted = true;
    getBookDetails(selectedBookId)
      .then((details) => {
        if (isMounted) setSelectedBookDetails(details);
      })
      .catch((err) => {
        console.error("Failed to load book details:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBookId]);

  async function handleImport() {
    setErrorMessage(null);
    try {
      const filePath = await openBookFileDialog();
      if (!filePath) return;

      setIsImporting(true);
      const newBook = await importBook(filePath);

      startTransition(() => {
        setBooks((prev) => {
          const exists = prev.some((b) => b.id === newBook.id);
          if (exists) return prev;
          return [
            {
              id: newBook.id,
              title: newBook.title,
              author: newBook.author,
              cover_image: newBook.cover_image,
              total_chapters: newBook.total_chapters,
              current_chapter: 0,
              progress_percent: 0,
              last_read_at: null,
              created_at: newBook.created_at,
              file_path: newBook.file_path,
            },
            ...prev,
          ];
        });
        setSelectedBookId(newBook.id);
        setSelectedBookDetails(newBook);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to import file: ${msg}`);
    } finally {
      setIsImporting(false);
    }
  }

  async function handleDelete(bookId: string) {
    if (!confirm("Are you sure you want to remove this book from your library?")) {
      return;
    }
    try {
      await deleteBook(bookId);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      if (selectedBookId === bookId) {
        const remaining = books.filter((b) => b.id !== bookId);
        setSelectedBookId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      setErrorMessage(`Failed to delete book: ${err}`);
    }
  }

  async function handleOpenBook(bookId: string, chapterIndex?: number) {
    try {
      const details = await getBookDetails(bookId);
      setSelectedBookId(bookId);
      setSelectedBookDetails(details);
      setInitialChapterIndex(chapterIndex);
      setActiveReadingBook(details);
    } catch (err) {
      setErrorMessage(`Failed to open reader: ${err}`);
    }
  }

  async function handleDeleteHighlight(id: string) {
    try {
      await deleteHighlight(id);
      setHighlights((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Failed to delete highlight:", err);
    }
  }

  async function handleDeleteBookmark(id: string) {
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
    }
  }

  return (
    <main className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* Active Reader Overlay View */}
      {activeReadingBook && (
        <Reader
          book={activeReadingBook}
          initialChapterIndex={initialChapterIndex}
          onClose={() => {
            setActiveReadingBook(null);
            setInitialChapterIndex(undefined);
            loadData(); // refresh progress indicators
          }}
        />
      )}

      {/* Main Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        libraryCount={books.length}
        annotationsCount={highlights.length + bookmarks.length}
        collectionsCount={5}
      />

      {/* Center Viewport Switcher */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Error alert if present */}
        {errorMessage && (
          <div className="flex items-center justify-between bg-destructive/10 border-b border-destructive/20 px-6 py-2.5 text-xs text-destructive shrink-0">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="font-semibold underline ml-4 cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === "home" && (
          <HomeView
            books={books}
            onOpenBook={(id) => handleOpenBook(id)}
            onNavigateToLibrary={() => setActiveTab("library")}
            onImport={handleImport}
            isImporting={isImporting}
          />
        )}

        {activeTab === "library" && (
          <LibraryView
            books={books}
            selectedBookId={selectedBookId}
            selectedBookDetails={selectedBookDetails}
            onSelectBook={setSelectedBookId}
            onOpenBook={(id) => handleOpenBook(id)}
            onDeleteBook={handleDelete}
            onImport={handleImport}
            isImporting={isImporting}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {activeTab === "collections" && (
          <CollectionsView
            books={books}
            onOpenBook={(id) => handleOpenBook(id)}
          />
        )}

        {activeTab === "annotations" && (
          <AnnotationsView
            highlights={highlights}
            bookmarks={bookmarks}
            books={books}
            onOpenBookToChapter={(bookId, chIdx) => handleOpenBook(bookId, chIdx)}
            onDeleteHighlight={handleDeleteHighlight}
            onDeleteBookmark={handleDeleteBookmark}
          />
        )}

        {activeTab === "insights" && (
          <InsightsView
            onOpenBook={(book) => setActiveReadingBook(book)}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            booksCount={books.length}
            highlightsCount={highlights.length}
            bookmarksCount={bookmarks.length}
          />
        )}
      </div>
    </main>
  );
}
